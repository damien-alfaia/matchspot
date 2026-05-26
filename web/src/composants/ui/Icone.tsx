// Bibliothèque centralisée d'icônes SVG.
//
// Toutes les icônes décoratives ont `aria-hidden="true"` par défaut. Pour
// une icône porteuse de sens (utilisée seule comme libellé d'un bouton),
// passer `label` pour générer un `<title>` interne et `aria-label`.
//
// Convention : taille via `className` Tailwind (h-4 w-4 par défaut).

interface PropsIcone {
  className?: string;
  /**
   * Si fourni, l'icône devient sémantique : <title> + role="img" +
   * aria-label. Sinon, elle est aria-hidden (purement décorative).
   */
  label?: string;
}

function attributsCommuns({ className = 'h-4 w-4', label }: PropsIcone) {
  return label
    ? ({
        className,
        role: 'img' as const,
        'aria-label': label,
      } as const)
    : ({
        className,
        'aria-hidden': true as const,
      } as const);
}

export function IconePin(props: PropsIcone) {
  const a = attributsCommuns(props);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a}
    >
      {props.label && <title>{props.label}</title>}
      <path d="M12 22s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconeBallon(props: PropsIcone) {
  const a = attributsCommuns(props);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a}
    >
      {props.label && <title>{props.label}</title>}
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2" />
    </svg>
  );
}

export function IconeFlamme(props: PropsIcone) {
  const a = attributsCommuns(props);
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...a}>
      {props.label && <title>{props.label}</title>}
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14a8 8 0 0 0 16 0C20 9.79 17.99 6.03 13.5 0.67ZM11.71 19a3.32 3.32 0 0 1-3.31-3.27c0-1.55 1.01-2.65 2.7-2.98 1.7-.33 3.46-1.16 4.43-2.48.37 1.24.56 2.55.56 3.85a4.83 4.83 0 0 1-4.38 4.88Z" />
    </svg>
  );
}
