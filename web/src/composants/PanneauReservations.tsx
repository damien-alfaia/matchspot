import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Reservation } from '../types/base';
import { formaterDateHeure } from '../utils/fuseaux';
import {
  classesBadgeReservation,
  libelleStatutReservation,
} from '../utils/libelles';

interface Props {
  diffusionIds: string[];
  fuseau: string;
}

// Panneau temps réel des réservations pour les diffusions affichées.
// S'abonne à la publication Supabase Realtime sur la table reservations.
export function PanneauReservations({ diffusionIds, fuseau }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (diffusionIds.length === 0) {
      setReservations([]);
      return;
    }
    let actif = true;
    (async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .in('diffusion_id', diffusionIds)
        .order('cree_le', { ascending: false });
      if (!actif) return;
      if (error) {
        setErreur(error.message);
      } else {
        setReservations(data ?? []);
      }
    })();
    return () => {
      actif = false;
    };
  }, [diffusionIds.join('|')]);

  // Abonnement Realtime — réagit aux INSERT/UPDATE/DELETE sur reservations.
  useEffect(() => {
    if (diffusionIds.length === 0) return;

    const canal = supabase
      .channel(`reservations-${diffusionIds.slice(0, 3).join('-')}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (msg) => {
          // On filtre côté client : la RLS empêche déjà la fuite, mais on
          // ignore explicitement les réservations qui ne concernent pas nos
          // diffusions affichées.
          const nouveau = (msg.new ?? msg.old) as Reservation | undefined;
          if (!nouveau) return;
          if (!diffusionIds.includes(nouveau.diffusion_id)) return;

          setReservations((courantes) => {
            if (msg.eventType === 'INSERT') {
              return [nouveau, ...courantes];
            }
            if (msg.eventType === 'UPDATE') {
              return courantes.map((r) =>
                r.id === nouveau.id ? nouveau : r,
              );
            }
            if (msg.eventType === 'DELETE') {
              return courantes.filter((r) => r.id !== nouveau.id);
            }
            return courantes;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [diffusionIds.join('|')]);

  if (diffusionIds.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">
        Réservations (live)
      </h2>
      <p className="text-sm text-slate-500">
        Mises à jour en temps réel via Supabase Realtime. Les nouvelles
        réservations apparaissent ici sans rafraîchissement.
      </p>

      {erreur && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        {reservations.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune réservation reçue pour l'instant.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Reçue le</th>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Groupe</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {formaterDateHeure(r.cree_le, fuseau)}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {r.nom_client}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.email_client}</td>
                  <td className="px-3 py-2 text-slate-600">{r.taille_groupe}</td>
                  <td className="px-3 py-2">
                    <span className={`badge ${classesBadgeReservation(r.statut)}`}>
                      {libelleStatutReservation[r.statut]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
