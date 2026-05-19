# Calendrier de la Coupe du Monde 2026 — méthode et sources

Ce document explique comment le seed `supabase/seed/01_matchs.sql` a été
construit : sources, méthode de conversion en UTC, hypothèses, et points
incertains.

## Tournoi en bref

- Période : 11 juin 2026 → 19 juillet 2026 (39 jours).
- 48 équipes, 12 groupes de 4 (A à L).
- Format : 72 matchs de groupes + 32 de phase éliminatoire = 104.
- Phase éliminatoire : 16es (R32, 16 matchs) → 8es → quarts → demis →
  match pour la 3ᵉ place → finale.
- 16 villes hôtes : 11 USA, 3 Mexique, 2 Canada.
- Match d'ouverture : Mexique vs Afrique du Sud, 11 juin, Estadio Azteca,
  13h00 locale (heure de Mexico).
- Finale : 19 juillet, MetLife Stadium (New York/New Jersey), 15h00 ET.

## Tirage au sort

Le tirage final s'est tenu **le 5 décembre 2025 à Washington DC**. Les
positions A1, B1 et D1 ont été automatiquement attribuées au Mexique, au
Canada et aux États-Unis respectivement.

Composition des 12 groupes utilisée dans le seed :

| Groupe | Équipes |
|--------|---------|
| A | Mexique, Afrique du Sud, Corée du Sud, Tchéquie |
| B | Canada, Bosnie-Herzégovine, Qatar, Suisse |
| C | Brésil, Maroc, Haïti, Écosse |
| D | États-Unis, Paraguay, Australie, Turquie |
| E | Allemagne, Curaçao, Côte d'Ivoire, Équateur |
| F | Pays-Bas, Japon, Suède, Tunisie |
| G | Belgique, Égypte, Iran, Nouvelle-Zélande |
| H | Espagne, Cap-Vert, Arabie saoudite, Uruguay |
| I | France, Sénégal, Irak, Norvège |
| J | Argentine, Algérie, Autriche, Jordanie |
| K | Portugal, RD Congo, Ouzbékistan, Colombie |
| L | Angleterre, Croatie, Ghana, Panama |

## Placeholders de la phase à élimination directe

Les équipes des matchs à élimination directe ne sont pas connues. Le
seed insère des libellés explicites, conformes à la convention décrite
dans `docs/DECISIONS.md` (D-008) :

- 16es : `1er Groupe X`, `2e Groupe X`. Pour les 8 meilleurs 3ᵉs, la
  grille FIFA officielle (publiée en février 2024) prévoit une
  combinaison de 5 groupes possibles pour chaque slot. On utilise donc
  `Meilleur 3e Groupes X/Y/Z/W/V` plutôt qu'un groupe unique inventé.
- 8es : `Vainqueur 16e #N`.
- Quarts : `Vainqueur 8e #N`.
- Demis : `Vainqueur Quart #N`.
- Match pour la 3ᵉ place : `Perdant Demi #N`.
- Finale : `Vainqueur Demi #N`.

## Villes hôtes et fuseaux IANA

| Ville hôte (FIFA) | Stade | Fuseau IANA |
|---|---|---|
| Mexico | Estadio Azteca | `America/Mexico_City` |
| Zapopan (Guadalajara) | Estadio Akron | `America/Mexico_City` |
| Monterrey | Estadio BBVA | `America/Monterrey` |
| Toronto | BMO Field | `America/Toronto` |
| Vancouver | BC Place | `America/Vancouver` |
| Boston | Gillette Stadium | `America/New_York` |
| New York/New Jersey | MetLife Stadium | `America/New_York` |
| Philadelphie | Lincoln Financial Field | `America/New_York` |
| Miami | Hard Rock Stadium | `America/New_York` |
| Atlanta | Mercedes-Benz Stadium | `America/New_York` |
| Los Angeles | SoFi Stadium | `America/Los_Angeles` |
| San Francisco Bay Area | Levi's Stadium | `America/Los_Angeles` |
| Seattle | Lumen Field | `America/Los_Angeles` |
| Houston | NRG Stadium | `America/Chicago` |
| Dallas | AT&T Stadium | `America/Chicago` |
| Kansas City | Arrowhead Stadium | `America/Chicago` |

