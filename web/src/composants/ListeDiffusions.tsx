import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DiffusionAvecMatch, Etablissement, StatutDiffusion } from '../types/base';
import { formaterDateHeure, libelleFuseau } from '../utils/fuseaux';
import {
  classesBadgeDiffusion,
  libellePhase,
  libelleStatutDiffusion,
} from '../utils/libelles';
import { BadgeMatchPhare } from './ui/BadgeMatchPhare';
import { DrapeauEquipe } from './ui/DrapeauEquipe';

interface Props {
  etablissement: Etablissement;
  diffusions: DiffusionAvecMatch[];
  onChangement: () => void;
}

export function ListeDiffusions({ etablissement, diffusions, onChangement }: Props) {
  const [traitementId, setTraitementId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function changerStatut(id: string, statut: StatutDiffusion) {
    setTraitementId(id);
    setErreur(null);
    // est_publique suit le statut : publié = visible sur la page bar,
    // brouillon/annulé = masqué. Plus de toggle séparé.
    const { error } = await supabase
      .from('diffusions')
      .update({ statut, est_publique: statut === 'publiee' })
      .eq('id', id);
    if (error) {
      setErreur(error.message);
    } else {
      onChangement();
    }
    setTraitementId(null);
  }

  if (diffusions.length === 0) {
    return (
      <div className="carte text-sm text-slate-600 dark:text-marine-300">
        Aucune diffusion pour l'instant. Utilisez le formulaire pour en créer
        une.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {erreur && (
        <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {erreur}
        </p>
      )}
      {diffusions.map((d) => {
        const enTraitement = traitementId === d.id;
        const m = d.matchs;
        return (
          <article key={d.id} className="carte">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-marine-400">
                    Match #{m.numero_match} · {libellePhase[m.phase]}
                  </p>
                  <BadgeMatchPhare match={m} compact />
                </div>
                <h3 className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-base font-semibold text-slate-900 dark:text-marine-50">
                  <span className="inline-flex items-center gap-1.5">
                    <DrapeauEquipe nom={m.equipe_domicile} taille="sm" />
                    {m.equipe_domicile}
                  </span>
                  <span className="text-slate-400 dark:text-marine-500">vs</span>
                  <span className="inline-flex items-center gap-1.5">
                    <DrapeauEquipe nom={m.equipe_exterieur} taille="sm" />
                    {m.equipe_exterieur}
                  </span>
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-marine-300">
                  {formaterDateHeure(m.coup_envoi_utc, etablissement.fuseau_horaire)}{' '}
                  <span className="text-slate-400 dark:text-marine-500">
                    ({libelleFuseau(m.coup_envoi_utc, etablissement.fuseau_horaire)})
                  </span>
                </p>
                <p className="text-sm text-slate-500 dark:text-marine-400">
                  {m.stade} — {m.ville_hote}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${classesBadgeDiffusion(d.statut)}`}>
                  {libelleStatutDiffusion[d.statut]}
                </span>
                <span className="text-sm text-slate-600 dark:text-marine-300">
                  {d.places_disponibles} places
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {d.statut !== 'publiee' && (
                <button
                  type="button"
                  disabled={enTraitement}
                  onClick={() => changerStatut(d.id, 'publiee')}
                  className="bouton-primaire"
                >
                  Publier
                </button>
              )}
              {d.statut !== 'brouillon' && (
                <button
                  type="button"
                  disabled={enTraitement}
                  onClick={() => changerStatut(d.id, 'brouillon')}
                  className="bouton-secondaire"
                >
                  Remettre en brouillon
                </button>
              )}
              {d.statut !== 'annulee' && (
                <button
                  type="button"
                  disabled={enTraitement}
                  onClick={() => changerStatut(d.id, 'annulee')}
                  className="bouton-secondaire"
                >
                  Annuler
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
