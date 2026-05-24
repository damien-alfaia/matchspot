import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { FormulaireReservation } from '../composants/FormulaireReservation';
import { BoutonPartager } from '../composants/BoutonPartager';
import { EnTeteSEO } from '../composants/EnTeteSEO';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import { libellePhase } from '../utils/libelles';
import { slugifierMatch } from '../utils/slugMatch';
import { Link } from 'react-router-dom';

export function PagePublique() {
  const { slug } = useParams<{ slug: string }>();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [diffusions, setDiffusions] = useState<DiffusionAvecMatch[]>([]);
  const [soldes, setSoldes] = useState<Record<string, number>>({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    if (!slug) return;
    setChargement(true);
    setErreur(null);

    const { data: etab, error: errEtab } = await supabase
      .from('etablissements')
      .select('*')
      .eq('slug_public', slug)
      .maybeSingle();

    if (errEtab) {
      setErreur(errEtab.message);
      setChargement(false);
      return;
    }
    if (!etab) {
      setEtablissement(null);
      setChargement(false);
      return;
    }
    setEtablissement(etab);

    const { data: diffs, error: errDiffs } = await supabase
      .from('diffusions')
      .select('*, matchs(*)')
      .eq('etablissement_id', etab.id)
      .eq('statut', 'publiee')
      .eq('est_publique', true);

    if (errDiffs) {
      setErreur(errDiffs.message);
      setChargement(false);
      return;
    }

    const triees = ((diffs ?? []) as DiffusionAvecMatch[]).sort((a, b) =>
      a.matchs.coup_envoi_utc.localeCompare(b.matchs.coup_envoi_utc),
    );
    setDiffusions(triees);

    if (triees.length > 0) {
      const { data: soldesData, error: errSoldes } = await supabase.rpc(
        'soldes_places_diffusions',
        { _diffusion_ids: triees.map((d) => d.id) },
      );
      if (errSoldes) {
        setErreur(errSoldes.message);
      } else {
        const map: Record<string, number> = {};
        for (const s of (soldesData ?? []) as Array<{
          diffusion_id: string;
          places_restantes: number;
        }>) {
          map[s.diffusion_id] = s.places_restantes;
        }
        setSoldes(map);
      }
    } else {
      setSoldes({});
    }
    setChargement(false);
  }, [slug]);

  useEffect(() => {
    charger();
  }, [charger]);

  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <p className="mx-auto max-w-3xl px-4 py-8 text-slate-500">Chargement…</p>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Entete />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Établissement introuvable
          </h1>
          <p className="mt-2 text-slate-600">
            Vérifiez l'URL ou contactez le bar directement.
          </p>
        </main>
      </div>
    );
  }

  const lienGoogleMaps = etablissement.adresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        etablissement.adresse,
      )}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <EnTeteSEO
        titre={`${etablissement.nom} — Soirées Coupe du Monde 2026 | MatchSpot`}
        description={
          etablissement.description_courte ??
          `Réservez votre soirée Coupe du Monde 2026 à ${etablissement.nom}${
            etablissement.ville ? `, ${etablissement.ville}` : ''
          }. Diffusions, capacité, réservation en ligne.`
        }
        ogImage={etablissement.url_photo ?? `${window.location.origin}/logo.png`}
        ogUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        type="place"
      />
      <div className="bg-heroMarine text-white">
        <Entete />
        <header className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:pb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-200">
            Bar partenaire MatchSpot
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {etablissement.nom}
          </h1>
          {etablissement.adresse && (
            <p className="mt-2 text-marine-100">{etablissement.adresse}</p>
          )}
          {etablissement.description_courte && (
            <p className="mt-3 text-base text-white/90">
              {etablissement.description_courte}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {etablissement.telephone && (
              <a
                href={`tel:${etablissement.telephone.replace(/\s/g, '')}`}
                className="badge bg-white/10 text-white hover:bg-white/20"
              >
                📞 {etablissement.telephone}
              </a>
            )}
            {lienGoogleMaps && (
              <a
                href={lienGoogleMaps}
                target="_blank"
                rel="noreferrer"
                className="badge bg-white/10 text-white hover:bg-white/20"
              >
                📍 Itinéraire
              </a>
            )}
            <span className="badge bg-white/10 text-white">
              🕐 {etablissement.fuseau_horaire}
            </span>
            <BoutonPartager
              url={typeof window !== 'undefined' ? window.location.href : ''}
              titre={`${etablissement.nom} sur MatchSpot`}
              texte={`Découvrez les soirées Coupe du Monde 2026 à ${etablissement.nom}`}
              className="badge bg-white text-marine-900 hover:bg-marine-50"
            />
          </div>
        </header>
      </div>

      {etablissement.url_photo && (
        <div className="mx-auto -mt-6 max-w-3xl px-4">
          <img
            src={etablissement.url_photo}
            alt={`Photo de ${etablissement.nom}`}
            className="h-48 w-full rounded-2xl border border-marine-100 object-cover shadow-carte sm:h-64"
          />
        </div>
      )}

      {etablissement.photos_supplementaires &&
        etablissement.photos_supplementaires.length > 0 && (
          <div className="mx-auto mt-4 max-w-3xl px-4">
            <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {etablissement.photos_supplementaires.map((url) => (
                <li
                  key={url}
                  className="shrink-0 snap-start"
                >
                  <img
                    src={url}
                    alt={`${etablissement.nom} — photo`}
                    className="h-32 w-48 rounded-xl border border-marine-100 object-cover shadow-carte sm:h-40 sm:w-60"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

      <main className="mx-auto mt-6 max-w-3xl space-y-6 px-4 pb-16">
        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <DetailsBar etablissement={etablissement} />

        <section>
          <h2 className="text-xl font-bold text-marine-900">Soirées à venir</h2>
          {diffusions.length === 0 ? (
            <div className="mt-4 carte text-center text-sm text-marine-600">
              Aucune soirée publiée pour l'instant. Revenez bientôt !
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {diffusions.map((d) => {
                const restantes = soldes[d.id] ?? d.places_disponibles;
                const complet = restantes <= 0;
                return (
                  <li
                    key={d.id}
                    className="overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-carte"
                  >
                    <div className="border-l-4 border-bleu-500 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
                            Match #{d.matchs.numero_match} ·{' '}
                            {libellePhase[d.matchs.phase]}
                          </p>
                          <h3 className="mt-1 text-xl font-bold text-marine-900">
                            {d.matchs.equipe_domicile}{' '}
                            <span className="font-normal text-marine-400">vs</span>{' '}
                            {d.matchs.equipe_exterieur}
                          </h3>
                          <p className="mt-2 text-sm text-marine-800">
                            <span className="font-semibold">
                              {formaterDateHeure(
                                d.matchs.coup_envoi_utc,
                                etablissement.fuseau_horaire,
                              )}
                            </span>{' '}
                            <span className="text-marine-400">
                              ({libelleFuseau(
                                d.matchs.coup_envoi_utc,
                                etablissement.fuseau_horaire,
                              )}
                              )
                            </span>
                          </p>
                          <p className="mt-0.5 text-sm text-marine-500">
                            {d.matchs.stade}, {d.matchs.ville_hote}
                          </p>
                          <Link
                            to={`/matchs/${slugifierMatch(d.matchs)}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-bleu-600 hover:text-bleu-700"
                          >
                            Voir tous les bars qui diffusent ce match
                            <span aria-hidden="true">→</span>
                          </Link>
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
                                  restantes < 5
                                    ? 'text-red-600'
                                    : 'text-bleu-600'
                                }`}
                              >
                                {restantes}
                              </p>
                              <p className="text-xs text-marine-500">
                                / {d.places_disponibles} places
                              </p>
                              {restantes < 5 && (
                                <span className="mt-1 inline-flex animate-pulse items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                  Dépêchez-vous !
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-marine-50 bg-marine-50/50 p-5 sm:p-6">
                      <h4 className="mb-3 text-sm font-bold text-marine-900">
                        Réserver pour cette soirée
                      </h4>
                      {complet ? (
                        <p className="text-sm text-marine-600">
                          Plus de place disponible pour cette soirée.
                        </p>
                      ) : (
                        <FormulaireReservation
                          diffusionId={d.id}
                          placesRestantes={restantes}
                          onReserve={charger}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

const LIBELLES_AMBIANCE: Record<string, string> = {
  supporters: 'Supporters',
  foule: 'Salle pleine',
  apero: 'Apéro',
  famille: 'Famille',
  chill: 'Chill',
  branche: 'Branché',
};

const LIBELLES_SON: Record<string, string> = {
  calme: 'Calme — on parle facilement',
  normal: 'Normal — un peu de bruit',
  fort: 'Fort — faut hausser la voix',
  crowd: 'Crowd — on ne s\'entend plus quand ça marque',
};

interface DetailsBarProps {
  etablissement: Etablissement;
}

function DetailsBar({ etablissement: e }: DetailsBarProps) {
  const aDesDetailsEcrans = e.nombre_ecrans !== null || e.taille_ecrans;
  const aDesDetailsAmbiance = e.son_ambiance || (e.type_ambiance && e.type_ambiance.length > 0);
  const aDesEquipes = e.equipes_habituelles && e.equipes_habituelles.length > 0;
  const aDesHoraires = e.horaires_ouverture && Object.keys(e.horaires_ouverture).length > 0;

  if (
    !aDesDetailsEcrans &&
    !aDesDetailsAmbiance &&
    !aDesEquipes &&
    !aDesHoraires
  ) {
    return null;
  }

  return (
    <section className="carte">
      <h2 className="text-lg font-bold text-marine-900">Le bar</h2>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {aDesDetailsEcrans && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Écrans
            </p>
            <p className="mt-1 text-sm text-marine-800">
              {e.nombre_ecrans !== null && (
                <span className="font-medium">
                  {e.nombre_ecrans} écran{e.nombre_ecrans > 1 ? 's' : ''}
                </span>
              )}
              {e.nombre_ecrans !== null && e.taille_ecrans && ' — '}
              {e.taille_ecrans && <span>{e.taille_ecrans}</span>}
            </p>
          </div>
        )}

        {aDesDetailsAmbiance && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Ambiance
            </p>
            {e.son_ambiance && (
              <p className="mt-1 text-sm text-marine-800">
                {LIBELLES_SON[e.son_ambiance] ?? e.son_ambiance}
              </p>
            )}
            {e.type_ambiance && e.type_ambiance.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {e.type_ambiance.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-bleu-50 px-2.5 py-0.5 text-xs font-medium text-bleu-700"
                  >
                    {LIBELLES_AMBIANCE[tag] ?? tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {aDesEquipes && (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Autres compétitions habituellement diffusées
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {e.equipes_habituelles!.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-marine-200 bg-white px-2.5 py-0.5 text-xs text-marine-700"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {aDesHoraires && (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Horaires d'ouverture
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
              {Object.entries(e.horaires_ouverture!).map(([jour, h]) => (
                <div key={jour} className="flex justify-between gap-3">
                  <dt className="capitalize text-marine-600">{jour}</dt>
                  <dd className="font-medium text-marine-900">{h}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
