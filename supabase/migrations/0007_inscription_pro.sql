-- =====================================================================
-- Migration 0007 — Onboarding self-service (B2B-1)
--
-- RPC SECURITY DEFINER qui, en une transaction, crée une organisation,
-- l'adhésion propriétaire pour l'utilisateur courant, l'abonnement
-- gratuit par défaut et un premier établissement.
--
-- Réservé aux utilisateurs authentifiés ; aucune création d'organisation
-- en SQL direct (la table organisations garde son ENABLE RLS sans policy
-- INSERT).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.creer_organisation_bar_initial(
    _nom_organisation   text,
    _slug_organisation  text,
    _nom_bar            text,
    _slug_public_bar    text,
    _adresse            text,
    _ville              text,
    _fuseau_horaire     text,
    _capacite           int,
    _latitude           double precision DEFAULT NULL,
    _longitude          double precision DEFAULT NULL
)
RETURNS TABLE (
    organisation_id   uuid,
    etablissement_id  uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id    uuid;
    v_org_id     uuid;
    v_etab_id    uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.'
            USING ERRCODE = '28000';
    END IF;

    -- Validation rapide des entrées critiques.
    IF char_length(trim(_nom_organisation)) = 0 OR char_length(trim(_nom_bar)) = 0 THEN
        RAISE EXCEPTION 'Nom d''organisation et nom de bar requis.'
            USING ERRCODE = '22023';
    END IF;
    IF _capacite IS NULL OR _capacite <= 0 THEN
        RAISE EXCEPTION 'Capacité invalide.'
            USING ERRCODE = '22023';
    END IF;
    IF _fuseau_horaire IS NULL OR char_length(_fuseau_horaire) = 0 THEN
        RAISE EXCEPTION 'Fuseau horaire requis.'
            USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.organisations (nom, slug)
    VALUES (_nom_organisation, _slug_organisation)
    RETURNING id INTO v_org_id;

    INSERT INTO public.adhesions (organisation_id, utilisateur_id, role)
    VALUES (v_org_id, v_user_id, 'proprietaire');

    INSERT INTO public.abonnements (organisation_id, formule, statut)
    VALUES (v_org_id, 'gratuit', 'actif')
    ON CONFLICT (organisation_id) DO NOTHING;

    INSERT INTO public.etablissements (
        organisation_id, nom, adresse, ville,
        fuseau_horaire, capacite, slug_public,
        latitude, longitude
    )
    VALUES (
        v_org_id, _nom_bar, _adresse, _ville,
        _fuseau_horaire, _capacite, _slug_public_bar,
        _latitude, _longitude
    )
    RETURNING id INTO v_etab_id;

    organisation_id  := v_org_id;
    etablissement_id := v_etab_id;
    RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.creer_organisation_bar_initial IS
  'Crée org + adhésion propriétaire + abonnement + premier bar pour l''utilisateur courant.';

GRANT EXECUTE ON FUNCTION public.creer_organisation_bar_initial(
    text, text, text, text, text, text, text, int, double precision, double precision
) TO authenticated;
