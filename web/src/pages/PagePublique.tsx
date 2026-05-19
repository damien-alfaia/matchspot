import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement } from '../types/base';
import { Entete } from '../composants/Entete';
import { FormulaireReservation } from '../composants/FormulaireReservation';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import { libellePhase } from '../utils/libelles';

export function PagePublique() {
  const { slug } = useParams<{ slug: string }>();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [diffusions, setDiffusions] = useState<DiffusionAvecMatch[]>([]);
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
    } else {
      const triees = ((diffs ?? []) as DiffusionAvecMatch[]).sort((a, b) =>
        a.matchs.coup_envoi_utc.localeCompare(b.matchs.coup_envoi_utc),
      );
      setDiffusions(triees);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Entete />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">
            {etablissement.nom}
          </h1>
          {etablissement.adresse && (
            <p className="mt-1 text-slate-600">{etablissement.adresse}</p>
          )}
          <p className="mt-2 text-sm text-slate-500">
            Les horaires ci-dessous sont affichés au fuseau du bar
            ({etablissement.fuseau_horaire}).
          </p>
        </header>

        {erreur && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Soirées à venir
          </h2>
          {diffusions.length === 0 ? (
            <p className="mt-3 text-slate-600">
              Aucune soirée publiée pour l'instant. Revenez bientôt !
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {diffusions.map((d) => (
                <li key={d.id} className="carte">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Match #{d.matchs.numero_match} ·{' '}
                    {libellePhase[d.matchs.phase]}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {d.matchs.equipe_domicile}{' '}
                    <span className="text-slate-400">vs</span>{' '}
                    {d.matchs.equipe_exterieur}
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {formaterDateHeure(
                      d.matchs.coup_envoi_utc,
                      etablissement.fuseau_horaire,
                    )}{' '}
                    <span className="text-slate-400">
                      (
                      {libelleFuseau(
                        d.matchs.coup_envoi_utc,
                        etablissement.fuseau_horaire,
                      )}
                      )
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {d.matchs.stade}, {d.matchs.ville_hote}
                  </p>
                  <p className="mt-2 text-sm font-medium text-terrain-700">
                    {d.places_disponibles} places disponibles
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-medium text-slate-900">
                      Réserver pour cette soirée
                    </h4>
                    <div className="mt-3">
                      <FormulaireReservation
                        diffusionId={d.id}
                        placesDisponibles={d.places_disponibles}
                        onReserve={charger}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
