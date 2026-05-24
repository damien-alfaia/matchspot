# MatchSpot — guide pour les agents Claude Code

Plateforme SaaS B2B + grand public de gestion de soirées de diffusion des
matchs de la Coupe du Monde 2026. Cible : France.

## Stack verrouillée

- React 18 + TypeScript strict + Vite + Tailwind CSS (dossier `web/`).
- Supabase Cloud ou local : Postgres + Auth + Row Level Security + Realtime
  + Edge Functions Deno (`supabase/`).
- Pas de backend séparé. Pas d'ORM. Accès via `@supabase/supabase-js`.
- **Toute la langue du projet est le français** : noms de variables,
  fonctions, types, commentaires, messages de commit, docs, UI.

## Structure du monorepo

```
/web                  → app React (Vite)
/supabase/migrations  → schéma SQL + policies RLS (numérotées 0001..0008)
/supabase/seed        → 01_matchs.sql (104 matchs CdM) + 02_demo.sql
/supabase/functions   → Edge Functions Deno (Resend)
/docs                 → PLAN.md, DECISIONS.md, CALENDRIER.md
```

## Conventions

- Commits atomiques en français. Co-authored par Claude obligatoire.
- Coups d'envoi stockés en `timestamptz` UTC, conversion via Postgres
  `AT TIME ZONE` ou la fonction utilitaire `web/src/utils/fuseaux.ts`.
- RLS active sur toutes les tables. Fonctions `SECURITY DEFINER` pour les
  RPC d'agrégat (`soldes_places_diffusions`, `rechercher_bars`,
  `creer_organisation_bar_initial`, `propager_qualifies`).
- Migrations idempotentes côté seed (`ON CONFLICT DO NOTHING`).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
