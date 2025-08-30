import React from 'react';
import { RectangleElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';

interface RectangleElementComponentProps {
  element: RectangleElement;
  onUpdate: (element: RectangleElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const RectangleElementComponent: React.FC<RectangleElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const handleUpdate = (updates: Partial<RectangleElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };

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
        className="w-full h-full cursor-pointer"
        style={{
          backgroundColor: element.fillColor === 'transparent' ? 'transparent' : element.fillColor,
          border: element.strokeWidth > 0 && element.strokeColor !== 'transparent' 
            ? `${element.strokeWidth}px solid ${element.strokeColor}` 
            : 'none',
          borderRadius: `${element.borderRadius}px`
        }}
        onClick={handleClick}
      />
    </BaseElement>
  );
};