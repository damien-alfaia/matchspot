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
    const { error } = await supabase
      .from('diffusions')
      .update({ statut })
      .eq('id', id);
    if (error) {
      setErreur(error.message);
    } else {
      onChangement();
    }
    setTraitementId(null);
  }

  async function basculerPublique(id: string, valeur: boolean) {
    setTraitementId(id);
    setErreur(null);
    const { error } = await supabase
      .from('diffusions')
      .update({ est_publique: valeur })
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
      <div className="carte text-sm text-slate-600">
        Aucune diffusion pour l'instant. Utilisez le formulaire pour en créer
        une.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Match #{m.numero_match} · {libellePhase[m.phase]}
                  </p>
                  <BadgeMatchPhare match={m} compact />
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {m.equipe_domicile} <span className="text-slate-400">vs</span>{' '}
                  {m.equipe_exterieur}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {formaterDateHeure(m.coup_envoi_utc, etablissement.fuseau_horaire)}{' '}
                  <span className="text-slate-400">
                    ({libelleFuseau(m.coup_envoi_utc, etablissement.fuseau_horaire)})
                  </span>
                </p>
                <p className="text-sm text-slate-500">
                  {m.stade} — {m.ville_hote}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${classesBadgeDiffusion(d.statut)}`}>
                  {libelleStatutDiffusion[d.statut]}
                </span>
                <span className="text-sm text-slate-600">
                  {d.places_disponibles} places
                </span>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={d.est_publique}
                    disabled={enTraitement}
                    onChange={(e) => basculerPublique(d.id, e.target.checked)}
                  />
                  Visible sur la page publique
                </label>
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
