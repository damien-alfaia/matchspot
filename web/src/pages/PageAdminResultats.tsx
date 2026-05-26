import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { MatchCdm } from '../types/base';
import { Entete } from '../composants/Entete';
import { SqueletteListe } from '../composants/ui/Squelette';
import { libellePhase } from '../utils/libelles';
import { formaterDateHeure } from '../utils/fuseaux';

interface ResultatLigne {
  numero_match: number;
  gagnant: string;
  perdant: string;
  saisi_le: string;
}

export function PageAdminResultats() {
  const [matchs, setMatchs] = useState<MatchCdm[]>([]);
  const [resultats, setResultats] = useState<ResultatLigne[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [autorise, setAutorise] = useState<boolean | null>(null);

  // Saisie d'un nouveau résultat
  const [numeroMatch, setNumeroMatch] = useState<number | ''>('');
  const [gagnant, setGagnant] = useState('');
  const [perdant, setPerdant] = useState('');
  const [enSoumission, setEnSoumission] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    const [resMatchs, resResultats, resAdhesion] = await Promise.all([
      supabase
        .from('matchs')
        .select('*')
        .order('numero_match', { ascending: true }),
      supabase
        .from('resultats_matchs')
        .select('*')
        .order('numero_match', { ascending: true }),
      supabase
        .from('adhesions')
        .select('role')
        .eq('role', 'proprietaire')
        .limit(1)
        .maybeSingle(),
    ]);
    if (resMatchs.error) setErreur(resMatchs.error.message);
    else setMatchs((resMatchs.data ?? []) as MatchCdm[]);
    if (!resResultats.error) setResultats((resResultats.data ?? []) as ResultatLigne[]);
    setAutorise(!!resAdhesion.data);
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    if (!numeroMatch) return;
    setEnSoumission(true);
    setErreur(null);
    setInfo(null);

    const { error } = await supabase.from('resultats_matchs').upsert(
      {
        numero_match: numeroMatch,
        gagnant: gagnant.trim(),
        perdant: perdant.trim(),
        saisi_le: new Date().toISOString(),
      },
      { onConflict: 'numero_match' },
    );

    if (error) {
      setErreur(error.message);
      setEnSoumission(false);
      return;
    }

    const { data, error: errPropag } = await supabase.rpc('propager_qualifies');
    if (errPropag) {
      setErreur(`Saisie OK mais propagation échouée : ${errPropag.message}`);
    } else {
      setInfo(`Résultat enregistré. ${data ?? 0} placeholders résolus.`);
      setNumeroMatch('');
      setGagnant('');
      setPerdant('');
      await charger();
    }
    setEnSoumission(false);
  }

  const matchsTermines = new Set(resultats.map((r) => r.numero_match));

  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="mx-auto max-w-5xl px-4 py-8"
          aria-busy="true"
        >
          <SqueletteListe nombre={4} labelChargement="Chargement des résultats…" />
        </main>
      </div>
    );
  }

  if (autorise === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-12">
          <div className="carte text-center">
            <h1 className="text-xl font-bold text-marine-900 dark:text-marine-50">Accès refusé</h1>
            <p className="mt-2 text-sm text-marine-600 dark:text-marine-300">
              Cette page est réservée aux propriétaires d'organisations
              MatchSpot.
            </p>
            <Link to="/tableau-de-bord" className="mt-4 inline-block bouton-secondaire">
              Retour au tableau de bord
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
      <Entete />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
            Admin MatchSpot
          </p>
          <h1 className="mt-1 text-3xl font-bold text-marine-900 dark:text-marine-50">
            Résultats des matchs
          </h1>
          <p className="mt-1 text-sm text-marine-600 dark:text-marine-300">
            Saisissez le vainqueur et le perdant de chaque match terminé. Les
            placeholders « Vainqueur 16e #N » des matchs suivants sont
            automatiquement résolus.
          </p>
        </div>

        <form onSubmit={soumettre} className="carte space-y-4">
          <h2 className="text-lg font-bold text-marine-900 dark:text-marine-50">
            Saisir un résultat
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800 dark:text-marine-100">
                Match
              </span>
              <select
                required
                value={numeroMatch}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setNumeroMatch(n);
                  const m = matchs.find((x) => x.numero_match === n);
                  if (m && !m.equipe_domicile.startsWith('Vainqueur') && !m.equipe_domicile.startsWith('1er') && !m.equipe_domicile.startsWith('2e') && !m.equipe_domicile.startsWith('Meilleur')) {
                    setGagnant(m.equipe_domicile);
                    setPerdant(m.equipe_exterieur);
                  }
                }}
                className="champ-saisie"
              >
                <option value="">— Sélectionner —</option>
                {matchs.map((m) => (
                  <option key={m.numero_match} value={m.numero_match}>
                    #{m.numero_match} ({libellePhase[m.phase]}) ·{' '}
                    {m.equipe_domicile} – {m.equipe_exterieur}
                    {matchsTermines.has(m.numero_match) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800 dark:text-marine-100">
                Vainqueur
              </span>
              <input
                type="text"
                required
                value={gagnant}
                onChange={(e) => setGagnant(e.target.value)}
                className="champ-saisie"
                placeholder="Ex : France"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-marine-800 dark:text-marine-100">
                Perdant
              </span>
              <input
                type="text"
                required
                value={perdant}
                onChange={(e) => setPerdant(e.target.value)}
                className="champ-saisie"
                placeholder="Ex : Argentine"
              />
            </label>
          </div>

          {erreur && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {erreur}
            </p>
          )}
          {info && (
            <p className="rounded-md bg-bleu-50 dark:bg-bleu-950/40 px-3 py-2 text-sm text-bleu-700">
              {info}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={enSoumission} className="bouton-primaire">
              {enSoumission ? 'Enregistrement…' : 'Enregistrer et propager'}
            </button>
          </div>
        </form>

        <section>
          <h2 className="mb-3 text-lg font-bold text-marine-900 dark:text-marine-50">
            Résultats déjà saisis ({resultats.length})
          </h2>
          {resultats.length === 0 ? (
            <p className="text-sm text-marine-600 dark:text-marine-300">Aucun résultat enregistré.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {resultats.map((r) => {
                const m = matchs.find((x) => x.numero_match === r.numero_match);
                return (
                  <li key={r.numero_match} className="carte flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-marine-900 dark:text-marine-50">
                        Match #{r.numero_match}
                        {m && (
                          <span className="ml-2 text-marine-500 dark:text-marine-400">
                            ({libellePhase[m.phase]} ·{' '}
                            {formaterDateHeure(m.coup_envoi_utc, 'Europe/Paris')})
                          </span>
                        )}
                      </p>
                      <p className="text-marine-700 dark:text-marine-200">
                        <span className="font-medium text-bleu-700">{r.gagnant}</span>{' '}
                        <span className="text-marine-600 dark:text-marine-300">bat</span>{' '}
                        {r.perdant}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
