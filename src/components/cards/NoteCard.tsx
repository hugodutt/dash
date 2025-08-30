import { BaseCard } from './BaseCard';
import { Textarea } from '../ui/textarea';
import { LabelManager } from '../LabelManager';
import { NoteCard as NoteCardType } from '../../types/dashboard';

interface NoteCardProps {
  card: NoteCardType;
  onUpdate: (updates: Partial<NoteCardType>) => void;
  onDelete: () => void;
  onMouseDown: () => void;
  isFiltered?: boolean;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
}

export function NoteCard({ card, onUpdate, onDelete, onMouseDown, isFiltered, availableLabels, onCreateLabel }: NoteCardProps) {
  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown}
      isFiltered={isFiltered}
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* Labels */}
        <LabelManager
          labels={card.labels || []}
          availableLabels={availableLabels}
          onLabelsChange={(labels) => onUpdate({ labels })}
          onCreateLabel={onCreateLabel}
        />

        <Textarea
          value={card.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Escreva sua nota aqui..."
          className="min-h-32 text-sm resize-none border-none p-0 bg-transparent flex-1"
          style={{ boxShadow: 'none', minHeight: '120px' }}
        />
      </div>
    </BaseCard>
  );
}