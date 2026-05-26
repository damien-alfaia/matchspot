// Drapeau de l'équipe, chargé en SVG depuis flagcdn.com.
//
// Décoratif par design : le nom de l'équipe est toujours rendu en texte
// à côté → `alt=""` et `aria-hidden="true"` pour éviter la duplication
// aux lecteurs d'écran.
//
// Retourne `null` pour les placeholders dynamiques (ex : "Vainqueur
// Demi #101", "1er Groupe A") tant que le vrai nom n'est pas connu.
// Le drapeau apparaîtra automatiquement après que `propager_qualifies`
// (migration 0008) ait remplacé le placeholder.

import { codePaysDepuisEquipe } from '../../utils/drapeauPays';

type Taille = 'sm' | 'md' | 'lg';

interface Props {
  nom: string;
  /** sm = h-3, md = h-5, lg = h-8 (largeur auto pour conserver le ratio). */
  taille?: Taille;
  className?: string;
}

const CLASSES_TAILLE: Record<Taille, string> = {
  sm: 'h-3 w-auto',
  md: 'h-5 w-auto',
  lg: 'h-8 w-auto',
};

export function DrapeauEquipe({ nom, taille = 'sm', className = '' }: Props) {
  const code = codePaysDepuisEquipe(nom);
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`inline-block shrink-0 rounded-sm shadow-sm ${CLASSES_TAILLE[taille]} ${className}`}
    />
  );
}
