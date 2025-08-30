import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus, Tag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface LabelManagerProps {
  labels: string[];
  availableLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  onCreateLabel: (labelName: string) => void;
}

export function LabelManager({ labels, availableLabels, onLabelsChange, onCreateLabel }: LabelManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  const handleAddLabel = (labelName: string) => {
    if (!(labels || []).includes(labelName)) {
      onLabelsChange([...(labels || []), labelName]);
    }
    setIsOpen(false);
  };

  const handleRemoveLabel = (labelName: string) => {
    onLabelsChange((labels || []).filter(l => l !== labelName));
  };

  const handleCreateNewLabel = () => {
    if (newLabelName.trim() && !(availableLabels || []).includes(newLabelName.trim())) {
      onCreateLabel(newLabelName.trim());
      onLabelsChange([...(labels || []), newLabelName.trim()]);
      setNewLabelName('');
      setIsOpen(false);
    }
  };

  const getLabelColor = (labelName: string) => {
    // Gerar cores baseadas no nome da label para consistência
    const colors = [
      'bg-red-100 text-red-800 hover:bg-red-200',
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-gray-100 text-gray-800 hover:bg-gray-200'
    ];
    
    const hash = labelName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {(labels || []).map(label => (
        <Badge
          key={label}
          variant="secondary"
          className={`${getLabelColor(label)} flex items-center gap-1 text-xs`}
        >
          <Tag className="w-3 h-3" />
          {label}
          <button
            onClick={() => handleRemoveLabel(label)}
            className="ml-1 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs border-dashed"
          >
            <Plus className="w-3 h-3 mr-1" />
            Label
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Adicionar Nova Label</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da label..."
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateNewLabel()}
                  className="flex-1 text-xs"
                />
                <Button
                  onClick={handleCreateNewLabel}
                  disabled={!newLabelName.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {(availableLabels || []).length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Labels Existentes</label>
                <div className="flex flex-wrap gap-1">
                  {(availableLabels || [])
                    .filter(label => !(labels || []).includes(label))
                    .map(label => (
                      <Badge
                        key={label}
                        variant="outline"
                        className={`${getLabelColor(label)} cursor-pointer text-xs`}
                        onClick={() => handleAddLabel(label)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {label}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}