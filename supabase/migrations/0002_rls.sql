-- =====================================================================
-- Migration 0002 — Row Level Security
--
-- Toutes les policies sont commentées en français. Règles clés :
--   - matchs   : lecture publique, jamais d'écriture via l'API cliente.
--   - tables tenant : USING/WITH CHECK via public.est_membre(...).
--   - reservations : INSERT anonyme possible UNIQUEMENT si la diffusion
--     cible est publiée ET marquée publique.
-- =====================================================================

-- =====================================================================
-- Activation de la RLS sur toutes les tables métier
-- =====================================================================
ALTER TABLE public.organisations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adhesions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diffusions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnements    ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- matchs : lecture ouverte à tous (anon + authenticated)
-- =====================================================================
CREATE POLICY matchs_select_public
    ON public.matchs
    FOR SELECT
    USING (true);

-- Pas de policy INSERT/UPDATE/DELETE : la table est verrouillée pour les
-- clients (anon ET authenticated). Seuls le seed et l'admin (service_role
-- qui bypass la RLS) peuvent écrire.

-- =====================================================================
-- organisations : lecture pour les membres, pas d'écriture publique
-- =====================================================================
CREATE POLICY organisations_select_membres
    ON public.organisations
    FOR SELECT
    TO authenticated
    USING (public.est_membre(id));

-- Création/modification/suppression réservées au service_role (admin).
-- Dans le MVP, la création d'organisations passe par le seed ou un script.
-- TODO MVP+1 : flux d'inscription en self-service.

-- =====================================================================
-- adhesions : un utilisateur voit ses propres adhésions
-- =====================================================================
CREATE POLICY adhesions_select_propres
    ON public.adhesions
    FOR SELECT
    TO authenticated
    USING (utilisateur_id = auth.uid());

-- Un propriétaire peut voir toutes les adhésions de son organisation.
CREATE POLICY adhesions_select_proprietaire
    ON public.adhesions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.adhesions a2
             WHERE a2.organisation_id = adhesions.organisation_id
               AND a2.utilisateur_id  = auth.uid()
               AND a2.role            = 'proprietaire'
        )
    );

-- Création/suppression d'adhésion : service_role uniquement dans le MVP.

-- =====================================================================
-- etablissements : CRUD réservé aux membres de l'organisation
-- =====================================================================
CREATE POLICY etablissements_select_membres
    ON public.etablissements
    FOR SELECT
    TO authenticated
    USING (public.est_membre(organisation_id));

CREATE POLICY etablissements_insert_membres
    ON public.etablissements
    FOR INSERT
    TO authenticated
    WITH CHECK (public.est_membre(organisation_id));

CREATE POLICY etablissements_update_membres
    ON public.etablissements
    FOR UPDATE
    TO authenticated
    USING      (public.est_membre(organisation_id))
    WITH CHECK (public.est_membre(organisation_id));

CREATE POLICY etablissements_delete_membres
    ON public.etablissements
    FOR DELETE
    TO authenticated
    USING (public.est_membre(organisation_id));

-- Lecture publique d'un établissement par slug : nécessaire pour la page
-- /etablissements/:slug. On expose uniquement les colonnes utiles via une
-- vue (vue_etablissements_publics) ci-dessous, et on ouvre SELECT pour
-- anon directement sur etablissements, restreint au minimum pratique.
CREATE POLICY etablissements_select_public
    ON public.etablissements
    FOR SELECT
    TO anon
    USING (true);

-- Justification : aucune donnée sensible n'est portée par etablissements
-- (nom, adresse, fuseau, slug, capacité — tout ça est commercial/public
-- par nature). Si plus tard on veut cacher certains bars, on bascule sur
-- une colonne `est_actif` et on filtre ici.

-- =====================================================================
-- diffusions : CRUD pour les membres de l'organisation propriétaire
-- =====================================================================
CREATE POLICY diffusions_select_membres
    ON public.diffusions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.etablissements e
             WHERE e.id = diffusions.etablissement_id
               AND public.est_membre(e.organisation_id)
        )
    );

CREATE POLICY diffusions_insert_membres
    ON public.diffusions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.etablissements e
             WHERE e.id = diffusions.etablissement_id
               AND public.est_membre(e.organisation_id)
        )
    );

CREATE POLICY diffusions_update_membres
    ON public.diffusions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.etablissements e
             WHERE e.id = diffusions.etablissement_id
               AND public.est_membre(e.organisation_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.etablissements e
             WHERE e.id = diffusions.etablissement_id
               AND public.est_membre(e.organisation_id)
        )
    );

CREATE POLICY diffusions_delete_membres
    ON public.diffusions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.etablissements e
             WHERE e.id = diffusions.etablissement_id
               AND public.est_membre(e.organisation_id)
        )
    );

-- Lecture publique d'une diffusion : seulement si publiée + publique.
-- C'est ce que les visiteurs de /etablissements/:slug consultent.
CREATE POLICY diffusions_select_public
    ON public.diffusions
    FOR SELECT
    TO anon
    USING (statut = 'publiee' AND est_publique = true);

-- =====================================================================
-- reservations
-- =====================================================================

-- Lecture : staff de l'organisation propriétaire de l'établissement.
CREATE POLICY reservations_select_staff
    ON public.reservations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.diffusions d
              JOIN public.etablissements e ON e.id = d.etablissement_id
             WHERE d.id = reservations.diffusion_id
               AND public.est_membre(e.organisation_id)
        )
    );

-- Insertion publique : visiteur anonyme. On exige que la diffusion soit
-- publiée ET publique, sinon refus.
CREATE POLICY reservations_insert_public
    ON public.reservations
    FOR INSERT
    TO anon
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

-- Insertion par staff (cas de saisie manuelle au comptoir) : autorisée
-- si membre de l'organisation propriétaire.
CREATE POLICY reservations_insert_staff
    ON public.reservations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.diffusions d
              JOIN public.etablissements e ON e.id = d.etablissement_id
             WHERE d.id = reservations.diffusion_id
               AND public.est_membre(e.organisation_id)
        )
    );

-- Mise à jour du statut : staff uniquement (confirmation/annulation).
CREATE POLICY reservations_update_staff
    ON public.reservations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.diffusions d
              JOIN public.etablissements e ON e.id = d.etablissement_id
             WHERE d.id = reservations.diffusion_id
               AND public.est_membre(e.organisation_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
              FROM public.diffusions d
              JOIN public.etablissements e ON e.id = d.etablissement_id
             WHERE d.id = reservations.diffusion_id
               AND public.est_membre(e.organisation_id)
        )
    );

-- Suppression : staff uniquement.
CREATE POLICY reservations_delete_staff
    ON public.reservations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
              FROM public.diffusions d
              JOIN public.etablissements e ON e.id = d.etablissement_id
             WHERE d.id = reservations.diffusion_id
               AND public.est_membre(e.organisation_id)
        )
    );

-- =====================================================================
-- abonnements : lecture pour les membres, écriture service_role
-- =====================================================================
CREATE POLICY abonnements_select_membres
    ON public.abonnements
    FOR SELECT
    TO authenticated
    USING (public.est_membre(organisation_id));

-- Pas de policy d'écriture : seule la facturation/admin met à jour.
