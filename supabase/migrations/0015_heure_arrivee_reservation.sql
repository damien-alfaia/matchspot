-- =====================================================================
-- Migration 0015 — Heure d'arrivée optionnelle sur les réservations
--
-- Permet au client d'indiquer à quelle heure il prévoit d'arriver. Aide
-- le bar à dimensionner le service. Optionnel : si non fourni, NULL.
--
-- Format `time` (sans date ni fuseau) : on stocke uniquement HH:MM
-- relatif au fuseau de l'établissement. Affichage côté staff via
-- `to_char(...)` ou String.fromTimePart côté front.
-- =====================================================================

ALTER TABLE public.reservations
    ADD COLUMN heure_arrivee time;

COMMENT ON COLUMN public.reservations.heure_arrivee IS
  'Heure d''arrivée prévue par le client (HH:MM, fuseau de l''établissement). NULL si non précisé.';
