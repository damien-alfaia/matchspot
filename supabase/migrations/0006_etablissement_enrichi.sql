-- =====================================================================
-- Migration 0006 — Enrichissement des établissements (B2C-2)
--
-- Ajoute les champs descriptifs nécessaires à la page publique : photo,
-- description courte, téléphone, horaires d'ouverture (JSONB).
-- Crée également un bucket de stockage pour les photos.
-- =====================================================================

ALTER TABLE public.etablissements
    ADD COLUMN IF NOT EXISTS telephone          text,
    ADD COLUMN IF NOT EXISTS description_courte text
        CHECK (description_courte IS NULL OR char_length(description_courte) <= 280),
    ADD COLUMN IF NOT EXISTS url_photo          text,
    ADD COLUMN IF NOT EXISTS horaires_ouverture jsonb;

COMMENT ON COLUMN public.etablissements.telephone          IS 'Téléphone affiché sur la page publique (format libre).';
COMMENT ON COLUMN public.etablissements.description_courte IS 'Pitch en 280 caractères max. affiché sur la page publique.';
COMMENT ON COLUMN public.etablissements.url_photo          IS 'URL d''une photo (bandeau page publique). Storage Supabase ou externe.';
COMMENT ON COLUMN public.etablissements.horaires_ouverture IS
    'Horaires d''ouverture, format JSONB libre. Ex : {"lundi":"17h-2h","mardi":"17h-2h"}';

-- =====================================================================
-- Bucket Storage pour les photos d'établissements.
-- Idempotent. Politique : lecture publique, écriture restreinte.
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('etablissements-photos', 'etablissements-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique du bucket (toutes les photos).
DROP POLICY IF EXISTS "photos_etablissements_select_public" ON storage.objects;
CREATE POLICY "photos_etablissements_select_public"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'etablissements-photos');

-- Écriture limitée aux utilisateurs authentifiés (le contrôle d'appartenance
-- à l'organisation se fait côté front au moment de l'upload, l'URL résultante
-- est rangée dans etablissements.url_photo après validation RLS sur cette table).
DROP POLICY IF EXISTS "photos_etablissements_insert_authentifies" ON storage.objects;
CREATE POLICY "photos_etablissements_insert_authentifies"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'etablissements-photos');

DROP POLICY IF EXISTS "photos_etablissements_update_authentifies" ON storage.objects;
CREATE POLICY "photos_etablissements_update_authentifies"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'etablissements-photos')
    WITH CHECK (bucket_id = 'etablissements-photos');

DROP POLICY IF EXISTS "photos_etablissements_delete_authentifies" ON storage.objects;
CREATE POLICY "photos_etablissements_delete_authentifies"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'etablissements-photos');
