import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { LabelManager } from '../LabelManager';
import { ChecklistCard as ChecklistCardType, ChecklistItem } from '../../types/dashboard';

interface ChecklistCardProps {
  card: ChecklistCardType;
  onUpdate: (updates: Partial<ChecklistCardType>) => void;
  onDelete: () => void;
  onMouseDown: () => void;
  isFiltered?: boolean;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
}

export function ChecklistCard({ card, onUpdate, onDelete, onMouseDown, isFiltered, availableLabels, onCreateLabel }: ChecklistCardProps) {
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        done: false
      };
      onUpdate({
        items: [...card.items, newItem]
      });
      setNewItemText('');
    }
  };

  const updateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    onUpdate({
      items: card.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({
      items: card.items.filter(item => item.id !== itemId)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const completedCount = card.items.filter(item => item.done).length;
  const progressPercentage = card.items.length > 0 ? (completedCount / card.items.length) * 100 : 0;

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

        {/* Progress indicator */}
        {card.items.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs" style={{ color: '#4A5477' }}>
              <span>Progresso</span>
              <span>{completedCount} de {card.items.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Adicionar item..."
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm"
          />
          <Button
            onClick={addItem}
            size="sm"
            className="text-white"
            style={{ backgroundColor: '#3F30F1' }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Items list */}
        <div className="space-y-2 overflow-y-auto flex-1">
          {card.items.map((item) => (
            <div key={item.id} className="flex items-start gap-2 group">
              <Checkbox
                checked={item.done}
                onCheckedChange={(checked) => updateItem(item.id, { done: !!checked })}
                className="mt-0.5"
              />
              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                className={`flex-1 text-sm border-none p-0 h-auto bg-transparent ${
                  item.done ? 'line-through' : ''
                }`}
                style={{ color: item.done ? '#4A5477' : 'inherit' }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={() => deleteItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {card.items.length === 0 && (
            <div className="text-center py-4" style={{ color: '#4A5477' }}>
              <p className="text-sm">Nenhum item na checklist</p>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}