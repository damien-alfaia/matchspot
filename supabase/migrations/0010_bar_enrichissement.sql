-- =====================================================================
-- Migration 0010 — Enrichissement page bar (B2C-2 suite)
--
-- Ajoute les attributs qu'un visiteur veut voir avant de réserver :
-- nombre/taille d'écrans, niveau sonore, types d'ambiance, autres
-- compétitions diffusées habituellement, photos supplémentaires.
--
-- Tous les champs sont nullable : un bar n'est jamais obligé de les
-- renseigner pour fonctionner.
-- =====================================================================

ALTER TABLE public.etablissements
    ADD COLUMN IF NOT EXISTS nombre_ecrans          int
        CHECK (nombre_ecrans IS NULL OR (nombre_ecrans >= 0 AND nombre_ecrans <= 50)),
    ADD COLUMN IF NOT EXISTS taille_ecrans          text,
    ADD COLUMN IF NOT EXISTS son_ambiance           text
        CHECK (son_ambiance IS NULL OR son_ambiance IN ('calme', 'normal', 'fort', 'crowd')),
    ADD COLUMN IF NOT EXISTS type_ambiance          text[],
    ADD COLUMN IF NOT EXISTS equipes_habituelles    text[],
    ADD COLUMN IF NOT EXISTS photos_supplementaires text[];

COMMENT ON COLUMN public.etablissements.nombre_ecrans IS
  'Nombre d''écrans diffusant le sport. Borne haute 50 pour éviter une saisie aberrante.';
COMMENT ON COLUMN public.etablissements.taille_ecrans IS
  'Description libre courte : « 1 grand écran 4m + 3 écrans 55 pouces ».';
COMMENT ON COLUMN public.etablissements.son_ambiance IS
  'Niveau sonore typique les soirs de match : calme | normal | fort | crowd.';
COMMENT ON COLUMN public.etablissements.type_ambiance IS
  'Tags d''ambiance : supporters, famille, chill, apero, foule, etc.';
COMMENT ON COLUMN public.etablissements.equipes_habituelles IS
  'Autres compétitions habituellement diffusées : Ligue 1, Champions League, NBA, etc.';
COMMENT ON COLUMN public.etablissements.photos_supplementaires IS
  'URLs des photos additionnelles affichées en carrousel sur la page publique.';

-- Optionnel : pré-remplir les bars de démo avec quelques valeurs réalistes
-- pour qu'on puisse tester l'affichage immédiatement.
UPDATE public.etablissements
   SET nombre_ecrans       = 5,
       taille_ecrans       = '1 écran géant 3m + 4 écrans 55 pouces répartis dans la salle',
       son_ambiance        = 'fort',
       type_ambiance       = ARRAY['supporters', 'apero', 'foule'],
       equipes_habituelles = ARRAY['Ligue 1', 'Champions League', 'Coupe du Monde']
 WHERE slug_public = 'comptoir-des-champions'
   AND nombre_ecrans IS NULL;

UPDATE public.etablissements
   SET nombre_ecrans       = 8,
       taille_ecrans       = '2 grands écrans + 6 écrans 50 pouces',
       son_ambiance        = 'crowd',
       type_ambiance       = ARRAY['supporters', 'foule'],
       equipes_habituelles = ARRAY['NFL', 'NBA', 'MLB', 'Champions League']
 WHERE slug_public = 'goal-line-nyc'
   AND nombre_ecrans IS NULL;
