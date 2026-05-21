-- =====================================================================
-- Seed démo
--
-- Crée une organisation, un établissement parisien et un abonnement.
-- L'adhésion d'un utilisateur réel doit être faite après création du
-- compte Auth (voir README, section « Lancer une démo »).
--
-- Idempotent : ON CONFLICT (slug) DO NOTHING.
-- =====================================================================

-- Organisation de démo
INSERT INTO public.organisations (id, nom, slug)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Bar de démo',
    'bar-de-demo'
)
ON CONFLICT (slug) DO NOTHING;

-- Établissement parisien attaché à l'organisation
INSERT INTO public.etablissements (
    id,
    organisation_id,
    nom,
    adresse,
    fuseau_horaire,
    capacite,
    slug_public,
    ville,
    latitude,
    longitude
)
VALUES (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Le Comptoir des Champions',
    '12 rue de la Coupe, 75011 Paris',
    'Europe/Paris',
    120,
    'comptoir-des-champions',
    'Paris',
    48.8625,
    2.3781
)
ON CONFLICT (slug_public) DO NOTHING;

-- Établissement new-yorkais pour tester la conversion fuseau US
INSERT INTO public.etablissements (
    id,
    organisation_id,
    nom,
    adresse,
    fuseau_horaire,
    capacite,
    slug_public,
    ville,
    latitude,
    longitude
)
VALUES (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    'The Goal Line — NYC',
    '742 Broadway, New York, NY 10003',
    'America/New_York',
    80,
    'goal-line-nyc',
    'New York',
    40.7295,
    -73.9921
)
ON CONFLICT (slug_public) DO NOTHING;

-- Abonnement gratuit par défaut
INSERT INTO public.abonnements (organisation_id, formule, statut)
VALUES ('00000000-0000-0000-0000-000000000001', 'gratuit', 'actif')
ON CONFLICT (organisation_id) DO NOTHING;

-- =====================================================================
-- Adhésion automatique
--
-- Si un utilisateur s'est déjà inscrit avec l'email demo@matchspot.test,
-- on l'attache automatiquement à l'organisation de démo en tant que
-- propriétaire. Sinon, ce bloc ne fait rien.
-- =====================================================================
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id
      FROM auth.users
     WHERE email = 'demo@matchspot.test'
     LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.adhesions (organisation_id, utilisateur_id, role)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            v_user_id,
            'proprietaire'
        )
        ON CONFLICT (organisation_id, utilisateur_id) DO NOTHING;
    END IF;
END;
$$;
