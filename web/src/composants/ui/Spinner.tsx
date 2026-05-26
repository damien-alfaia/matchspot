// Spinner inline, utilisé dans les boutons pendant les soumissions de
// formulaire ou les requêtes asynchrones.
//
// Couleur = `currentColor` → s'adapte automatiquement au texte du parent
// (texte blanc dans bouton primaire, texte marine dans bouton secondaire).

interface Props {
  className?: string;
  label?: string;
}

export function Spinner({ className = 'h-4 w-4', label }: Props) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {label && <title>{label}</title>}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