Notes pratiques :

- Mexico City et Monterrey (`America/Mexico_City`, `America/Monterrey`)
  n'observent plus l'heure d'été depuis 2022 : UTC−6 toute l'année.
- Tous les autres fuseaux nord-américains observent l'heure d'été
  en juin-juillet 2026 : EDT = UTC−4, CDT = UTC−5, PDT = UTC−7.

## Méthode de conversion en UTC

Le seed insère les coups d'envoi avec la syntaxe Postgres :

```sql
'2026-06-11 13:00:00'::timestamp AT TIME ZONE 'America/Mexico_City'
```

Postgres applique sa base IANA, gère heure d'été et abolitions
nationales. Aucune conversion manuelle dans le SQL.

Exemple :

- Match d'ouverture : 11 juin 2026, 13:00 heure de Mexico (UTC−6) =
  `2026-06-11 19:00:00 UTC`.
- Affichage à Paris (CEST = UTC+2 en juin) : 21:00 le 11 juin.
- Finale : 19 juillet, 15:00 heure de New York (EDT = UTC−4) =
  `2026-07-19 19:00:00 UTC`. À Paris : 21:00 le 19 juillet.

## Sources web

Toutes consultées le **2026-05-19**.

- [Wikipédia anglais — 2026 FIFA World Cup](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup)
- [Wikipédia anglais — phase à élimination directe](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
- [Wikipédia français — Coupe du monde de football 2026](https://fr.wikipedia.org/wiki/Coupe_du_monde_de_football_2026)
- [FIFA — Scores & Fixtures officiels](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures)
- [FIFA — Communiqué du tirage final](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results)
- [Sky Sports — calendrier complet 104 matchs](https://www.skysports.com/football/news/11095/13481245/world-cup-2026-fixture-schedule-and-uk-kick-off-times-day-by-day-breakdown-of-all-104-matches-including-england-scotland)
- [NBC Sports — bracket et matches](https://www.nbcsports.com/soccer/news/2026-world-cup-schedule-confirmed-dates-times-stadiums-full-details)
- [Al Jazeera — résultats du tirage](https://www.aljazeera.com/sports/2025/12/5/fifa-world-cup-2026-draw-groups-teams-format-trump-peace-prize)

## Points incertains signalés

1. **Convention de ville hôte** : on suit la dénomination FIFA. Quelques
   choix qui peuvent surprendre :
   - Gillette Stadium (Foxborough) → « Boston ».
   - AT&T Stadium (Arlington) → « Dallas ».
   - SoFi Stadium (Inglewood) → « Los Angeles ».
   - Hard Rock Stadium (Miami Gardens) → « Miami ».
   - Levi's Stadium (Santa Clara) → « San Francisco Bay Area ».
   - Estadio BBVA (Guadalupe NL) → « Monterrey ».
   - Estadio Akron : on a retenu « Zapopan » (commune réelle du stade)
     dans le seed ; on peut basculer vers « Guadalajara » (convention
     FIFA) si on préfère.

2. **Heures fines de quelques matchs** dépendantes de la dernière
   itération du calendrier FIFA (publié 6 décembre 2025, lendemain du
   tirage). Les valeurs retenues sont celles citées par Wikipédia au
   2026-05-19, considérées comme stables.

3. **Meilleur 3e par 16e** : la grille FIFA combine 5 groupes possibles
   par slot. Plutôt que d'inventer une lecture unique, on garde la
   chaîne `Meilleur 3e Groupes X/Y/Z/W/V`. Le client web peut afficher
   « TBD » jusqu'à ce que l'opérateur saisisse l'équipe réelle.

4. **Cas non implémenté** : il n'est pas prévu dans ce MVP de mettre à
   jour les équipes des phases à élimination directe pendant le
   tournoi. C'est à faire dans une itération ultérieure (UPDATE
   simples sur `matchs.equipe_domicile`/`equipe_exterieur`).
