-- =====================================================================
-- Migration 0014 — Mode de réservation par établissement
--
-- Certains bars veulent gérer leurs résas en interne (téléphone, email)
-- plutôt que via le formulaire MatchSpot. On ajoute une colonne
-- `mode_reservation` sur etablissements pour piloter ça côté page
-- publique :
--   - 'app'       : formulaire de résa en ligne (défaut, comportement
--                   actuel)
--   - 'telephone' : on n'affiche pas le formulaire, on met en avant
--                   le numéro de téléphone existant
--   - 'email'     : on n'affiche pas le formulaire, on met en avant
--                   un mailto:
--
-- Pour 'email', on réutilise l'email du compte propriétaire si rien
-- n'est précisé — colonne `email_reservation` optionnelle pour
-- override (par exemple resa@monbar.fr distinct de l'admin).
-- =====================================================================

CREATE TYPE public.mode_reservation AS ENUM ('app', 'telephone', 'email');

ALTER TABLE public.etablissements
    ADD COLUMN mode_reservation public.mode_reservation NOT NULL DEFAULT 'app',
    ADD COLUMN email_reservation text;

COMMENT ON COLUMN public.etablissements.mode_reservation IS
  'Canal préféré du bar pour recevoir les résas client : app (formulaire MatchSpot), telephone, ou email.';
COMMENT ON COLUMN public.etablissements.email_reservation IS
  'Email de contact spécifique pour les résas si mode_reservation = email. Null = on prend l''email du propriétaire.';
