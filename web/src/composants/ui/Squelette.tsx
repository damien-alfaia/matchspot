// Squelettes de chargement (placeholders animés). Remplace les écrans
// "Chargement…" pour réduire la perception d'attente côté utilisateur.
//
// Usage :
//   <SqueletteLigne />              // une barre grise animée
//   <SqueletteLigne width="w-1/2" />
//   <SqueletteCarte />              // une carte complète (titre + 2 lignes)
//   <SqueletteListe nombre={3} />   // plusieurs cartes empilées

interface PropsLigne {
  /** Classe Tailwind de largeur, ex "w-32", "w-1/2". Défaut : w-full. */
  width?: string;
  /** Classe Tailwind de hauteur, ex "h-4", "h-6". Défaut : h-4. */
  height?: string;
  className?: string;
}

export function SqueletteLigne({
  width = 'w-full',
  height = 'h-4',
  className = '',
}: PropsLigne) {
  return (
    <div
      className={`animate-pulse rounded bg-marine-100 ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SqueletteCarte() {
  return (
    <div className="carte" aria-hidden="true">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-2/3 rounded bg-marine-100" />
        <div className="h-4 w-1/3 rounded bg-marine-100" />
        <div className="h-4 w-full rounded bg-marine-100" />
      </div>
    </div>
  );
}

interface PropsListe {
  nombre?: number;
  /** Texte annoncé aux lecteurs d'écran pendant le chargement. */
  labelChargement?: string;
}

export function SqueletteListe({
  nombre = 3,
  labelChargement = 'Chargement en cours…',
}: PropsListe) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{labelChargement}</span>
      {Array.from({ length: nombre }).map((_, i) => (
        <SqueletteCarte key={i} />
      ))}
    </div>
  );
}
