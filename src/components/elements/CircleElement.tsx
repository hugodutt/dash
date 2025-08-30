import React from 'react';
import { CircleElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';

interface CircleElementComponentProps {
  element: CircleElement;
  onUpdate: (element: CircleElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const CircleElementComponent: React.FC<CircleElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const handleUpdate = (updates: Partial<CircleElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };

  const size = Math.min(element.width || 100, element.height || 100);

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
        className="cursor-pointer rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: element.fillColor === 'transparent' ? 'transparent' : element.fillColor,
          border: element.strokeWidth > 0 && element.strokeColor !== 'transparent'
            ? `${element.strokeWidth}px solid ${element.strokeColor}` 
            : 'none'
        }}
        onClick={handleClick}
      />
    </BaseElement>
  );
};