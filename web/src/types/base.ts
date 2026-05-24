// Types métier MatchSpot.
// Reflètent le schéma de supabase/migrations/0001_schema.sql.
// À régénérer via `supabase gen types typescript` si le schéma évolue.

export type RoleAdhesion = 'proprietaire' | 'staff';

export type StatutDiffusion = 'brouillon' | 'publiee' | 'annulee';

export type StatutReservation = 'en_attente' | 'confirmee' | 'annulee';

export type PhaseMatch =
  | 'groupes'
  | '16es'
  | '8es'
  | 'quarts'
  | 'demis'
  | '3e_place'
  | 'finale';

export interface Organisation {
  id: string;
  nom: string;
  slug: string;
  cree_le: string;
}

export interface Adhesion {
  id: string;
  organisation_id: string;
  utilisateur_id: string;
  role: RoleAdhesion;
  cree_le: string;
}

export type SonAmbiance = 'calme' | 'normal' | 'fort' | 'crowd';

export interface Etablissement {
  id: string;
  organisation_id: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  fuseau_horaire: string;
  capacite: number;
  slug_public: string;
  latitude: number | null;
  longitude: number | null;
  telephone: string | null;
  description_courte: string | null;
  url_photo: string | null;
  horaires_ouverture: Record<string, string> | null;
  nombre_ecrans: number | null;
  taille_ecrans: string | null;
  son_ambiance: SonAmbiance | null;
  type_ambiance: string[] | null;
  equipes_habituelles: string[] | null;
  photos_supplementaires: string[] | null;
  cree_le: string;
}

export interface MatchCdm {
  id: string;
  numero_match: number;
  equipe_domicile: string;
  equipe_exterieur: string;
  phase: PhaseMatch;
  coup_envoi_utc: string;
  stade: string;
  ville_hote: string;
}

export interface Diffusion {
  id: string;
  etablissement_id: string;
  match_id: string;
  places_disponibles: number;
  statut: StatutDiffusion;
  est_publique: boolean;
  cree_le: string;
}

export interface DiffusionAvecMatch extends Diffusion {
  matchs: MatchCdm;
}

export interface Reservation {
  id: string;
  diffusion_id: string;
  nom_client: string;
  email_client: string;
  taille_groupe: number;
  statut: StatutReservation;
  cree_le: string;
}
