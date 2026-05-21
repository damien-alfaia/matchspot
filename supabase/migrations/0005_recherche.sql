-- =====================================================================
-- Migration 0005 — RPC de recherche de bars
--
-- Une RPC SECURITY DEFINER qui retourne les bars diffusant un match
-- donné, filtré par ville (ILIKE) ou par rayon autour d'un point.
-- Calcule la distance Haversine en SQL pur (pas de dépendance PostGIS).
--
-- N'expose AUCUNE information sur les réservations individuelles ni
-- sur les diffusions non publiques.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.rechercher_bars(
    _match_id  uuid,
    _ville     text             DEFAULT NULL,
    _lat       double precision DEFAULT NULL,
    _lng       double precision DEFAULT NULL,
    _rayon_km  int              DEFAULT 25
)
RETURNS TABLE (
    etablissement_id  uuid,
    nom               text,
    adresse           text,
    ville             text,
    slug_public       text,
    fuseau_horaire    text,
    diffusion_id      uuid,
    places_disponibles int,
    places_restantes  int,
    distance_km       double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH soldes AS (
        SELECT
            d.id,
            d.etablissement_id,
            d.places_disponibles,
            GREATEST(
                0,
                d.places_disponibles
                  - COALESCE(
                      SUM(r.taille_groupe) FILTER (
                          WHERE r.statut IN ('en_attente', 'confirmee')
                      ),
                      0
                    )::int
            ) AS places_restantes
          FROM public.diffusions d
          LEFT JOIN public.reservations r ON r.diffusion_id = d.id
         WHERE d.match_id     = _match_id
           AND d.statut       = 'publiee'
           AND d.est_publique = true
         GROUP BY d.id, d.etablissement_id, d.places_disponibles
    )
    SELECT
        e.id,
        e.nom,
        e.adresse,
        e.ville,
        e.slug_public,
        e.fuseau_horaire,
        s.id,
        s.places_disponibles,
        s.places_restantes,
        CASE
            WHEN _lat IS NULL OR _lng IS NULL
              OR e.latitude IS NULL OR e.longitude IS NULL
            THEN NULL
            ELSE
                -- Haversine, rayon Terre 6371 km.
                2 * 6371 * asin(
                    sqrt(
                        sin(radians((_lat - e.latitude) / 2)) ^ 2
                        + cos(radians(e.latitude))
                        * cos(radians(_lat))
                        * sin(radians((_lng - e.longitude) / 2)) ^ 2
                    )
                )
        END AS distance_km
      FROM soldes s
      JOIN public.etablissements e ON e.id = s.etablissement_id
     WHERE
        -- Filtre ville (ignoré si NULL ou vide).
        (
            _ville IS NULL
            OR length(trim(_ville)) = 0
            OR e.ville ILIKE '%' || trim(_ville) || '%'
        )
        -- Filtre rayon (seulement si lat/lng fournis).
        AND (
            _lat IS NULL OR _lng IS NULL
            OR e.latitude IS NULL OR e.longitude IS NULL
            OR (
                2 * 6371 * asin(
                    sqrt(
                        sin(radians((_lat - e.latitude) / 2)) ^ 2
                        + cos(radians(e.latitude))
                        * cos(radians(_lat))
                        * sin(radians((_lng - e.longitude) / 2)) ^ 2
                    )
                )
            ) <= _rayon_km
        )
     ORDER BY
        -- Bars géolocalisés d'abord triés par distance, puis le reste.
        distance_km NULLS LAST,
        e.nom;
$$;

COMMENT ON FUNCTION public.rechercher_bars(uuid, text, double precision, double precision, int) IS
  'Recherche les bars diffusant publiquement un match donné, optionnellement filtrés par ville ou rayon géographique.';

GRANT EXECUTE ON FUNCTION public.rechercher_bars(uuid, text, double precision, double precision, int)
    TO anon, authenticated;
