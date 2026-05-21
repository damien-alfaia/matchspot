-- =====================================================================
-- Migration 0003 — Solde de places restantes par diffusion
--
-- Une visiteuse anonyme n'a pas le droit de lire `reservations` (RLS).
-- On expose donc un agrégat numérique via une fonction SECURITY DEFINER
-- qui ne renvoie que (diffusion_id, places_restantes) — aucune PII.
--
-- La fonction se limite explicitement aux diffusions publiées ET
-- publiques pour éviter toute fuite d'information sur les brouillons.
-- Les réservations annulées sont ignorées du décompte.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.soldes_places_diffusions(_diffusion_ids uuid[])
RETURNS TABLE (diffusion_id uuid, places_restantes int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        d.id,
        GREATEST(
            0,
            d.places_disponibles
              - COALESCE(
                  SUM(r.taille_groupe) FILTER (
                      WHERE r.statut IN ('en_attente', 'confirmee')
                  ),
                  0
                )::int
        )
      FROM public.diffusions d
      LEFT JOIN public.reservations r ON r.diffusion_id = d.id
     WHERE d.id           = ANY(_diffusion_ids)
       AND d.statut       = 'publiee'
       AND d.est_publique = true
     GROUP BY d.id, d.places_disponibles;
$$;

COMMENT ON FUNCTION public.soldes_places_diffusions(uuid[]) IS
  'Agrégat des places restantes pour les diffusions publiées et publiques. '
  'Aucune réservation individuelle n''est exposée.';

GRANT EXECUTE ON FUNCTION public.soldes_places_diffusions(uuid[]) TO anon, authenticated;
