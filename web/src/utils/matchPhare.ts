// Détermination des matchs « phares » : ceux qui méritent une mise en
// avant visuelle dans les listes et fiches publiques.
//
// Critères (cumulatifs en OR) :
//  - Phase à élimination directe à partir des quarts (quarts, demis,
//    3e_place, finale).
//  - Match impliquant la France (app destinée au marché français).
//
// Pas de stockage en base : calcul stateless depuis l'objet match.

import type { MatchCdm, PhaseMatch } from '../types/base';

const PHASES_PHARES: ReadonlySet<PhaseMatch> = new Set([
  'quarts',
  'demis',
  '3e_place',
  'finale',
]);

const EQUIPES_LOCALES: ReadonlySet<string> = new Set(['France']);

export function estMatchPhare(
  match: Pick<MatchCdm, 'phase' | 'equipe_domicile' | 'equipe_exterieur'>,
): boolean {
  if (PHASES_PHARES.has(match.phase)) return true;
  if (EQUIPES_LOCALES.has(match.equipe_domicile)) return true;
  if (EQUIPES_LOCALES.has(match.equipe_exterieur)) return true;
  return false;
}

/**
 * Libellé court justifiant pourquoi le match est marqué « phare ».
 * Utilisable comme aria-label ou title sur le badge.
 */
export function raisonMatchPhare(
  match: Pick<MatchCdm, 'phase' | 'equipe_domicile' | 'equipe_exterieur'>,
): string {
  if (match.phase === 'finale') return 'Finale de la Coupe du Monde';
  if (match.phase === 'demis') return 'Demi-finale';
  if (match.phase === '3e_place') return 'Match pour la 3e place';
  if (match.phase === 'quarts') return 'Quart de finale';
  if (
    EQUIPES_LOCALES.has(match.equipe_domicile) ||
    EQUIPES_LOCALES.has(match.equipe_exterieur)
  ) {
    return 'Match de l’équipe de France';
  }
  return 'Match phare';
}
