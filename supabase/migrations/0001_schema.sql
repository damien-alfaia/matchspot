-- =====================================================================
-- Migration 0001 — Schéma initial MatchSpot
--
-- Tables et énumérations du SaaS multi-tenant.
-- Toutes les heures stockées en UTC (timestamptz).
-- =====================================================================

-- Extensions nécessaires (pgcrypto pour gen_random_uuid).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- Énumérations
-- =====================================================================

CREATE TYPE public.role_adhesion AS ENUM ('proprietaire', 'staff');

CREATE TYPE public.statut_diffusion AS ENUM ('brouillon', 'publiee', 'annulee');

CREATE TYPE public.statut_reservation AS ENUM ('en_attente', 'confirmee', 'annulee');

-- Phase laissée en text + CHECK : permet d'ajouter des phases sans migration enum.
-- (Pas d'enum pour conserver de la souplesse sur ce champ peu critique.)

-- =====================================================================
-- Table : organisations
--
-- Tenant racine. Un groupe de bars ou un bar indépendant.
-- =====================================================================
CREATE TABLE public.organisations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         text NOT NULL,
    slug        text NOT NULL UNIQUE,
    cree_le     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organisations IS
  'Tenant racine du SaaS. Toute l''isolation passe par cette table.';

-- =====================================================================
-- Table : adhesions
--
-- Lien plusieurs-à-plusieurs entre utilisateurs Supabase et organisations.
-- =====================================================================
CREATE TABLE public.adhesions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id  uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    utilisateur_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role             public.role_adhesion NOT NULL DEFAULT 'staff',
    cree_le          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organisation_id, utilisateur_id)
);

CREATE INDEX idx_adhesions_utilisateur ON public.adhesions (utilisateur_id);
CREATE INDEX idx_adhesions_organisation ON public.adhesions (organisation_id);

COMMENT ON TABLE public.adhesions IS
  'Détermine les droits d''un utilisateur sur une organisation. Pivot de la RLS.';

-- =====================================================================
-- Fonction helper : appartenance organisation
--
-- SECURITY DEFINER pour éviter la récursion sur la RLS d'adhesions.
-- Ne retourne qu'un booléen : aucune fuite de données.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.est_membre(_organisation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
          FROM public.adhesions
         WHERE organisation_id = _organisation_id
           AND utilisateur_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.est_membre(uuid) IS
  'Vrai si l''utilisateur courant est membre de l''organisation donnée.';

-- =====================================================================
-- Table : etablissements
--
-- Un bar physique avec son fuseau, sa capacité, son slug public.
-- =====================================================================
CREATE TABLE public.etablissements (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id  uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    nom              text NOT NULL,
    adresse          text,
    fuseau_horaire   text NOT NULL,  -- IANA, ex 'Europe/Paris'
    capacite         int  NOT NULL CHECK (capacite > 0),
    slug_public      text NOT NULL UNIQUE,
    cree_le          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_etablissements_organisation ON public.etablissements (organisation_id);

COMMENT ON COLUMN public.etablissements.fuseau_horaire IS
  'Fuseau IANA (ex Europe/Paris). Utilisé pour convertir les horaires de match à l''affichage.';

-- =====================================================================
-- Table : matchs
--
-- Calendrier global de la Coupe du Monde 2026.
-- Lecture publique, écriture uniquement par le seed côté admin.
-- =====================================================================
CREATE TABLE public.matchs (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_match       int  NOT NULL UNIQUE CHECK (numero_match BETWEEN 1 AND 104),
    equipe_domicile    text NOT NULL,
    equipe_exterieur   text NOT NULL,
    phase              text NOT NULL CHECK (
        phase IN ('groupes', '16es', '8es', 'quarts', 'demis', '3e_place', 'finale')
    ),
    coup_envoi_utc     timestamptz NOT NULL,
    stade              text NOT NULL,
    ville_hote         text NOT NULL
);

CREATE INDEX idx_matchs_coup_envoi ON public.matchs (coup_envoi_utc);
CREATE INDEX idx_matchs_phase ON public.matchs (phase);

COMMENT ON TABLE public.matchs IS
  'Calendrier officiel des 104 matchs de la Coupe du Monde 2026. Lecture publique.';
COMMENT ON COLUMN public.matchs.coup_envoi_utc IS
  'Coup d''envoi en UTC. Conversion vers le fuseau de l''établissement faite côté client.';

-- =====================================================================
-- Table : diffusions
--
-- Décision d'un établissement de diffuser un match donné.
-- =====================================================================
CREATE TABLE public.diffusions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id    uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
    match_id            uuid NOT NULL REFERENCES public.matchs(id) ON DELETE RESTRICT,
    places_disponibles  int  NOT NULL CHECK (places_disponibles >= 0),
    statut              public.statut_diffusion NOT NULL DEFAULT 'brouillon',
    est_publique        boolean NOT NULL DEFAULT false,
    cree_le             timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, match_id)
);

CREATE INDEX idx_diffusions_etablissement ON public.diffusions (etablissement_id);
CREATE INDEX idx_diffusions_match ON public.diffusions (match_id);
CREATE INDEX idx_diffusions_publiees ON public.diffusions (etablissement_id)
    WHERE statut = 'publiee' AND est_publique = true;

COMMENT ON TABLE public.diffusions IS
  'Soirée de diffusion : un établissement diffuse un match avec un quota de places.';

-- =====================================================================
-- Table : reservations
--
-- Client final qui réserve une place pour une diffusion.
-- =====================================================================
CREATE TABLE public.reservations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    diffusion_id    uuid NOT NULL REFERENCES public.diffusions(id) ON DELETE CASCADE,
    nom_client      text NOT NULL,
    email_client    text NOT NULL,
    taille_groupe   int  NOT NULL CHECK (taille_groupe BETWEEN 1 AND 50),
    statut          public.statut_reservation NOT NULL DEFAULT 'en_attente',
    cree_le         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_diffusion ON public.reservations (diffusion_id);
CREATE INDEX idx_reservations_cree_le ON public.reservations (cree_le DESC);

COMMENT ON TABLE public.reservations IS
  'Réservation d''un client final pour une diffusion publiée et publique.';

-- =====================================================================
-- Table : abonnements
--
-- Structure de facturation. Pas branchée à Stripe dans le MVP.
-- TODO MVP+1 : webhook Stripe, mise à jour automatique du statut.
-- =====================================================================
CREATE TABLE public.abonnements (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id       uuid NOT NULL UNIQUE REFERENCES public.organisations(id) ON DELETE CASCADE,
    formule               text NOT NULL DEFAULT 'gratuit',
    statut                text NOT NULL DEFAULT 'actif',
    fin_periode_courante  timestamptz,
    cree_le               timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.abonnements IS
  'État de l''abonnement d''une organisation. Stockage seul, paiement Stripe non implémenté.';

-- =====================================================================
-- Publication Realtime
--
-- On expose `reservations` au Realtime pour le dashboard staff.
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
