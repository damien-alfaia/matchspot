import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { Etablissement, MatchCdm } from '../types/base';
import { formaterDateHeure } from '../utils/fuseaux';
import { libellePhase } from '../utils/libelles';

interface Props {
  etablissement: Etablissement;
  matchsDejaProgrammes: Set<string>;
  onCree: () => void;
}

export function FormulaireDiffusion({
  etablissement,
  matchsDejaProgrammes,
  onCree,
}: Props) {
  const [matchs, setMatchs] = useState<MatchCdm[]>([]);
  const [matchId, setMatchId] = useState('');
  const [places, setPlaces] = useState<number>(etablissement.capacite);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      const { data, error } = await supabase
        .from('matchs')
        .select('*')
        .order('coup_envoi_utc', { ascending: true });
      if (!actif) return;
      if (error) {
        setErreur(error.message);
      } else {
        setMatchs(data ?? []);
      }
    })();
    return () => {
      actif = false;
    };
  }, []);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    if (!matchId) return;
    setEnCours(true);
    setErreur(null);

    const { error } = await supabase.from('diffusions').insert({
      etablissement_id: etablissement.id,
      match_id: matchId,
      places_disponibles: places,
      statut: 'brouillon',
      est_publique: false,
    });

    if (error) {
      setErreur(error.message);
    } else {
      setMatchId('');
      setPlaces(etablissement.capacite);
      onCree();
    }
    setEnCours(false);
  }

  const matchsDisponibles = matchs.filter((m) => !matchsDejaProgrammes.has(m.id));

  return (
    <form onSubmit={soumettre} className="carte space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Ajouter une diffusion
        </h2>
        <p className="text-sm text-slate-500">
          Choisissez un match parmi les 104 de la Coupe du Monde. Les horaires
          ci-dessous sont affichés dans le fuseau de l'établissement
          ({etablissement.fuseau_horaire}).
        </p>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Match</span>
        <select
          className="champ-saisie"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          required
        >
          <option value="">— Sélectionner —</option>
          {matchsDisponibles.map((m) => (
            <option key={m.id} value={m.id}>
              #{m.numero_match.toString().padStart(3, '0')} — {libellePhase[m.phase]} ·{' '}
              {m.equipe_domicile} – {m.equipe_exterieur} ·{' '}
              {formaterDateHeure(m.coup_envoi_utc, etablissement.fuseau_horaire)} ·{' '}
              {m.stade} ({m.ville_hote})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Places disponibles
        </span>
        <input
          type="number"
          min={1}
          max={etablissement.capacite}
          value={places}
          onChange={(e) => setPlaces(Number(e.target.value))}
          className="champ-saisie"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Capacité totale de l'établissement : {etablissement.capacite}.
        </p>
      </label>

      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={enCours || !matchId} className="bouton-primaire">
          {enCours ? 'Création…' : 'Créer la diffusion'}
        </button>
      </div>
    </form>
  );
}
