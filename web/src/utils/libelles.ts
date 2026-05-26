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
      return 'bg-bleu-50 text-bleu-700 border border-bleu-200';
    case 'brouillon':
      return 'bg-slate-100 text-slate-700 border border-slate-300';
    case 'annulee':
      return 'bg-red-50 text-red-700 border border-red-200';
  }
}

export function classesBadgeReservation(statut: StatutReservation): string {
  switch (statut) {
    case 'confirmee':
      return 'bg-bleu-50 text-bleu-700 border border-bleu-200';
    case 'en_attente':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'annulee':
      return 'bg-red-50 text-red-700 border border-red-200';
  }
}

// Jours de la semaine dans l'ordre canonique français (lundi → dimanche).
// Utilisé pour ordonner les horaires d'ouverture en évitant l'ordre
// alphabétique de Object.entries.
export const JOURS_SEMAINE: ReadonlyArray<{ cle: string; libelle: string }> = [
  { cle: 'lundi', libelle: 'Lundi' },
  { cle: 'mardi', libelle: 'Mardi' },
  { cle: 'mercredi', libelle: 'Mercredi' },
  { cle: 'jeudi', libelle: 'Jeudi' },
  { cle: 'vendredi', libelle: 'Vendredi' },
  { cle: 'samedi', libelle: 'Samedi' },
  { cle: 'dimanche', libelle: 'Dimanche' },
];

/**
 * Trie un objet horaires_ouverture dans l'ordre canonique de la semaine.
 * Les jours non reconnus (clés inattendues) sont placés à la fin.
 */
export function trierHoraires(
  horaires: Record<string, string>,
): Array<{ cle: string; libelle: string; valeur: string }> {
  const trie = JOURS_SEMAINE
    .filter((j) => j.cle in horaires)
    .map((j) => ({ cle: j.cle, libelle: j.libelle, valeur: horaires[j.cle] }));
  // Inclure d'éventuels jours non standards en fin de liste.
  const clesConnues = new Set(JOURS_SEMAINE.map((j) => j.cle));
  for (const [cle, valeur] of Object.entries(horaires)) {
    if (!clesConnues.has(cle)) {
      trie.push({ cle, libelle: cle, valeur });
    }
  }
  return trie;
}
