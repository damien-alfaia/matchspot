# MatchDay

Plateforme SaaS B2B de gestion des soirées de diffusion des matchs de la
**Coupe du Monde 2026** pour bars et restaurants. Cible prioritaire :
France.

> Ce n'est pas un annuaire de découverte de bars : c'est un **outil de
> gestion opérationnel** vendu au bar par abonnement. Les bars choisissent
> les matchs qu'ils diffusent, fixent la capacité de leur soirée et
> collectent les réservations de leurs clients — avec une gestion des
> fuseaux horaires de premier plan (matchs en Amérique du Nord, bars en
> Europe).

## Stack

- **Frontend** : React 18 + TypeScript strict + Vite + Tailwind CSS.
- **Backend** : Supabase — Postgres + Auth + Row Level Security +
  Realtime, accédé via `@supabase/supabase-js`. Aucun service applicatif
  séparé.
- **Calendrier** : 104 matchs en seed SQL versionné, coups d'envoi
  stockés en UTC (`timestamptz`).

## Structure du monorepo

```
/web                  → app React (Vite)
/supabase/migrations  → schéma SQL + policies RLS
/supabase/seed        → seed (calendrier des 104 matchs + démo)
/docs                 → PLAN, DECISIONS, CALENDRIER
```

## Prérequis

- Node.js ≥ 18.
- Un projet Supabase (cloud ou local via la CLI).
- (Optionnel) [Supabase CLI](https://supabase.com/docs/guides/cli) pour
  exécuter les migrations en local.

## Mise en route

### 1. Provisionner la base Supabase

**Option A — Supabase Cloud** (recommandé pour démarrer vite) :

1. Créer un projet sur https://supabase.com.
2. Dans l'éditeur SQL du dashboard, exécuter dans l'ordre :
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/seed/01_matchs.sql`
   - `supabase/seed/02_demo.sql`
3. Récupérer dans **Project Settings → API** :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

**Option B — Supabase CLI local** :

```bash
supabase start
supabase db reset            # applique migrations + concatène seed/*.sql
```

### 2. Configurer le front

```bash
cd web
cp .env.example .env.local
# éditer .env.local avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

L'app est disponible sur http://localhost:5173.

### 3. Démarrer une démo

Le seed `02_demo.sql` crée :

- L'organisation `Bar de démo` (slug `bar-de-demo`).
- L'établissement `Le Comptoir des Champions` (Paris, capacité 120,
  fuseau `Europe/Paris`, slug public `comptoir-des-champions`).
- L'établissement `The Goal Line — NYC` (fuseau `America/New_York`, slug
  public `goal-line-nyc`) — pratique pour comparer le rendu fuseau.

Pour devenir propriétaire de l'organisation de démo :

1. Lancer le front, aller sur `/connexion`, cliquer sur « S'inscrire »
   et créer le compte avec l'email `demo@matchday.test`.
2. Rejouer `supabase/seed/02_demo.sql` (idempotent) : le bloc DO final
   trouvera votre utilisateur et créera l'adhésion.
3. Se connecter avec `demo@matchday.test` : le tableau de bord liste
   les deux établissements.

Si vous préférez un autre email, créez l'adhésion à la main dans l'éditeur
SQL :

```sql
INSERT INTO public.adhesions (organisation_id, utilisateur_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'votre@email.fr'),
  'proprietaire'
);
```

## Tester le parcours complet

### Parcours staff

1. Connectez-vous avec un compte rattaché à l'organisation de démo.
2. Choisissez un établissement.
3. Dans le formulaire de droite, ajoutez une diffusion :
   - Sélectionnez un match (ex. France – Sénégal, match #17).
   - Renseignez les places disponibles.
   - Cliquez sur « Créer la diffusion ».
4. Sur la diffusion créée, cochez « Visible sur la page publique » puis
   cliquez sur « Publier ».

### Parcours client

1. Ouvrez la page publique : http://localhost:5173/etablissements/comptoir-des-champions.
2. La diffusion publiée doit apparaître avec son horaire **converti dans
   le fuseau de l'établissement**.
3. Remplissez le formulaire de réservation (nom, email, taille de
   groupe) et soumettez.

### Tester le Realtime

1. Ouvrez deux fenêtres : la page staff
   (`/tableau-de-bord/etablissements/<id>`) et la page publique
   (`/etablissements/comptoir-des-champions`).
2. Côté public, créez une réservation.
3. Côté staff, la réservation apparaît dans le tableau « Réservations
   (live) » sans rafraîchissement.

## Tests automatiques

```bash
cd web
npm test
```

Couvre principalement la fonction de formatage des fuseaux (le risque
métier le plus important pour le MVP).

## Vérification rapide des données

Quelques requêtes utiles dans l'éditeur SQL :

```sql
-- Doit renvoyer 104.
SELECT count(*) FROM public.matchs;

-- Match d'ouverture en heure de Paris : doit afficher 2026-06-11 21:00:00.
SELECT (coup_envoi_utc AT TIME ZONE 'Europe/Paris') AS heure_paris
  FROM public.matchs
 WHERE numero_match = 1;

-- Finale en heure de New York (heure locale du stade) : 2026-07-19 15:00:00.
SELECT (coup_envoi_utc AT TIME ZONE 'America/New_York') AS heure_ny
  FROM public.matchs
 WHERE numero_match = 104;
```

## Documentation

- [PLAN.md](docs/PLAN.md) — phases et critères de vérification.
- [DECISIONS.md](docs/DECISIONS.md) — décisions prises sans
  spécification explicite.
- [CALENDRIER.md](docs/CALENDRIER.md) — sources web, méthode de
  conversion en UTC, incertitudes.

## Hors périmètre (MVP)

Volontairement exclus de ce run, listés sous forme de TODO commentés
dans le code :

- Paiement / arrhes en ligne (Stripe).
- Module d'animation de salle.
- App mobile native.
- Live scores.
- Multi-rôles fin au-delà de `proprietaire` / `staff`.
- Internationalisation (`i18n`).
- Facturation Stripe.

## Sécurité

- **Aucun secret en dur** : tout passe par les variables d'environnement
  Vite. La clé Supabase exposée côté front est la `anon` (publique par
  conception, sécurisée par les policies RLS).
- **RLS active** sur toutes les tables. Détail des règles dans
  `supabase/migrations/0002_rls.sql` et synthèse dans `docs/DECISIONS.md`
  (D-009).
