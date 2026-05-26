import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { geocoderAdresse } from '../lib/geocodage';
import type { MatchCdm } from '../types/base';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import { libellePhase } from '../utils/libelles';
import { slugifierMatch } from '../utils/slugMatch';
import { IconePin, IconeBallon } from './ui/Icone';
import { Spinner } from './ui/Spinner';

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

type EtatGeoloc =
  | { type: 'aucune' }
  | { type: 'demande' }
  | { type: 'ok'; lat: number; lng: number }
  | { type: 'refusee'; raison: string };

export function MoteurRecherche() {
  const [matchs, setMatchs] = useState<MatchCdm[]>([]);
  const [matchId, setMatchId] = useState('');
  const [ville, setVille] = useState('');
  const [rayon, setRayon] = useState(25);
  const [geoloc, setGeoloc] = useState<EtatGeoloc>({ type: 'aucune' });
  const [resultats, setResultats] = useState<ResultatBar[] | null>(null);
  const [enRecherche, setEnRecherche] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      const { data, error } = await supabase
        .from('matchs')
        .select('*')
        .order('coup_envoi_utc', { ascending: true });
      if (!actif) return;
      if (error) setErreur(error.message);
      else setMatchs(data ?? []);
    })();
    return () => {
      actif = false;
    };
  }, []);

  const matchSelectionne = useMemo(
    () => matchs.find((m) => m.id === matchId) ?? null,
    [matchs, matchId],
  );

  function demanderGeoloc() {
    if (!('geolocation' in navigator)) {
      setGeoloc({
        type: 'refusee',
        raison: "La géolocalisation n'est pas disponible dans ce navigateur.",
      });
      return;
    }
    setGeoloc({ type: 'demande' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoloc({
          type: 'ok',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setGeoloc({
          type: 'refusee',
          raison:
            err.code === err.PERMISSION_DENIED
              ? 'Permission refusée. Saisissez votre ville à la place.'
              : 'Position introuvable. Saisissez votre ville à la place.',
        });
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  async function rechercher(e: FormEvent) {
    e.preventDefault();
    if (!matchId) return;
    setEnRecherche(true);
    setErreur(null);

    const params: Record<string, unknown> = {
      _match_id: matchId,
      _rayon_km: rayon,
    };

    if (geoloc.type === 'ok') {
      params._lat = geoloc.lat;
      params._lng = geoloc.lng;
    } else if (ville.trim()) {
      // Géocoder la ville saisie pour appliquer le rayon autour de son
      // centre. Si le géocodage échoue, on retombe sur un match par nom
      // de ville (sans contrainte géographique).
      const r = await geocoderAdresse(ville.trim());
      if (r) {
        params._lat = r.latitude;
        params._lng = r.longitude;
      } else {
        params._ville = ville.trim();
      }
    }

    const { data, error } = await supabase.rpc('rechercher_bars', params);
    if (error) {
      setErreur(error.message);
      setResultats([]);
    } else {
      setResultats((data ?? []) as ResultatBar[]);
    }
    setEnRecherche(false);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={rechercher}
        className="rounded-2xl border border-marine-100 bg-white p-6 shadow-carte sm:p-7"
      >
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-marine-800">
            <IconeBallon className="h-4 w-4 text-bleu-500" />
            Quel match cherchez-vous ?
          </span>
          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="champ-saisie"
            required
          >
            <option value="">— Sélectionner un match —</option>
            {matchs.map((m) => (
              <option key={m.id} value={m.id}>
                #{m.numero_match.toString().padStart(3, '0')} ·{' '}
                {libellePhase[m.phase]} · {m.equipe_domicile} – {m.equipe_exterieur}
              </option>
            ))}
          </select>
          {matchSelectionne && (
            <p className="mt-2 text-xs text-marine-500">
              Coup d'envoi :{' '}
              {formaterDateHeure(
                matchSelectionne.coup_envoi_utc,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
              )}{' '}
              ({libelleFuseau(
                matchSelectionne.coup_envoi_utc,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
              )}
              ) · {matchSelectionne.stade}, {matchSelectionne.ville_hote}.
            </p>
          )}
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-marine-800">
              <IconePin className="h-4 w-4 text-bleu-500" />
              Ville (optionnel)
            </span>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Paris, Lyon, Marseille…"
              className="champ-saisie"
              autoComplete="address-level2"
            />
          </label>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={demanderGeoloc}
              disabled={geoloc.type === 'demande'}
              className={
                geoloc.type === 'ok'
                  ? 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-bleu-200 bg-bleu-50 px-4 py-2.5 text-sm font-semibold text-bleu-700 transition hover:bg-bleu-100'
                  : 'bouton-secondaire whitespace-nowrap'
              }
            >
              <IconePin className="h-4 w-4" />
              {geoloc.type === 'demande'
                ? 'Localisation…'
                : geoloc.type === 'ok'
                  ? 'Position détectée'
                  : 'Autour de moi'}
            </button>
            {geoloc.type === 'refusee' && (
              <p className="text-xs text-amber-700">{geoloc.raison}</p>
            )}
            {geoloc.type === 'ok' && (
              <button
                type="button"
                onClick={() => setGeoloc({ type: 'aucune' })}
                className="text-xs text-marine-500 underline hover:text-marine-700"
              >
                effacer ma position
              </button>
            )}
          </div>
        </div>

        {(geoloc.type === 'ok' || ville.trim() !== '') && (
          <label className="mt-5 block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-marine-800">
              Rayon de recherche
              <span className="text-bleu-600">{rayon} km</span>
            </span>
            <input
              type="range"
              min={2}
              max={100}
              step={1}
              value={rayon}
              onChange={(e) => setRayon(Number(e.target.value))}
              className="w-full accent-bleu-500"
              aria-label={`Rayon de recherche : ${rayon} kilomètres`}
            />
          </label>
        )}

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={!matchId || enRecherche}
          className="bouton-primaire mt-6 w-full text-base"
          aria-busy={enRecherche}
        >
          {enRecherche && <Spinner className="h-4 w-4" />}
          {enRecherche ? 'Recherche en cours…' : 'Trouver un bar'}
        </button>
      </form>

      {resultats !== null && (
        <ListeResultats resultats={resultats} matchSelectionne={matchSelectionne} />
      )}
    </div>
  );
}

interface PropsListe {
  resultats: ResultatBar[];
  matchSelectionne: MatchCdm | null;
}

function ListeResultats({ resultats, matchSelectionne }: PropsListe) {
  if (resultats.length === 0) {
    return (
      <div className="carte text-center text-sm text-marine-600">
        Aucun bar ne diffuse encore ce match dans le périmètre choisi.
        <br />
        Élargissez la zone ou choisissez un autre match.
      </div>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-marine-900">
          {resultats.length} bar{resultats.length > 1 ? 's' : ''} trouvé
          {resultats.length > 1 ? 's' : ''}
        </h2>
        {matchSelectionne && (
          <Link
            to={`/matchs/${slugifierMatch(matchSelectionne)}`}
            className="text-sm font-semibold text-bleu-600 hover:text-bleu-700"
          >
            Voir la page du match →
          </Link>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {resultats.map((r) => {
          const complet = r.places_restantes <= 0;
          return (
            <li
              key={r.diffusion_id}
              className="group relative overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-carte transition hover:-translate-y-0.5 hover:shadow-carteHover"
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-bleu-500" />
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 pl-6">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-marine-900">{r.nom}</h3>
                  {r.adresse && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-marine-500">
                      <IconePin className="h-3.5 w-3.5 shrink-0" />
                      {r.adresse}
                    </p>
                  )}
                  {matchSelectionne && (
                    <p className="mt-2 text-sm text-marine-700">
                      <span className="text-marine-500">Coup d'envoi local : </span>
                      <span className="font-medium">
                        {formaterDateHeure(
                          matchSelectionne.coup_envoi_utc,
                          r.fuseau_horaire,
                        )}
                      </span>{' '}
                      <span className="text-marine-600">
                        ({libelleFuseau(
                          matchSelectionne.coup_envoi_utc,
                          r.fuseau_horaire,
                        )}
                        )
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {r.distance_km !== null && (
                    <span className="pastille-distance">
                      <IconePin className="h-3 w-3" />
                      {r.distance_km < 1
                        ? `${Math.round(r.distance_km * 1000)} m`
                        : `${r.distance_km.toFixed(1)} km`}
                    </span>
                  )}
                  {complet ? (
                    <span className="badge bg-red-50 text-red-700">
                      Complet
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-marine-600">
                      {r.places_restantes}/{r.places_disponibles} places
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-marine-50 bg-marine-50/40 px-5 py-3 pl-6">
                <Link
                  to={`/etablissements/${r.slug_public}`}
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
    </section>
  );
}
