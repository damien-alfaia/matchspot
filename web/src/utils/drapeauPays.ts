// Mapping nom d'équipe (français) → code ISO 3166-1 alpha-2 utilisable
// par flagcdn.com (ex : https://flagcdn.com/fr.svg).
//
// Cas particuliers : Angleterre et Écosse utilisent les codes étendus
// `gb-eng` / `gb-sct` (sous-codes FIFA reconnus par flagcdn).
//
// Les placeholders dynamiques ("Vainqueur Demi #101", "1er Groupe A",
// "Meilleur 3e Groupes A/B/C", etc.) ne sont volontairement pas mappés
// — le composant <DrapeauEquipe> retourne null pour eux. Le drapeau
// apparaîtra automatiquement quand la RPC propager_qualifies (migration
// 0008) remplacera le placeholder par le vrai nom du gagnant.

const MAPPING_EQUIPE_ISO: Record<string, string> = {
  'Afrique du Sud': 'za',
  'Algérie': 'dz',
  'Allemagne': 'de',
  'Angleterre': 'gb-eng',
  'Arabie saoudite': 'sa',
  'Argentine': 'ar',
  'Australie': 'au',
  'Autriche': 'at',
  'Belgique': 'be',
  'Bosnie-Herzégovine': 'ba',
  'Brésil': 'br',
  'Canada': 'ca',
  'Cap-Vert': 'cv',
  'Colombie': 'co',
  'Corée du Sud': 'kr',
  "Côte d'Ivoire": 'ci',
  'Croatie': 'hr',
  'Curaçao': 'cw',
  'Écosse': 'gb-sct',
  'Égypte': 'eg',
  'Équateur': 'ec',
  'Espagne': 'es',
  'États-Unis': 'us',
  'France': 'fr',
  'Ghana': 'gh',
  'Haïti': 'ht',
  'Irak': 'iq',
  'Iran': 'ir',
  'Japon': 'jp',
  'Jordanie': 'jo',
  'Maroc': 'ma',
  'Mexique': 'mx',
  'Norvège': 'no',
  'Nouvelle-Zélande': 'nz',
  'Ouzbékistan': 'uz',
  'Panama': 'pa',
  'Paraguay': 'py',
  'Pays-Bas': 'nl',
  'Portugal': 'pt',
  'Qatar': 'qa',
  'RD Congo': 'cd',
  'Sénégal': 'sn',
  'Suède': 'se',
  'Suisse': 'ch',
  'Tchéquie': 'cz',
  'Tunisie': 'tn',
  'Turquie': 'tr',
  'Uruguay': 'uy',
};

/**
 * Renvoie le code ISO en minuscules pour flagcdn, ou `null` si le nom
 * fourni est un placeholder dynamique (non encore résolu).
 */
export function codePaysDepuisEquipe(nom: string): string | null {
  return MAPPING_EQUIPE_ISO[nom] ?? null;
}
