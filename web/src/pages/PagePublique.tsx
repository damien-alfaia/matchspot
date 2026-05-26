import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { Footer } from '../composants/Footer';
import { FormulaireReservation } from '../composants/FormulaireReservation';
import { BoutonPartager } from '../composants/BoutonPartager';
import { EnTeteSEO } from '../composants/EnTeteSEO';
import { SqueletteLigne, SqueletteListe } from '../composants/ui/Squelette';
import { BadgeMatchPhare } from '../composants/ui/BadgeMatchPhare';
import { DrapeauEquipe } from '../composants/ui/DrapeauEquipe';
import { estMatchPhare } from '../utils/matchPhare';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import { libellePhase, trierHoraires } from '../utils/libelles';
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
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="mx-auto max-w-3xl space-y-6 px-4 py-8"
          aria-busy="true"
        >
          <SqueletteLigne width="w-1/3" height="h-3" />
          <SqueletteLigne width="w-2/3" height="h-8" />
          <SqueletteLigne width="w-1/2" height="h-4" />
          <SqueletteListe nombre={2} labelChargement="Chargement du bar…" />
        </main>
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
        <Entete />
        <main id="contenu-principal" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-marine-50">
            Établissement introuvable
          </h1>
          <p className="mt-2 text-slate-600 dark:text-marine-300">
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
    <div className="min-h-screen bg-slate-50 dark:bg-marine-900">
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
            className="h-48 w-full rounded-2xl border border-marine-100 dark:border-marine-700 object-cover shadow-carte sm:h-64"
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
                    className="h-32 w-48 rounded-xl border border-marine-100 dark:border-marine-700 object-cover shadow-carte sm:h-40 sm:w-60"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

      <main id="contenu-principal" tabIndex={-1} className="mx-auto mt-6 max-w-3xl space-y-6 px-4 pb-16">
        {erreur && (
          <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {erreur}
          </p>
        )}

        <DetailsBar etablissement={etablissement} />

        <section>
          <h2 className="text-xl font-bold text-marine-900 dark:text-marine-50">Soirées à venir</h2>
          {diffusions.length === 0 ? (
            <div className="mt-4 carte text-center text-sm text-marine-600 dark:text-marine-300">
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
                    className={`overflow-hidden rounded-2xl border bg-white dark:bg-marine-800 shadow-carte ${
                      estMatchPhare(d.matchs)
                        ? 'border-amber-200 dark:border-amber-800/40'
                        : 'border-marine-100 dark:border-marine-700'
                    }`}
                  >
                    <div
                      className={`border-l-4 p-5 sm:p-6 ${
                        estMatchPhare(d.matchs)
                          ? 'border-amber-500'
                          : 'border-bleu-500'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
                              Match #{d.matchs.numero_match} ·{' '}
                              {libellePhase[d.matchs.phase]}
                            </p>
                            <BadgeMatchPhare match={d.matchs} />
                          </div>
                          <h3 className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-bold text-marine-900 dark:text-marine-50">
                            <span className="inline-flex items-center gap-2">
                              <DrapeauEquipe nom={d.matchs.equipe_domicile} taille="md" />
                              {d.matchs.equipe_domicile}
                            </span>
                            <span className="font-normal text-marine-600 dark:text-marine-300">vs</span>
                            <span className="inline-flex items-center gap-2">
                              <DrapeauEquipe nom={d.matchs.equipe_exterieur} taille="md" />
                              {d.matchs.equipe_exterieur}
                            </span>
                          </h3>
                          <p className="mt-2 text-sm text-marine-800 dark:text-marine-100">
                            <span className="font-semibold">
                              {formaterDateHeure(
                                d.matchs.coup_envoi_utc,
                                etablissement.fuseau_horaire,
                              )}
                            </span>{' '}
                            <span className="text-marine-600 dark:text-marine-300">
                              ({libelleFuseau(
                                d.matchs.coup_envoi_utc,
                                etablissement.fuseau_horaire,
                              )}
                              )
                            </span>
                          </p>
                          <p className="mt-0.5 text-sm text-marine-500 dark:text-marine-400">
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
                            <span className="badge bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                              Complet
                            </span>
                          ) : (
                            <>
                              <p
                                className={`text-2xl font-bold ${
                                  restantes < 5
                                    ? 'text-red-600 dark:text-red-300'
                                    : 'text-bleu-600'
                                }`}
                              >
                                {restantes}
                              </p>
                              <p className="text-xs text-marine-500 dark:text-marine-400">
                                / {d.places_disponibles} places
                              </p>
                              {restantes < 5 && (
                                <span className="mt-1 inline-flex animate-pulse items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
                                  Dépêchez-vous !
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-marine-100 bg-marine-50/50 p-5 dark:border-marine-700 dark:bg-marine-900/50 sm:p-6">
                      <h4 className="mb-3 text-sm font-bold text-marine-900 dark:text-marine-50">
                        Réserver pour cette soirée
                      </h4>
                      {complet ? (
                        <p className="text-sm text-marine-600 dark:text-marine-300">
                          Plus de place disponible pour cette soirée.
                        </p>
                      ) : etablissement.mode_reservation === 'telephone' ? (
                        <ContactReservation
                          icone="☎"
                          libelle="Réservez par téléphone"
                          valeur={etablissement.telephone}
                          href={
                            etablissement.telephone
                              ? `tel:${etablissement.telephone.replace(/\s/g, '')}`
                              : null
                          }
                          fallback="Le bar n'a pas renseigné de numéro. Contactez-le directement."
                        />
                      ) : etablissement.mode_reservation === 'email' ? (
                        <ContactReservation
                          icone="✉"
                          libelle="Réservez par email"
                          valeur={etablissement.email_reservation}
                          href={
                            etablissement.email_reservation
                              ? `mailto:${etablissement.email_reservation}?subject=${encodeURIComponent(
                                  `Réservation ${etablissement.nom} — ${d.matchs.equipe_domicile} vs ${d.matchs.equipe_exterieur}`,
                                )}`
                              : null
                          }
                          fallback="Le bar n'a pas renseigné d'email de réservation. Contactez-le directement."
                        />
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

interface PropsContactReservation {
  icone: string;
  libelle: string;
  valeur: string | null;
  href: string | null;
  fallback: string;
}

function ContactReservation({
  icone,
  libelle,
  valeur,
  href,
  fallback,
}: PropsContactReservation) {
  if (!valeur || !href) {
    return <p className="text-sm text-marine-600 dark:text-marine-300">{fallback}</p>;
  }
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 rounded-lg border border-bleu-200 bg-white dark:bg-marine-800 px-4 py-3 text-sm font-semibold text-bleu-700 transition hover:border-bleu-300 hover:bg-bleu-50 dark:bg-bleu-950/40 focus:outline-none focus:ring-2 focus:ring-bleu-500 focus:ring-offset-2"
    >
      <span aria-hidden="true" className="text-xl">
        {icone}
      </span>
      <span className="flex flex-col items-start">
        <span className="text-xs font-medium uppercase tracking-wider text-marine-600 dark:text-marine-300">
          {libelle}
        </span>
        <span>{valeur}</span>
      </span>
    </a>
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
      <h2 className="text-lg font-bold text-marine-900 dark:text-marine-50">Le bar</h2>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {aDesDetailsEcrans && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-bleu-600">
              Écrans
            </p>
            <p className="mt-1 text-sm text-marine-800 dark:text-marine-100">
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
              <p className="mt-1 text-sm text-marine-800 dark:text-marine-100">
                {LIBELLES_SON[e.son_ambiance] ?? e.son_ambiance}
              </p>
            )}
            {e.type_ambiance && e.type_ambiance.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {e.type_ambiance.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-bleu-50 dark:bg-bleu-950/40 px-2.5 py-0.5 text-xs font-medium text-bleu-700"
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
                  className="rounded-full border border-marine-200 dark:border-marine-700 bg-white dark:bg-marine-800 px-2.5 py-0.5 text-xs text-marine-700 dark:text-marine-200"
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
              {trierHoraires(e.horaires_ouverture!).map(({ cle, libelle, valeur }) => (
                <div key={cle} className="flex justify-between gap-3">
                  <dt className="text-marine-600 dark:text-marine-300">{libelle}</dt>
                  <dd className="font-medium text-marine-900 dark:text-marine-50">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
