// Génère web/public/sitemap.xml à partir des matchs et bars en base.
//
// Usage :
//   SITE_URL=https://matchspot.fr \
//   VITE_SUPABASE_URL=https://xxx.supabase.co \
//   VITE_SUPABASE_ANON_KEY=ey... \
//   npx tsx scripts/generer-sitemap.ts
//
// Ou via le script npm :
//   npm run sitemap
//
// Le script est tolérant aux variables manquantes : si VITE_SUPABASE_URL
// n'est pas défini, il génère un sitemap minimal avec uniquement les
// pages statiques + les 104 numéros de match en URLs canoniques courtes
// (ex /matchs/17). La redirection canonique côté front rattrapera vers
// le slug complet.

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = (process.env.SITE_URL ?? 'https://matchspot.fr').replace(/\/$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

interface MatchSitemap {
  numero_match: number;
  equipe_domicile: string;
  equipe_exterieur: string;
}

interface BarSitemap {
  slug_public: string;
}

function slugifier(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugMatch(m: MatchSitemap): string {
  return `${m.numero_match}-${slugifier(`${m.equipe_domicile}-${m.equipe_exterieur}`)}`;
}

function urlNode(loc: string, priority: number, changefreq: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;
}

async function recupererDonnees(): Promise<{
  matchs: MatchSitemap[];
  bars: BarSitemap[];
}> {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.warn(
      'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY non définis — sitemap dégradé (URLs courtes des matchs uniquement, sans noms d\'équipes ni bars).',
    );
    // Fallback : 104 matchs sans équipes connues.
    const matchsFallback: MatchSitemap[] = Array.from({ length: 104 }, (_, i) => ({
      numero_match: i + 1,
      equipe_domicile: '',
      equipe_exterieur: '',
    }));
    return { matchs: matchsFallback, bars: [] };
  }

  const supa = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false },
  });

  const [matchsRes, barsRes] = await Promise.all([
    supa
      .from('matchs')
      .select('numero_match, equipe_domicile, equipe_exterieur')
      .order('numero_match'),
    supa.from('etablissements').select('slug_public'),
  ]);

  if (matchsRes.error) {
    throw new Error(`Erreur lecture matchs : ${matchsRes.error.message}`);
  }
  if (barsRes.error) {
    console.warn(
      `Erreur lecture etablissements (probablement RLS) : ${barsRes.error.message}. ` +
        'Sitemap généré sans la section bars.',
    );
  }

  return {
    matchs: (matchsRes.data ?? []) as MatchSitemap[],
    bars: ((barsRes.data ?? []) as BarSitemap[]) || [],
  };
}

function genererSitemap(matchs: MatchSitemap[], bars: BarSitemap[]): string {
  const aujourdhui = new Date().toISOString().split('T')[0];

  const pagesStatiques = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/a-propos', priority: 0.5, changefreq: 'monthly' },
    { loc: '/comment-ca-marche-bar', priority: 0.7, changefreq: 'monthly' },
    { loc: '/mentions-legales', priority: 0.3, changefreq: 'yearly' },
    { loc: '/confidentialite', priority: 0.3, changefreq: 'yearly' },
    { loc: '/inscription-pro', priority: 0.6, changefreq: 'monthly' },
  ];

  const urls: string[] = [];

  for (const p of pagesStatiques) {
    urls.push(urlNode(`${SITE_URL}${p.loc}`, p.priority, p.changefreq));
  }

  for (const m of matchs) {
    const slug = m.equipe_domicile && m.equipe_exterieur
      ? slugMatch(m)
      : `${m.numero_match}`;
    urls.push(urlNode(`${SITE_URL}/matchs/${slug}`, 0.8, 'weekly'));
  }

  for (const b of bars) {
    if (!b.slug_public) continue;
    urls.push(urlNode(`${SITE_URL}/etablissements/${b.slug_public}`, 0.7, 'weekly'));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Généré le ${aujourdhui} par scripts/generer-sitemap.ts -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

async function main(): Promise<void> {
  console.log(`Génération du sitemap pour ${SITE_URL}...`);
  const { matchs, bars } = await recupererDonnees();
  const xml = genererSitemap(matchs, bars);
  const chemin = resolve(process.cwd(), 'public/sitemap.xml');
  writeFileSync(chemin, xml, 'utf-8');
  console.log(
    `Sitemap écrit : ${chemin}\n` +
      `  - ${matchs.length} matchs\n` +
      `  - ${bars.length} bars\n` +
      `  - 6 pages statiques\n` +
      `  - Total URLs : ${matchs.length + bars.length + 6}`,
  );
}

main().catch((err) => {
  console.error('Échec génération sitemap :', err);
  process.exit(1);
});
