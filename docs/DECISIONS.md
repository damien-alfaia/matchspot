# Journal des décisions

Décisions prises sans spécification explicite, avec leur justification.
Chaque décision favorise la simplicité et le standard du marché.

## D-001 — Pas de Supabase CLI obligatoire pour appliquer le SQL

**Décision.** Les migrations et le seed sont des fichiers SQL plats,
appliqués au choix via `supabase db push`, l'éditeur SQL du dashboard
Supabase, ou `psql` direct. Aucune dépendance forte à la CLI.

**Pourquoi.** Le cahier des charges interdit toute Edge Function ou
service hors front + Postgres. On reste sur du SQL nu, exécutable
partout.

## D-002 — Auth par email + mot de passe uniquement

**Décision.** L'auth Supabase est utilisée en mode `email + password`.
Pas de magic link, pas d'OAuth dans le MVP.

**Pourquoi.** Le périmètre n'évoque pas l'auth fédérée. Email/mot de
passe se branche sans configuration externe et couvre le cas staff de
bar (compte créé par le propriétaire).

## D-003 — Pas d'ORM, requêtes via `supabase-js`

**Décision.** Les accès aux données passent par `@supabase/supabase-js`.
Pas de Prisma, pas de Drizzle. Les types TypeScript des tables sont
définis à la main dans `web/src/types/base.ts` (et peuvent être
régénérés par la CLI Supabase ultérieurement).

**Pourquoi.** Cohérent avec « pas d'ORM lourd ». Les requêtes restent
simples et un appel d'API correspond à une intention métier.

## D-004 — Slug public séparé du slug d'organisation

**Décision.** Le slug exposé publiquement vit sur l'établissement
(`etablissements.slug_public`). L'organisation a son propre `slug` (non
exposé publiquement pour l'instant), réservé à un usage interne ou
futur.

**Pourquoi.** Un même groupe peut avoir plusieurs bars : c'est l'URL
publique d'un bar précis qui doit être courte et stable, indépendamment
du nom de la holding.

## D-005 — Fuseau IANA stocké sur l'établissement

**Décision.** Chaque établissement porte `fuseau_horaire` (chaîne IANA,
ex `Europe/Paris`). La conversion d'affichage utilise `Intl.DateTimeFormat`
côté front.

**Pourquoi.** Un seul fuseau par établissement, pas d'ambiguïté. `Intl`
est nativement disponible dans tous les navigateurs cibles, pas de
dépendance type `date-fns-tz` (mais on peut l'ajouter sans douleur si on
veut un formatage avancé).

## D-006 — Abonnements : table de structure seulement

**Décision.** La table `abonnements` est créée avec sa forme finale
(formule, statut, fin de période), mais aucune intégration Stripe ni
webhook ne sont posés. Tous les tenants ont accès complet pendant le
MVP.

**Pourquoi.** Le périmètre explicite l'exclusion du paiement. La table
existe pour ne pas avoir à migrer plus tard quand on branchera Stripe.

## D-007 — Tirage au sort de la phase de groupes effectué

**Décision.** Le tirage au sort officiel de la CdM 2026 a eu lieu le
5 décembre 2025 à Washington. Les 48 équipes des 12 groupes A à L sont
connues. Sources et détails dans `docs/CALENDRIER.md`.

**Pourquoi.** Permet de remplir `equipe_domicile`/`equipe_exterieur`
réellement pour les 72 matchs de groupes. Pour la phase à élimination
directe, les équipes restent des placeholders calculés (« 1er Groupe A »,
« 2e Groupe B », etc.) car le résultat des groupes n'est pas connu.

## D-008 — Format des placeholders pour la phase à élimination directe

**Décision.** Convention adoptée :

- 16es de finale : `1er Groupe X`, `2e Groupe X`, `3e Groupe X/Y/Z…`
- 8es de finale : `Vainqueur 16e #N` (N = numéro du match de 16e source).
- Quarts : `Vainqueur 8e #N`.
- Demis : `Vainqueur Quart #N`.
- Finale 3e place : `Perdant Demi #N`.
- Finale : `Vainqueur Demi #N`.

