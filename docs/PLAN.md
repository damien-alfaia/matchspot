# Plan d'implémentation — MatchDay

Plateforme SaaS B2B de gestion de soirées de diffusion des matchs de la
Coupe du Monde 2026 pour bars et restaurants. Cible prioritaire : France.

## Principes directeurs

- Outil de gestion opérationnel vendu au bar par abonnement (pas un
  annuaire de découverte).
- Gestion des fuseaux horaires de premier plan : matchs en Amérique du
  Nord, bars en Europe. Tout en UTC en base ; affichage converti au
  fuseau de l'établissement.
- Stack 100 % web + Supabase. Pas de backend séparé.
- Toute la langue du projet est le français (code, commentaires, UI,
  commits, docs).

## Stack technique verrouillée

- React + TypeScript + Vite + Tailwind CSS.
- Supabase : Postgres + Auth + RLS + Realtime, accédé via `supabase-js`.
- Calendrier des matchs : seed SQL statique versionné, idempotent.
- Tests : Vitest pour l'unitaire et l'intégration côté front.

## Découpage en phases

### Phase 0 — Calendrier de la Coupe du Monde 2026

- [x] Rechercher sur le web les 104 matchs (numéro, date, heure locale,
      stade, ville, phase).
- [x] Convertir chaque coup d'envoi en UTC. Documenter méthode et
      sources dans `docs/CALENDRIER.md`.
- [x] Pour la phase de groupes : utiliser les équipes connues si le
      tirage a eu lieu, sinon les libellés officiels.
- [x] Pour la phase à élimination directe : placeholders explicites
      (« 1er Groupe A », « Vainqueur 8e #3 », etc.) avec date/stade/UTC.
- [x] Produire `supabase/seed/01_matchs.sql` idempotent
      (`ON CONFLICT (numero_match)`).

**Vérification** : le seed s'applique sans erreur ; `SELECT count(*) FROM
matchs` renvoie 104 ; quelques spots-checks d'horaires confirmés via les
sources documentées.

### Phase 1 — Fondations

- [x] Monorepo : `web/`, `supabase/migrations/`, `supabase/seed/`,
      `docs/`.
- [x] Migrations SQL :
  - [x] Tables `organisations`, `adhesions`, `etablissements`, `matchs`,
        `diffusions`, `reservations`, `abonnements`.
  - [x] Énumérations : `role_adhesion`, `statut_diffusion`,
        `statut_reservation`.
  - [x] Policies RLS commentées en français pour chaque table.
- [x] Seed démo : organisation, établissement « Bar de démo »
      (`Europe/Paris`), un utilisateur staff de test.
- [x] Config Vite + React + TS strict + Tailwind.
- [x] `.env.example`, `README.md` racine avec procédure complète de
      démarrage.

**Vérification** : `npm install` + `npm run build` réussit. SQL appliqué.
Seed crée les fixtures attendues.

### Phase 2 — Dashboard staff

- [x] Auth Supabase (email + mot de passe).
- [x] Liste des établissements de l'utilisateur connecté.
- [x] Page établissement : liste des diffusions existantes et formulaire
      de création (choix d'un match, places disponibles).
- [x] Publication/annulation d'une diffusion. Toggle `est_publique`.
- [x] Affichage de TOUS les horaires de match convertis au fuseau de
      l'établissement courant via la fonction utilitaire commune.

**Vérification** : un utilisateur staff peut créer une diffusion publiée
visible côté public.

### Phase 3 — Page publique

- [x] Route `/etablissements/:slug` accessible sans auth.
- [x] Liste des diffusions publiées (`statut = 'publiee'` et
      `est_publique = true`).
- [x] Horaires affichés dans le fuseau de l'établissement.
- [x] Formulaire de réservation anonyme (nom, email, taille de groupe).
- [x] Insertion conforme à la RLS anonyme.

**Vérification** : un visiteur non authentifié crée une réservation,
elle apparaît dans le dashboard staff.

### Phase 4 — Temps réel

- [x] Abonnement Supabase Realtime sur la table `reservations` filtré
      par établissement.
- [x] Mise à jour live de la liste des réservations dans le dashboard.

**Vérification** : test manuel décrit dans le README (deux fenêtres).

### Phase 5 — Tests et durcissement

- [x] Test unitaire de la fonction de formatage fuseau (Paris vs NYC).
- [x] Revue manuelle des policies RLS documentée dans
      `docs/DECISIONS.md`.

## Hors périmètre (TODO commentés)

- Paiement / arrhes en ligne (Stripe).
- Module d'animation de salle.
- App mobile native.
- Live scores.
- Multi-rôles fin au-delà de `proprietaire` / `staff`.
- Internationalisation.
- Facturation Stripe.
