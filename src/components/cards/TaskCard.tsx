import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { LabelManager } from '../LabelManager';
import { TaskCard as TaskCardType } from '../../types/dashboard';

interface TaskCardProps {
  card: TaskCardType;
  onUpdate: (updates: Partial<TaskCardType>) => void;
  onDelete: () => void;
  onMouseDown: () => void;
  isFiltered?: boolean;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
}

export function TaskCard({ card, onUpdate, onDelete, onMouseDown, isFiltered, availableLabels, onCreateLabel }: TaskCardProps) {
  const [timeStatus, setTimeStatus] = useState<{
    text: string;
    color: string;
    isOverdue: boolean;
  }>({ text: '', color: '', isOverdue: false });

  useEffect(() => {
    const updateTimeStatus = () => {
      if (!card.startDate && !card.endDate) {
        setTimeStatus({ text: '', color: '', isOverdue: false });
        return;
      }

      const now = new Date();
      const start = card.startDate ? new Date(card.startDate) : null;
      const end = card.endDate ? new Date(card.endDate) : null;

      if (end && now > end && !card.done) {
        // Overdue
        const diff = now.getTime() - end.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const timeText = days > 0 
          ? `Atrasado há ${days}d ${hours}h`
          : `Atrasado há ${hours}h`;
        
        setTimeStatus({ text: timeText, color: '#EF4444', isOverdue: true });
      } else if (end && now < end) {
        // Future
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const timeText = days > 0 
          ? `Faltam ${days}d ${hours}h`
          : `Faltam ${hours}h`;
        
        setTimeStatus({ text: timeText, color: '#10B981', isOverdue: false });
      } else {
        setTimeStatus({ text: '', color: '', isOverdue: false });
      }
    };

    updateTimeStatus();
    const interval = setInterval(updateTimeStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [card.startDate, card.endDate, card.done]);

  const formatDateTimeLocal = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (field: 'startDate' | 'endDate', value: string) => {
    onUpdate({ [field]: value ? new Date(value).toISOString() : undefined });
  };

  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown}
      isFiltered={isFiltered}
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* Done checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={card.done}
            onCheckedChange={(checked) => onUpdate({ done: !!checked })}
          />
          <span className={`text-sm ${card.done ? 'line-through' : ''}`} style={{ color: card.done ? '#4A5477' : 'inherit' }}>
            {card.done ? 'Concluída' : 'Pendente'}
          </span>
          {card.done && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>

        {/* Labels */}
        <LabelManager
          labels={card.labels || []}
          availableLabels={availableLabels}
          onLabelsChange={(labels) => onUpdate({ labels })}
          onCreateLabel={onCreateLabel}
        />

        {/* Time status badge */}
        {timeStatus.text && (
          <Badge
            className="text-white text-xs gap-1"
            style={{ backgroundColor: timeStatus.color }}
          >
            <Clock className="h-3 w-3" />
            {timeStatus.text}
          </Badge>
        )}

        {/* Description */}
        <Textarea
          value={card.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Descrição da tarefa..."
          className="min-h-16 text-sm resize-none flex-1"
          style={{ minHeight: '100px' }}
        />

        {/* Date inputs */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <label className="text-xs font-medium text-gray-600">Início:</label>
            <Input
              type="datetime-local"
              value={formatDateTimeLocal(card.startDate)}
              onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
              className="text-xs h-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: '#4A5477' }} />
            <label className="text-xs font-medium" style={{ color: '#4A5477' }}>Fim:</label>
            <Input
              type="datetime-local"
              value={formatDateTimeLocal(card.endDate)}
              onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>
      </div>
    </BaseCard>
  );
}