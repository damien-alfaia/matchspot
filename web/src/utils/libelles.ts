import type { PhaseMatch, StatutDiffusion, StatutReservation } from '../types/base';

export const libellePhase: Record<PhaseMatch, string> = {
  groupes: 'Phase de groupes',
  '16es': '16es de finale',
  '8es': '8es de finale',
  quarts: 'Quarts de finale',
  demis: 'Demi-finales',
  '3e_place': '3e place',
  finale: 'Finale',
};

export const libelleStatutDiffusion: Record<StatutDiffusion, string> = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
  annulee: 'Annulée',
};

export const libelleStatutReservation: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
};

export function classesBadgeDiffusion(statut: StatutDiffusion): string {
  switch (statut) {
    case 'publiee':
      return 'bg-terrain-50 text-terrain-700 border border-terrain-500/30';
    case 'brouillon':
      return 'bg-slate-100 text-slate-700 border border-slate-300';
    case 'annulee':
      return 'bg-red-50 text-red-700 border border-red-200';
  }
}

export function classesBadgeReservation(statut: StatutReservation): string {
  switch (statut) {
    case 'confirmee':
      return 'bg-terrain-50 text-terrain-700 border border-terrain-500/30';
    case 'en_attente':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'annulee':
      return 'bg-red-50 text-red-700 border border-red-200';
  }
}
