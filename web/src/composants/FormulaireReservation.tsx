import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  diffusionId: string;
  placesDisponibles: number;
  onReserve: () => void;
}

export function FormulaireReservation({
  diffusionId,
  placesDisponibles,
  onReserve,
}: Props) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [taille, setTaille] = useState(2);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirme, setConfirme] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const { error } = await supabase.from('reservations').insert({
      diffusion_id: diffusionId,
      nom_client: nom,
      email_client: email,
      taille_groupe: taille,
      statut: 'en_attente',
    });

    if (error) {
      setErreur(error.message);
    } else {
      setConfirme(true);
      setNom('');
      setEmail('');
      setTaille(2);
      onReserve();
    }
    setEnCours(false);
  }

  if (confirme) {
    return (
      <p className="rounded-md bg-terrain-50 px-3 py-2 text-sm text-terrain-700">
        Demande de réservation envoyée. Le bar vous confirmera par email.
      </p>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Votre nom
          </span>
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="champ-saisie"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Votre email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="champ-saisie"
            autoComplete="email"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Taille du groupe
          </span>
          <input
            type="number"
            min={1}
            max={Math.min(placesDisponibles, 20)}
            value={taille}
            onChange={(e) => setTaille(Number(e.target.value))}
            className="champ-saisie"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Places restantes affichées : {placesDisponibles}.
          </p>
        </label>
      </div>

      {erreur && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <button type="submit" disabled={enCours} className="bouton-primaire">
        {enCours ? 'Envoi…' : 'Réserver'}
      </button>
    </form>
  );
}
