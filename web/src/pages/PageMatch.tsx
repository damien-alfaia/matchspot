import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { MatchCdm } from '../types/base';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { EnTeteSEO } from '../composants/EnTeteSEO';
import { SqueletteLigne, SqueletteListe } from '../composants/ui/Squelette';
import { BadgeMatchPhare } from '../composants/ui/BadgeMatchPhare';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import { libellePhase } from '../utils/libelles';
import { extraireNumeroMatch, slugifierMatch } from '../utils/slugMatch';

interface ResultatBar {
  etablissement_id: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  slug_public: string;
  fuseau_horaire: string;
  diffusion_id: string;
  places_disponibles: number;
  places_restantes: number;
  distance_km: number | null;
}

export function PageMatch() {
  const { slugMatch } = useParams<{ slugMatch: string }>();
  const numero = useMemo(() => extraireNumeroMatch(slugMatch), [slugMatch]);

  const [match, setMatch] = useState<MatchCdm | null>(null);
  const [bars, setBars] = useState<ResultatBar[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [introuvable, setIntrouvable] = useState(false);

  const charger = useCallback(async () => {
    if (numero === null) {
      setIntrouvable(true);
      setChargement(false);
      return;
    }
    setChargement(true);
    setErreur(null);

    const { data: m, error: errMatch } = await supabase
      .from('matchs')
      .select('*')
      .eq('numero_match', numero)
      .maybeSingle();

    if (errMatch) {
      setErreur(errMatch.message);
      setChargement(false);
      return;
    }
    if (!m) {
      setIntrouvable(true);
      setChargement(false);
      return;
    }
    setMatch(m);

    const { data: barsData, error: errBars } = await supabase.rpc(
      'rechercher_bars',
      { _match_id: m.id, _rayon_km: 1000 },
    );
    if (errBars) {
      setErreur(errBars.message);
    } else {
      setBars((barsData ?? []) as ResultatBar[]);
    }
    setChargement(false);
  }, [numero]);

  useEffect(() => {
    void charger();
  }, [charger]);

  // Redirection canonique : si l'URL ne correspond pas au slug officiel,
  // on redirige vers /matchs/:slugCanonique (bénéfice SEO).
  if (match && slugMatch) {
    const slugCanonique = slugifierMatch(match);
    if (slugMatch !== slugCanonique) {
      return <Navigate to={`/matchs/${slugCanonique}`} replace />;
    }
  }

  if (introuvable) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-6xl">⚽</p>
          <h1 className="mt-6 text-3xl font-bold text-marine-900">
            Match introuvable
          </h1>
          <p className="mt-2 text-marine-600">
            Le match demandé n'existe pas dans le calendrier de la Coupe du
            Monde 2026.
          </p>
          <Link to="/" className="bouton-primaire mt-6 inline-flex">
            Retour à la recherche
          </Link>
        </main>
      </div>
    );
  }

  if (chargement || !match) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="mx-auto max-w-3xl space-y-6 px-4 py-12"
          aria-busy="true"
        >
          <SqueletteLigne width="w-1/4" height="h-3" />
          <SqueletteLigne width="w-3/4" height="h-10" />
          <SqueletteLigne width="w-1/2" height="h-4" />
          <SqueletteListe nombre={3} labelChargement="Chargement du match…" />
        </main>
      </div>
    );
  }

  const fuseauVisiteur = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const titreSEO = `${match.equipe_domicile} – ${match.equipe_exterieur} : où voir le match en direct ? | MatchSpot`;
  const descriptionSEO =
    `Trouvez un bar ou un restaurant qui diffuse ${match.equipe_domicile} contre ${match.equipe_exterieur} ` +
    `(match #${match.numero_match}, ${libellePhase[match.phase]} de la Coupe du Monde 2026) ` +
    `au ${match.stade} à ${match.ville_hote}. Réservez votre table.`;

  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre={titreSEO}
        description={descriptionSEO}
        ogImage={
          typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : undefined
        }
        ogUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
      />

      <div className="bg-heroMarine text-white">
        <Entete />
        <header className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:pb-16">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bleu-200">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5">
              Match #{match.numero_match}
            </span>
            <span>{libellePhase[match.phase]}</span>
            <BadgeMatchPhare match={match} />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {match.equipe_domicile}{' '}
            <span className="font-normal text-marine-300">vs</span>{' '}
            {match.equipe_exterieur}
          </h1>
          <p className="mt-3 text-base text-marine-100 sm:text-lg">
            <span className="font-semibold">
              {formaterDateHeure(match.coup_envoi_utc, fuseauVisiteur)}
            </span>{' '}
            <span className="text-marine-300">
              ({libelleFuseau(match.coup_envoi_utc, fuseauVisiteur)} — votre fuseau)
            </span>
          </p>
          <p className="mt-1 text-sm text-marine-200">
            {match.stade}, {match.ville_hote}
          </p>
        </header>
      </div>

      <main id="contenu-principal" tabIndex={-1} className="mx-auto -mt-8 max-w-3xl space-y-6 px-4 pb-16">
        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <section>
          <h2 className="text-xl font-bold text-marine-900">
            {bars.length === 0
              ? 'Aucun bar partenaire ne diffuse encore ce match'
              : `${bars.length} bar${bars.length > 1 ? 's' : ''} partenaire${bars.length > 1 ? 's' : ''} diffuse${bars.length > 1 ? 'nt' : ''} ce match`}
          </h2>

          {bars.length === 0 ? (
            <div className="mt-4 carte text-center text-sm text-marine-600">
              <p>
                Aucun bar inscrit sur MatchSpot ne diffuse encore{' '}
                {match.equipe_domicile} – {match.equipe_exterieur}.
              </p>
              <p className="mt-2">
                Vous gérez un bar et vous diffusez ce match ?{' '}
                <Link
                  to="/inscription-pro"
                  className="font-semibold text-bleu-600 hover:underline"
                >
                  Référencez-vous en 2 minutes →
                </Link>
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {bars.map((b) => {
                const complet = b.places_restantes <= 0;
                return (
                  <li
                    key={b.diffusion_id}
                    className="group relative overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-carte transition hover:-translate-y-0.5 hover:shadow-carteHover"
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-bleu-500" />
                    <div className="flex flex-wrap items-start justify-between gap-3 p-5 pl-6">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-marine-900">
                          {b.nom}
                        </h3>
                        {b.adresse && (
                          <p className="mt-0.5 text-sm text-marine-500">
                            {b.adresse}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-marine-700">
                          <span className="text-marine-500">Coup d'envoi local : </span>
                          <span className="font-medium">
                            {formaterDateHeure(match.coup_envoi_utc, b.fuseau_horaire)}
                          </span>{' '}
                          <span className="text-marine-600">
                            ({libelleFuseau(match.coup_envoi_utc, b.fuseau_horaire)})
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        {complet ? (
                          <span className="badge bg-red-50 text-red-700">
                            Complet
                          </span>
                        ) : (
                          <>
                            <p
                              className={`text-2xl font-bold ${
                                b.places_restantes < 5
                                  ? 'text-red-600'
                                  : 'text-bleu-600'
                              }`}
                            >
                              {b.places_restantes}
                            </p>
                            <p className="text-xs text-marine-500">
                              / {b.places_disponibles} places
                            </p>
                            {b.places_restantes < 5 && (
                              <span className="mt-1 inline-flex animate-pulse items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                Vite !
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-marine-50 bg-marine-50/40 px-5 py-3 pl-6">
                      <Link
                        to={`/etablissements/${b.slug_public}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-bleu-600 hover:text-bleu-700"
                      >
                        Voir et réserver
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="carte">
          <h2 className="text-lg font-bold text-marine-900">À propos du match</h2>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-marine-500">Phase</dt>
              <dd className="font-medium text-marine-900">
                {libellePhase[match.phase]}
              </dd>
            </div>
            <div>
              <dt className="text-marine-500">Match numéro</dt>
              <dd className="font-medium text-marine-900">
                #{match.numero_match} / 104
              </dd>
            </div>
            <div>
              <dt className="text-marine-500">Stade</dt>
              <dd className="font-medium text-marine-900">{match.stade}</dd>
            </div>
            <div>
              <dt className="text-marine-500">Ville hôte</dt>
              <dd className="font-medium text-marine-900">{match.ville_hote}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-marine-500">Coup d'envoi (UTC)</dt>
              <dd className="font-mono text-xs text-marine-700">
                {match.coup_envoi_utc}
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <Footer />
    </div>
  );
}
