import React, { useState } from 'react';
import { StickyElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface StickyElementComponentProps {
  element: StickyElement;
  onUpdate: (element: StickyElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

const stickyColors = {
  yellow: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  pink: { bg: '#FCE7F3', border: '#EC4899', text: '#BE185D' },
  blue: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
  green: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  orange: { bg: '#FED7AA', border: '#F97316', text: '#C2410C' }
};

export const StickyElementComponent: React.FC<StickyElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);

  const handleUpdate = (updates: Partial<StickyElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleContentChange = (content: string) => {
    handleUpdate({ content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsInlineEditing(false);
    }
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };

  const colorStyle = stickyColors[element.color];

  return (
    <BaseElement
      element={element}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onBringToFront={onBringToFront}
      searchTerm={searchTerm}
      className={isSelected ? 'ring-2 ring-[#3F30F1] ring-opacity-75' : ''}
    >
      <div 
        className="w-full h-full p-3 cursor-pointer shadow-lg transform rotate-1 hover:rotate-0 transition-transform"
        style={{
          backgroundColor: colorStyle.bg,
          border: `2px solid ${colorStyle.border}`,
          color: colorStyle.text,
          minHeight: '120px'
        }}
        onDoubleClick={() => setIsInlineEditing(true)}
        onClick={handleClick}
      >
        {isInlineEditing ? (
          <Textarea
            value={element.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsInlineEditing(false)}
            className="w-full h-full bg-transparent border-none resize-none outline-none p-0"
            style={{ color: colorStyle.text }}
            autoFocus
          />
        ) : (
          <div className="whitespace-pre-wrap break-words font-medium">
            {element.content || 'Duplo clique para editar...'}
          </div>
        )}
      </div>
    </BaseElement>
  );
};