**Pourquoi.** Format non ambigu, lisible côté UI, sans dépendre des
sigles FIFA.

## D-010 — Notifications email best-effort via Edge Function

**Décision.** L'envoi des emails (confirmation client + alerte bar) est
déclenché par le front juste après l'INSERT dans `reservations`, via
`supabase.functions.invoke('notifier_reservation', { body: { reservation_id } })`.
Pas de trigger Postgres + `pg_net`.

**Pourquoi.** Plus simple à auditer, moins de surface d'attaque, et le
Realtime du dashboard reste la source de vérité pour le bar. Si Resend
est indisponible, la résa est sauvegardée et visible en live ; l'email
est un confort, pas un canal critique.

**Implications.** L'Edge Function tourne avec la `service_role` pour
lire la résa et l'email du propriétaire. Elle reçoit uniquement un UUID
v4 non énumérable. Tout payload supplémentaire venant du client est
ignoré.

## D-011 — Page admin résultats protégée par adhésion `proprietaire`

**Décision.** La route `/admin/resultats` est accessible à tout
utilisateur ayant **au moins une adhésion `proprietaire`** dans
n'importe quelle organisation. Pas de rôle « admin plateforme »
distinct dans ce MVP.

**Pourquoi.** Suffisant à 3 semaines de la CdM : on peut donner accès à
l'équipe MatchSpot en créant une organisation interne sans s'embêter
avec un rôle dédié. À durcir en vague 3 si on ouvre la plateforme à
beaucoup d'organisations.

**Implications.** Théoriquement un propriétaire d'un vrai bar pourrait
modifier les résultats. Mitigation : la page n'est pas linkée depuis
l'UI grand public, et un audit log (à ajouter) permettra de tracer.

## D-012 — SEO via composant léger sans react-helmet

**Décision.** `EnTeteSEO` injecte `<title>`, `<meta description>` et
les balises OpenGraph/Twitter directement dans `document.head` via
`useEffect`. Pas de `react-helmet-async`.

**Pourquoi.** Zéro dépendance ajoutée, 30 lignes, suffisant pour les
crawlers modernes (Googlebot, Bingbot, Slackbot, Twitterbot) qui
exécutent JS depuis 2019+. À reconsidérer si on a un volume social
organique important : passer à SSR/SSG.

## D-013 — Onboarding pro via RPC `SECURITY DEFINER`

**Décision.** La création d'une organisation + adhésion propriétaire +
abonnement gratuit + premier établissement se fait via la RPC
`creer_organisation_bar_initial`. Pas d'INSERT direct sur
`organisations` (la table n'a aucune policy INSERT).

**Pourquoi.** Transactionnel (tout réussit ou tout échoue), atomique,
et seul point d'entrée pour la création d'org → sécurité simple à
auditer.

## D-014 — Géocodage Nominatim sans clé

**Décision.** L'adresse → lat/lng utilise l'API publique Nominatim
(OpenStreetMap), gratuite, sans clé. Attribution affichée sous le
champ « Adresse » dans le formulaire.

**Pourquoi.** Aucun secret à gérer, suffisant pour un MVP. Le 1 req/s
imposé par Nominatim est respecté par le debounce et le cache local.
Si on dépasse, basculer sur Mapbox géocodeur (100k/mois gratuit).

## D-009 — Revue manuelle des policies RLS (phase 5)

**Décision.** Une revue ligne à ligne des policies a été menée. Les
points vérifiés :

- `matchs` : `SELECT` ouvert à tous, aucune `INSERT/UPDATE/DELETE`.
- `reservations` : `INSERT` autorisé pour `anon` UNIQUEMENT sur
  diffusion publiée + publique ; `SELECT` réservé aux membres de
  l'organisation propriétaire de l'établissement.
- Toutes les autres tables : `USING` et `WITH CHECK` joignent via
  `adhesions` à l'utilisateur courant.

Aucune fuite identifiée. Tests manuels recommandés dans `README.md`.

**Pourquoi.** Les policies sont la dernière ligne de défense ; mieux
vaut un audit dédié qu'une confiance aveugle dans le client.
