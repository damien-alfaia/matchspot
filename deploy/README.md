# Déploiement MatchSpot

Architecture : front statique servi par Nginx sur VPS Hostinger,
backend Supabase Cloud (UE), emails via Resend.

## Stack

- **VPS Hostinger** — Ubuntu 22.04, Nginx 1.18+, certbot Let's Encrypt
- **Supabase Cloud** — région `eu-central-1` (Frankfurt), free tier
- **Resend** — emails transactionnels, domaine `matchspot.fr` vérifié
- **GitHub Actions** — CI/CD automatique sur push `main`

## Fichiers fournis

- `nginx/matchspot.fr.conf` — vhost Nginx à copier dans
  `/etc/nginx/sites-available/` puis symlink vers `sites-enabled/`.
- `../.github/workflows/deploy.yml` — workflow GitHub Actions :
  type-check, tests, build (avec sitemap), rsync vers VPS, smoke test.

## Secrets GitHub Actions à configurer

Dans le repo → Settings → Secrets and variables → Actions → New
repository secret. Ajouter :

| Nom | Valeur | Où la trouver |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` ou `sb_publishable_...` | Supabase → Project Settings → API (anon public) |
| `VPS_HOST` | IP publique du VPS Hostinger | hPanel Hostinger |
| `VPS_USER` | `deploy` | user créé manuellement sur le VPS |
| `VPS_SSH_PRIVATE_KEY` | Contenu de `~/.ssh/matchspot_deploy` | Clé privée ed25519 générée localement |

## Procédure de premier déploiement

1. Préparer le VPS (voir `nginx/matchspot.fr.conf` et le README racine).
2. Provisionner Supabase Cloud et lui pousser les migrations + seeds.
3. Configurer Resend (domaine vérifié, clé API).
4. Ajouter les 5 secrets GitHub Actions.
5. Push sur `main` ou déclencher manuellement le workflow via
   GitHub → Actions → Déploiement MatchSpot → Run workflow.

## Rollback

Si un déploiement casse la prod, deux options :

```bash
# Option 1 : revert le commit et push
git revert HEAD
git push

# Option 2 : redéployer un commit antérieur manuellement
# Actions → Déploiement MatchSpot → Run workflow → ref = <SHA-OK>
```

Le rsync étant non-atomique au niveau fichier, il y a une fenêtre
~1 seconde où des assets mixés peuvent arriver. Pour un MVP c'est
acceptable. Pour une vraie prod à fort trafic, on passera à un
déploiement blue/green avec deux dossiers et un symlink atomique.

## Monitoring minimal

```bash
# Sur le VPS :
sudo tail -f /var/log/nginx/matchspot.access.log
sudo tail -f /var/log/nginx/matchspot.error.log
```

Pour la prod, à ajouter plus tard : Plausible Analytics
(`plausible.io`, RGPD-friendly), Uptime Robot pour le ping HTTP,
Sentry pour les erreurs JS.
