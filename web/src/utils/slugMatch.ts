// Helpers pour les URLs canoniques des matchs : /matchs/17-france-senegal
//
// Le slug commence TOUJOURS par le numéro du match (1 à 104) suivi d'un
// tiret et d'une chaîne dérivée des équipes. Le lookup en base se fait
// uniquement sur le numéro (la partie équipes est purement cosmétique
// pour le SEO et peut diverger sans casser la résolution).

import type { MatchCdm } from '../types/base';

function slugifier(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifierMatch(m: Pick<MatchCdm, 'numero_match' | 'equipe_domicile' | 'equipe_exterieur'>): string {
  const equipes = slugifier(`${m.equipe_domicile}-${m.equipe_exterieur}`);
  return `${m.numero_match}-${equipes}`;
}

// Accepte n'importe quoi qui commence par un nombre 1-104 :
// "17-france-senegal", "17", "17-fr-sn", "17-truc-aleatoire" → 17.
// Retourne null si non parseable ou hors plage.
export function extraireNumeroMatch(slug: string | undefined): number | null {
  if (!slug) return null;
  const m = slug.match(/^(\d{1,3})(?:-|$)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (Number.isInteger(n) && n >= 1 && n <= 104) return n;
  return null;
}
