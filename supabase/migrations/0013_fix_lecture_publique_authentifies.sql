-- =====================================================================
-- Migration 0013 — Lecture publique des établissements et diffusions
-- ouverte aussi aux utilisateurs authentifiés.
--
-- Bug observé : un utilisateur connecté (ex. propriétaire d'un bar)
-- qui ouvre l'URL publique d'un bar appartenant à une autre organisation
-- voit « Établissement introuvable », alors que la page fonctionne
-- normalement quand il est déconnecté.
--
-- Cause : les policies `etablissements_select_public` et
-- `diffusions_select_public` étaient limitées à `TO anon`. Pour un user
-- authentifié, ce sont les policies `_select_membres` qui s'appliquent,
-- et elles exigent l'appartenance à l'organisation propriétaire — ce
-- qui n'est pas le cas pour quelqu'un qui consulte la fiche publique
-- d'un autre bar (ex. découverte via le moteur de recherche).
--
-- Fix : étendre les policies publiques à `anon, authenticated`. Pas de
-- fuite de données : etablissements ne contient que des infos
-- intrinsèquement publiques (nom, adresse, horaires, photos), et la
-- policy diffusions reste filtrée sur statut='publiee' ET est_publique.
--
-- Même pattern que la migration 0012 sur reservations.
-- =====================================================================

DROP POLICY IF EXISTS etablissements_select_public ON public.etablissements;

CREATE POLICY etablissements_select_public
    ON public.etablissements
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS diffusions_select_public ON public.diffusions;

CREATE POLICY diffusions_select_public
    ON public.diffusions
    FOR SELECT
    TO anon, authenticated
    USING (statut = 'publiee' AND est_publique = true);

-- Les policies `_select_membres` restent intactes : elles permettent à
-- un membre de voir tous les bars/diffusions de son organisation, y
-- compris les diffusions en brouillon ou non publiques.
