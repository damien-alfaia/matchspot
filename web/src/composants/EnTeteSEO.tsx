import { useEffect } from 'react';

interface Props {
  titre: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article' | 'place';
}

// Composant léger qui injecte title + meta côté CSR. Pas de dépendance à
// react-helmet-async pour rester sans dette. Les bots Google modernes
// exécutent JS et lisent le DOM final.
//
// Suffisant pour OpenGraph, Twitter Card et SEO long-tail. Pour un SEO
// agressif (parts importantes en social organique), passer à une vraie
// solution SSR/SSG plus tard.
export function EnTeteSEO({
  titre,
  description,
  ogImage,
  ogUrl,
  type = 'website',
}: Props) {
  useEffect(() => {
    document.title = titre;
    upsertMeta('description', description, false);
    upsertMeta('og:title', titre, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:type', type, true);
    if (ogImage) upsertMeta('og:image', ogImage, true);
    if (ogUrl) upsertMeta('og:url', ogUrl, true);
    upsertMeta('twitter:card', 'summary_large_image', false);
    upsertMeta('twitter:title', titre, false);
    upsertMeta('twitter:description', description, false);
    if (ogImage) upsertMeta('twitter:image', ogImage, false);
  }, [titre, description, ogImage, ogUrl, type]);

  return null;
}

function upsertMeta(nom: string, contenu: string, openGraph: boolean) {
  const attr = openGraph ? 'property' : 'name';
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${nom}"]`,
  );
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, nom);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', contenu);
}
