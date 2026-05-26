import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Reservation, StatutReservation } from '../types/base';
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
  const [traitementId, setTraitementId] = useState<string | null>(null);

  async function changerStatut(id: string, statut: StatutReservation) {
    setTraitementId(id);
    setErreur(null);
    const { error } = await supabase
      .from('reservations')
      .update({ statut })
      .eq('id', id);
    if (error) setErreur(error.message);
    setTraitementId(null);
    // Pas de mutation locale : l'événement Realtime UPDATE rafraîchira la ligne.

    // Notification email post-update (best-effort).
    // L'Edge Function lit le nouveau statut de la résa et envoie le bon
    // mail (confirmation / annulation au client). Si elle est down, la
    // résa est déjà à jour en base, on n'affiche pas d'erreur au staff.
    if (!error) {
      void supabase.functions
        .invoke('notifier_reservation', { body: { reservation_id: id } })
        .catch(() => {
          // Silencieux par design.
        });
    }
  }

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
      <h2 className="text-lg font-semibold text-slate-900 dark:text-marine-50">
        Réservations (live)
      </h2>
      <p className="text-sm text-slate-500 dark:text-marine-400">
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
          <p className="text-sm text-slate-500 dark:text-marine-400">
            Aucune réservation reçue pour l'instant.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-marine-700 text-sm">
            <thead className="bg-slate-100 dark:bg-marine-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-marine-400">
              <tr>
                <th className="px-3 py-2">Reçue le</th>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Groupe</th>
                <th className="px-3 py-2">Arrivée</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-marine-800 bg-white dark:bg-marine-800">
              {reservations.map((r) => {
                const enTraitement = traitementId === r.id;
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-marine-300">
                      {formaterDateHeure(r.cree_le, fuseau)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-marine-50">
                      {r.nom_client}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-marine-300">{r.email_client}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-marine-300">{r.taille_groupe}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-marine-300">
                      {r.heure_arrivee ? r.heure_arrivee.slice(0, 5) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`badge ${classesBadgeReservation(r.statut)}`}>
                        {libelleStatutReservation[r.statut]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {r.statut !== 'confirmee' && (
                          <button
                            type="button"
                            disabled={enTraitement}
                            onClick={() => changerStatut(r.id, 'confirmee')}
                            className="rounded-md bg-bleu-700 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-bleu-800 focus:outline-none focus:ring-2 focus:ring-bleu-500 focus:ring-offset-1 disabled:opacity-50"
                          >
                            Confirmer
                          </button>
                        )}
                        {r.statut !== 'en_attente' && (
                          <button
                            type="button"
                            disabled={enTraitement}
                            onClick={() => changerStatut(r.id, 'en_attente')}
                            className="rounded-md border border-slate-300 dark:border-marine-700 bg-white dark:bg-marine-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-marine-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-bleu-500 focus:ring-offset-1 disabled:opacity-50"
                          >
                            Remettre en attente
                          </button>
                        )}
                        {r.statut !== 'annulee' && (
                          <button
                            type="button"
                            disabled={enTraitement}
                            onClick={() => changerStatut(r.id, 'annulee')}
                            className="rounded-md border border-red-300 bg-white dark:bg-marine-800 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
