// Badge visuel signalant un « match phare » (phase finale ou match des
// Bleus). Petit pill orange avec une icône flamme.
//
// Couleur amber (chaude, distincte de la palette marine/bleu) pour
// attirer l'œil sans saturer. WCAG AA OK : amber-700 sur amber-50.

import { IconeFlamme } from './Icone';
import type { MatchCdm } from '../../types/base';
import { estMatchPhare, raisonMatchPhare } from '../../utils/matchPhare';

interface Props {
  match: Pick<MatchCdm, 'phase' | 'equipe_domicile' | 'equipe_exterieur'>;
  /** Style compact pour les listes denses (juste l'icône + 1 mot). */
  compact?: boolean;
  className?: string;
}

export function BadgeMatchPhare({ match, compact = false, className = '' }: Props) {
  if (!estMatchPhare(match)) return null;
  const raison = raisonMatchPhare(match);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ${className}`}
      title={raison}
      aria-label={raison}
    >
      <IconeFlamme className="h-3 w-3" />
      {compact ? 'Phare' : 'Match phare'}
    </span>
  );
}
