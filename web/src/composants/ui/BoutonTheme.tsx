// Bouton qui bascule entre thème clair et sombre.
// Sort du mode 'systeme' au premier clic (préférence utilisateur
// explicite). L'icône reflète le thème EFFECTIF actuel.

import { useTheme } from '../../contexte/ThemeContexte';
import { IconeLune, IconeSoleil } from './Icone';

interface Props {
  /** Classes optionnelles pour ajuster la couleur d'icône au contexte. */
  className?: string;
}

export function BoutonTheme({ className = '' }: Props) {
  const { themeEffectif, basculer } = useTheme();
  const estSombre = themeEffectif === 'sombre';
  const libelle = estSombre ? 'Passer en thème clair' : 'Passer en thème sombre';
  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={libelle}
      title={libelle}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-marine-100/40 focus:outline-none focus:ring-2 focus:ring-bleu-500 focus:ring-offset-1 dark:hover:bg-marine-800/40 ${className}`}
    >
      {estSombre ? (
        <IconeSoleil className="h-5 w-5" />
      ) : (
        <IconeLune className="h-5 w-5" />
      )}
    </button>
  );
}
