// Fonction unique de formatage des horaires de match dans le fuseau de
// l'établissement. À UTILISER PARTOUT — pas de conversion ad hoc ailleurs.
//
// Le coup d'envoi est toujours stocké en UTC (ISO 8601) en base. Le
// rendu utilise Intl.DateTimeFormat avec une `timeZone` IANA explicite.

const formatDate = new Map<string, Intl.DateTimeFormat>();
const formatHeure = new Map<string, Intl.DateTimeFormat>();
const formatComplet = new Map<string, Intl.DateTimeFormat>();

function obtenirFormat(
  cache: Map<string, Intl.DateTimeFormat>,
  fuseau: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let f = cache.get(fuseau);
  if (!f) {
    f = new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: fuseau });
    cache.set(fuseau, f);
  }
  return f;
}

export function formaterDate(instantUtcIso: string, fuseau: string): string {
  const f = obtenirFormat(formatDate, fuseau, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return f.format(new Date(instantUtcIso));
}

export function formaterHeure(instantUtcIso: string, fuseau: string): string {
  const f = obtenirFormat(formatHeure, fuseau, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return f.format(new Date(instantUtcIso));
}

export function formaterDateHeure(
  instantUtcIso: string,
  fuseau: string,
): string {
  const f = obtenirFormat(formatComplet, fuseau, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return f.format(new Date(instantUtcIso));
}

// Étiquette courte du fuseau pour les bulles d'info (« CEST », « EDT »…).
export function libelleFuseau(instantUtcIso: string, fuseau: string): string {
  const f = new Intl.DateTimeFormat('fr-FR', {
    timeZone: fuseau,
    timeZoneName: 'short',
  });
  const parts = f.formatToParts(new Date(instantUtcIso));
  const tzName = parts.find((p) => p.type === 'timeZoneName');
  return tzName?.value ?? fuseau;
}
