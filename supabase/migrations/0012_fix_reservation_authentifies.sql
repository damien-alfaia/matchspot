-- =====================================================================
-- Migration 0012 — Réservation autorisée aux utilisateurs authentifiés
-- (en plus des anonymes) sur les diffusions publiques.
--
-- Bug observé : un utilisateur connecté (ex. propriétaire d'un bar)
-- qui essaie de réserver sur le bar d'une autre organisation reçoit
-- « new row violates row-level security policy for table reservations ».
--
-- Cause : la policy reservations_insert_public était limitée à
-- `TO anon`. Pour un user authentifié, c'est reservations_insert_staff
-- qui s'applique, et elle exige qu'il soit membre de l'organisation
-- propriétaire — ce qui n'est pas le cas pour quelqu'un qui réserve
-- comme client.
--
-- Fix : étendre la policy publique à `anon, authenticated`. Le contrôle
-- métier (diffusion publiée ET publique, statut initial en_attente)
-- reste identique. Pas de risque : la diffusion doit être explicitement
-- marquée publique pour accepter une résa via cette policy.
-- =====================================================================

DROP POLICY IF EXISTS reservations_insert_public ON public.reservations;

CREATE POLICY reservations_insert_public
    ON public.reservations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        statut = 'en_attente'
        AND EXISTS (
            SELECT 1
              FROM public.diffusions d
             WHERE d.id            = reservations.diffusion_id
               AND d.statut        = 'publiee'
               AND d.est_publique  = true
        )
    );

-- La policy reservations_insert_staff (membre de l'organisation) reste
-- intacte : elle permet à un staff de saisir une résa au comptoir sur
-- une diffusion qui n'est PAS publique (statut brouillon par exemple).
