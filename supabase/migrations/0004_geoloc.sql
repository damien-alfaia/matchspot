-- =====================================================================
-- Migration 0004 — Géolocalisation des établissements
--
-- Ajoute latitude, longitude et ville à `etablissements` pour permettre
-- la recherche « autour de moi » sans dépendance à PostGIS (Haversine
-- en SQL pur dans la migration 0005).
-- =====================================================================

ALTER TABLE public.etablissements
    ADD COLUMN IF NOT EXISTS ville     text,
    ADD COLUMN IF NOT EXISTS latitude  double precision
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    ADD COLUMN IF NOT EXISTS longitude double precision
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);

-- Index pour la recherche texte par ville (ILIKE).
CREATE INDEX IF NOT EXISTS idx_etablissements_ville
    ON public.etablissements (lower(ville));

COMMENT ON COLUMN public.etablissements.ville     IS 'Ville du bar (libre, ex « Paris », « Lyon »). Utilisé pour la recherche texte.';
COMMENT ON COLUMN public.etablissements.latitude  IS 'Latitude WGS84 du bar pour la recherche autour de moi.';
COMMENT ON COLUMN public.etablissements.longitude IS 'Longitude WGS84 du bar pour la recherche autour de moi.';

-- Met à jour les établissements de démo avec coordonnées plausibles.
UPDATE public.etablissements
   SET ville     = 'Paris',
       latitude  = 48.8625,
       longitude = 2.3781
 WHERE slug_public = 'comptoir-des-champions'
   AND latitude IS NULL;

UPDATE public.etablissements
   SET ville     = 'New York',
       latitude  = 40.7295,
       longitude = -73.9921
 WHERE slug_public = 'goal-line-nyc'
   AND latitude IS NULL;
