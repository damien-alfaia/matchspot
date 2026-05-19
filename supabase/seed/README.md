# Seeds

Ordre d'application :

1. `01_matchs.sql` — calendrier officiel des 104 matchs (UTC). Idempotent.
2. `02_demo.sql` — organisation, deux établissements et abonnement de
   démo. Idempotent.

Concaténez si vous préférez un seul fichier :

```bash
cat supabase/seed/01_matchs.sql supabase/seed/02_demo.sql > supabase/seed.sql
```

Ces seeds sont conçus pour fonctionner avec `supabase db reset` (qui
applique migrations + concatène les fichiers de `supabase/seed/`).
