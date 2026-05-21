-- =====================================================================
-- Migration 0008 — Résultats matchs + propagation des qualifiés (B2B-4)
--
-- Une table simple pour enregistrer le vainqueur / le perdant de chaque
-- match terminé, et une RPC qui résout les placeholders « Vainqueur 16e
-- #N » dans la table `matchs` en cascade.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.resultats_matchs (
    numero_match int  PRIMARY KEY CHECK (numero_match BETWEEN 1 AND 104),
    gagnant      text NOT NULL,
    perdant      text NOT NULL,
    saisi_le     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resultats_matchs IS
  'Vainqueur et perdant de chaque match terminé (saisie manuelle MatchSpot).';

ALTER TABLE public.resultats_matchs ENABLE ROW LEVEL SECURITY;

-- Lecture publique : utile pour afficher « France qualifiée pour les 8es »
-- côté visiteur si on veut un jour.
CREATE POLICY resultats_matchs_select_public
    ON public.resultats_matchs
    FOR SELECT
    USING (true);

-- Écriture limitée aux propriétaires d'organisations (les utilisateurs
-- internes MatchSpot, qui sont propriétaires de l'organisation de tête).
-- Pour le MVP, on autorise tout propriétaire ; à durcir plus tard si on
-- ajoute un rôle « admin plateforme ».
CREATE POLICY resultats_matchs_insert_proprietaires
    ON public.resultats_matchs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.adhesions a
             WHERE a.utilisateur_id = auth.uid()
               AND a.role           = 'proprietaire'
        )
    );

CREATE POLICY resultats_matchs_update_proprietaires
    ON public.resultats_matchs
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.adhesions a
             WHERE a.utilisateur_id = auth.uid()
               AND a.role           = 'proprietaire'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.adhesions a
             WHERE a.utilisateur_id = auth.uid()
               AND a.role           = 'proprietaire'
        )
    );

CREATE POLICY resultats_matchs_delete_proprietaires
    ON public.resultats_matchs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.adhesions a
             WHERE a.utilisateur_id = auth.uid()
               AND a.role           = 'proprietaire'
        )
    );

-- =====================================================================
-- RPC propager_qualifies
--
-- Remplace les placeholders « Vainqueur Xe #N » et « Perdant Demi #N »
-- dans les matchs aval, en cascade, par les vrais noms d'équipes issus
-- de `resultats_matchs`. Idempotente : on peut la rejouer.
--
-- SECURITY DEFINER pour bypasser la RLS de matchs (qui interdit toute
-- écriture côté API). Réservée aux propriétaires (cf. check ci-dessous).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.propager_qualifies()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id      uuid;
    v_nb_modifs    int := 0;
    v_iteration    int := 0;
    v_modifs_iter  int;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.' USING ERRCODE = '28000';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.adhesions
         WHERE utilisateur_id = v_user_id AND role = 'proprietaire'
    ) THEN
        RAISE EXCEPTION 'Réservé aux propriétaires.' USING ERRCODE = '42501';
    END IF;

    -- Propagation en boucle pour gérer les cascades (un quart dépend d'un 8e
    -- qui dépend d'un 16e). Maximum 10 itérations par sécurité.
    LOOP
        v_iteration := v_iteration + 1;
        EXIT WHEN v_iteration > 10;
        v_modifs_iter := 0;

        -- Remplace "Vainqueur 16e #N", "Vainqueur 8e #N", etc.
        UPDATE public.matchs m
           SET equipe_domicile = sub.gagnant
          FROM (
              SELECT
                  '%Vainqueur 16e #' || rm.numero_match || '%' AS pattern_16e_v,
                  '%Vainqueur 8e #'  || rm.numero_match || '%' AS pattern_8e_v,
                  '%Vainqueur Quart #' || rm.numero_match || '%' AS pattern_quart_v,
                  '%Vainqueur Demi #' || rm.numero_match || '%' AS pattern_demi_v,
                  '%Perdant Demi #'   || rm.numero_match || '%' AS pattern_demi_p,
                  rm.numero_match,
                  rm.gagnant,
                  rm.perdant
                FROM public.resultats_matchs rm
          ) sub
         WHERE (
             m.equipe_domicile = 'Vainqueur 16e #'   || sub.numero_match
          OR m.equipe_domicile = 'Vainqueur 8e #'    || sub.numero_match
          OR m.equipe_domicile = 'Vainqueur Quart #' || sub.numero_match
          OR m.equipe_domicile = 'Vainqueur Demi #'  || sub.numero_match
         );

        GET DIAGNOSTICS v_modifs_iter = ROW_COUNT;
        v_nb_modifs := v_nb_modifs + v_modifs_iter;

        UPDATE public.matchs m
           SET equipe_exterieur = sub.gagnant
          FROM (
              SELECT rm.numero_match, rm.gagnant
                FROM public.resultats_matchs rm
          ) sub
         WHERE (
             m.equipe_exterieur = 'Vainqueur 16e #'   || sub.numero_match
          OR m.equipe_exterieur = 'Vainqueur 8e #'    || sub.numero_match
          OR m.equipe_exterieur = 'Vainqueur Quart #' || sub.numero_match
          OR m.equipe_exterieur = 'Vainqueur Demi #'  || sub.numero_match
         );

        GET DIAGNOSTICS v_modifs_iter = ROW_COUNT;
        v_nb_modifs := v_nb_modifs + v_modifs_iter;

        -- Perdants (match pour la 3e place).
        UPDATE public.matchs m
           SET equipe_domicile = sub.perdant
          FROM (
              SELECT rm.numero_match, rm.perdant
                FROM public.resultats_matchs rm
          ) sub
         WHERE m.equipe_domicile = 'Perdant Demi #' || sub.numero_match;

        GET DIAGNOSTICS v_modifs_iter = ROW_COUNT;
        v_nb_modifs := v_nb_modifs + v_modifs_iter;

        UPDATE public.matchs m
           SET equipe_exterieur = sub.perdant
          FROM (
              SELECT rm.numero_match, rm.perdant
                FROM public.resultats_matchs rm
          ) sub
         WHERE m.equipe_exterieur = 'Perdant Demi #' || sub.numero_match;

        GET DIAGNOSTICS v_modifs_iter = ROW_COUNT;
        v_nb_modifs := v_nb_modifs + v_modifs_iter;

        -- Si plus aucune modif sur cette itération, on sort.
        EXIT WHEN v_modifs_iter = 0;
    END LOOP;

    RETURN v_nb_modifs;
END;
$$;

COMMENT ON FUNCTION public.propager_qualifies() IS
  'Remplace les placeholders Vainqueur/Perdant des matchs aval par les vrais noms d''équipes en cascade.';

GRANT EXECUTE ON FUNCTION public.propager_qualifies() TO authenticated;
