# Déploiement MatchSpot

Architecture : front statique servi par un container `nginx:alpine` derrière le
Traefik existant du VPS Hostinger, backend Supabase Cloud, emails Resend.

## Stack en production

- **VPS Hostinger** — Ubuntu 24.04, Docker 29.x, Docker Compose v2
- **Traefik** (container existant) — reverse proxy, HTTPS auto via Let's Encrypt,
  redirection HTTP → HTTPS, `--providers.docker=true`
- **Container `matchspot-web`** (`nginx:alpine`) — sert `/var/www/matchspot/dist`
  en lecture seule, exposé sur `127.0.0.1:8090`, routé par Traefik
- **Supabase Cloud** — région `eu-central-1` (Frankfurt), free tier
- **Resend** — emails transactionnels (domaine `matchspot.fr` à vérifier)
- **GitHub Actions** — CI/CD automatique sur push `main`

## Fichiers fournis dans ce repo

```
deploy/
├── README.md                ← ce fichier
├── docker/
│   ├── docker-compose.yml   ← pose le container matchspot-web avec labels Traefik
│   └── nginx.conf           ← conf SPA, gzip, cache, headers de sécurité
└── nginx/
    └── matchspot.fr.conf    ← obsolète (vhost Nginx natif, non utilisé)

.github/workflows/
└── deploy.yml               ← workflow CI/CD
```

## Provisionnement initial du VPS (déjà fait)

1. User `deploy` créé avec accès SSH par clé.
2. `/var/www/matchspot/dist/` créé (owner `deploy:www-data`, perms 755).
3. `/etc/matchspot/docker-compose.yml` et `/etc/matchspot/nginx.conf` posés.
4. Container démarré : `docker compose -f /etc/matchspot/docker-compose.yml up -d`.
5. Traefik a généré le certificat Let's Encrypt automatiquement.
6. Clé SSH ed25519 dédiée GitHub Actions générée, publique installée dans
   `/home/deploy/.ssh/authorized_keys`.

Pour redéployer le container (si on change `docker-compose.yml` ou `nginx.conf`) :

```bash
ssh root@<VPS_HOST>
cd /etc/matchspot
docker compose up -d --force-recreate
```

Pas besoin de toucher au container pour un déploiement de code — le volume monté
sert le contenu en direct.

## Secrets GitHub Actions à configurer

Dans le repo → Settings → Secrets and variables → Actions → New repository secret :

| Nom | Valeur | Où la trouver |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Project Settings → API (anon public) |
| `VPS_HOST` | `187.124.42.207` | IP du VPS Hostinger |
| `VPS_USER` | `deploy` | user créé sur le VPS pour le déploiement |
| `VPS_SSH_PRIVATE_KEY` | Contenu complet de la clé ed25519 dédiée | Voir section ci-dessous |

## Workflow

À chaque push sur `main` (ou exécution manuelle via Actions → Run workflow) :

1. Checkout du code.
2. Install Node 20 + dépendances.
3. Type-check (`tsc --noEmit`).
4. Tests Vitest.
5. Build production (`vite build`) — déclenche aussi `prebuild` qui génère le
   sitemap depuis Supabase Cloud.
6. Configure la clé SSH temporaire.
7. `rsync` de `web/dist/` vers `/var/www/matchspot/dist/` sur le VPS.
8. Smoke test : `curl https://matchspot.fr` doit retourner 200.
9. Nettoyage de la clé SSH.

Durée typique : 3 à 4 minutes.

## Rollback

```bash
# Option 1 : revert le commit et push
git revert HEAD
git push

# Option 2 : redéployer un commit antérieur via UI GitHub
# Actions → Déploiement MatchSpot → Run workflow → ref = <SHA-OK>
```

Le rsync étant non-atomique, il y a une fenêtre de ~1 s où des assets mixés
peuvent arriver. Acceptable pour un MVP. Si on a besoin d'atomicité, on
basculera sur un déploiement blue/green (deux dossiers + symlink).

## Monitoring minimal

```bash
# Sur le VPS :
docker logs matchspot-web --tail 50
docker logs traefik-traefik-1 --tail 50

# Healthcheck local (sans passer par Traefik) :
curl http://127.0.0.1:8090/health    # doit retourner "ok"

# Healthcheck public :
curl -I https://matchspot.fr         # doit retourner 200
```

Pour la prod long terme, à ajouter : Plausible Analytics (RGPD-friendly),
Uptime Robot pour le ping HTTP, Sentry pour les erreurs JS côté front.

## Anti-bug retour d'expérience

- **Permissions** : `/var/www/matchspot/` doit avoir `chmod a+rX` (lecture +
  traverse pour tous). Le user `nginx` dans le container alpine est UID 101 et
  n'est ni `deploy` ni dans `www-data`. Les fichiers servis doivent être 644 et
  les dossiers 755.
- **Premier déploiement** : Traefik met ~30 secondes à émettre le certificat
  Let's Encrypt. Le premier `curl https://matchspot.fr` peut renvoyer une erreur
  SSL temporaire — c'est normal, attendre.
- **DNS** : `matchspot.fr` (apex) et `www.matchspot.fr` doivent pointer vers
  l'IP du VPS Hostinger. Si parking par défaut, supprimer puis ajouter les
  bonnes entrées `A` (et `CNAME` pour www).
