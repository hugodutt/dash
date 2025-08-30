import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { LaterItem } from '../types/dashboard';

interface LaterSidebarProps {
  items: LaterItem[];
  onAddItem: (text: string) => void;
  onUpdateItem: (id: string, updates: Partial<LaterItem>) => void;
  onDeleteItem: (id: string) => void;
}

export function LaterSidebar({ items, onAddItem, onUpdateItem, onDeleteItem }: LaterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-paper2 border-r border-mute/20 transition-all duration-300 z-10 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
      style={{ backgroundColor: '#F2F2FF' }}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-paper shadow-md hover:shadow-lg z-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {!isCollapsed && (
        <div className="p-4 h-full flex flex-col">
          <h2 className="mb-4">Olhar mais tarde</h2>
          
          {/* Add new item */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Adicionar item..."
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleAddItem}
              size="sm"
              className="text-white"
              style={{ backgroundColor: '#3F30F1' }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 group">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) => onUpdateItem(item.id, { done: !!checked })}
                  className="mt-0.5"
                />
                <span 
                  className={`flex-1 text-sm ${item.done ? 'line-through opacity-60' : ''}`}
                  style={{ color: item.done ? '#4A5477' : 'inherit' }}
                >
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10"
                  onClick={() => onDeleteItem(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8" style={{ color: '#4A5477' }}>
                <p className="text-sm">Nenhum item para ver mais tarde</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}