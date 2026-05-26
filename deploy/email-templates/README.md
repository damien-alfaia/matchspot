# Templates d'emails Supabase Auth

Templates HTML à coller dans le dashboard Supabase :
**Authentication → Email Templates** → onglet par template.

Variables Supabase disponibles :
- `{{ .ConfirmationURL }}` — URL complète de l'action (confirmation, reset, etc.)
- `{{ .Token }}` — token brut (si on veut afficher un code à 6 chiffres)
- `{{ .TokenHash }}` — hash du token
- `{{ .Email }}` — email destinataire
- `{{ .SiteURL }}` — URL du site (https://matchspot.fr)
- `{{ .RedirectTo }}` — URL de redirection après l'action

## Templates fournis

| Fichier | Template Supabase | Subject suggéré |
|---|---|---|
| `confirm-signup.html` | Confirm signup | `Confirmez votre inscription à MatchSpot` |
| `reset-password.html` | Reset password | `Réinitialisez votre mot de passe MatchSpot` |
| `change-email.html` | Change Email Address | `Confirmez votre nouvelle adresse email` |

## Notes

- Aucune image embarquée : on ne charge que `https://matchspot.fr/logo.png` depuis le domaine, ce qui évite que Gmail/Outlook bloquent l'affichage.
- CSS 100 % inline, compatible Gmail, Outlook, Apple Mail, ProtonMail.
- Lien CTA + lien texte de fallback pour les clients qui n'affichent pas les boutons stylés.
- Footer avec mention « Si vous n'êtes pas à l'origine de cette demande… » pour éviter les emails non sollicités perçus comme du phishing.

## Modifier un template

1. Édite le fichier .html en local.
2. Copie le contenu HTML complet.
3. Va sur https://supabase.com/dashboard/project/kudzkytwclghayezyfrt/auth/templates
4. Sélectionne le template concerné.
5. Colle le HTML dans le champ « Message Body » + le sujet dans « Message Subject ».
6. Save.

Les changements s'appliquent **instantanément** au prochain email envoyé.
