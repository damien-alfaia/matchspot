import { useState } from 'react';

interface Props {
  url: string;
  titre: string;
  texte?: string;
  className?: string;
}

export function BoutonPartager({ url, titre, texte, className }: Props) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    // Sur mobile (iOS, Android), API Web Share native.
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ url, title: titre, text: texte });
        return;
      } catch {
        // L'utilisateur a annulé : on retombe sur le copier.
      }
    }
    // Desktop / fallback : copie dans le presse-papier.
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Dernier recours : prompt.
      window.prompt('Copiez ce lien :', url);
    }
  }

  return (
    <button
      type="button"
      onClick={partager}
      className={className ?? 'bouton-secondaire'}
      aria-label="Partager"
    >
      {copie ? '✓ Lien copié' : '🔗 Partager'}
    </button>
  );
}
