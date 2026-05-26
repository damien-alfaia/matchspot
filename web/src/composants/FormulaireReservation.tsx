import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  diffusionId: string;
  placesRestantes: number;
  onReserve: () => void;
}

export function FormulaireReservation({
  diffusionId,
  placesRestantes,
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

    // On génère l'id côté client pour pouvoir le passer à l'Edge Function
    // de notification SANS faire un .select() après l'insert. Raison :
    // PostgREST ferait alors un SELECT implicite, et anon n'a pas le
    // droit de SELECT sur reservations (seul le staff de l'organisation
    // y a accès). Sans cette précaution, l'INSERT réussit mais PostgREST
    // renvoie l'erreur RLS 42501 du SELECT, faussant l'UX.
    const reservationId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : undefined;

    const { error } = await supabase.from('reservations').insert({
      ...(reservationId ? { id: reservationId } : {}),
      diffusion_id: diffusionId,
      nom_client: nom,
      email_client: email,
      taille_groupe: taille,
      statut: 'en_attente',
    });

    if (error) {
      setErreur(error.message);
      setEnCours(false);
      return;
    }

    setConfirme(true);
    setNom('');
    setEmail('');
    setTaille(2);
    onReserve();
    setEnCours(false);

    // Notification email post-insert. Best-effort : si l'Edge Function
    // est down, la résa est sauvegardée dans Supabase et visible via
    // Realtime. On n'affiche pas d'erreur au client pour ne pas le
    // confondre.
    if (reservationId) {
      void supabase.functions
        .invoke('notifier_reservation', {
          body: { reservation_id: reservationId },
        })
        .catch(() => {
          // Silencieux par design.
        });
    }
  }

  if (confirme) {
    return (
      <p className="rounded-md bg-bleu-50 px-3 py-2 text-sm text-bleu-700">
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
            max={Math.min(placesRestantes, 20)}
            value={taille}
            onChange={(e) => setTaille(Number(e.target.value))}
            className="champ-saisie"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Places restantes : {placesRestantes}.
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
