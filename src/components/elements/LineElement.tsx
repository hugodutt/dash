import React from 'react';
import { LineElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';

interface LineElementComponentProps {
  element: LineElement;
  onUpdate: (element: LineElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const LineElementComponent: React.FC<LineElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const handleUpdate = (updates: Partial<LineElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };

  // Calcular posições da linha
  const startX = element.position.x;
  const startY = element.position.y;
  const endX = element.endPosition.x;
  const endY = element.endPosition.y;
  
  // Calcular tamanho do SVG container
  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);
  const svgWidth = Math.abs(maxX - minX) + 20;
  const svgHeight = Math.abs(maxY - minY) + 20;
  
  // Coordenadas relativas dentro do SVG
  const relativeStartX = startX - minX + 10;
  const relativeStartY = startY - minY + 10;
  const relativeEndX = endX - minX + 10;
  const relativeEndY = endY - minY + 10;

  const getStrokeDashArray = () => {
    switch (element.style) {
      case 'dashed':
        return `${element.strokeWidth * 3} ${element.strokeWidth * 2}`;
      case 'dotted':
        return `${element.strokeWidth} ${element.strokeWidth}`;
      default:
        return 'none';
    }
  };

  return (
    <BaseElement
      element={{
        ...element,
        position: { x: minX, y: minY },
        width: svgWidth,
        height: svgHeight
      }}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onBringToFront={onBringToFront}
      searchTerm={searchTerm}
      enableResize={false}
      className={isSelected ? 'ring-2 ring-[#3F30F1] ring-opacity-75' : ''}
    >
      <svg 
        width={svgWidth} 
        height={svgHeight}
        className="cursor-pointer"
        onClick={handleClick}
      >
        <line
          x1={relativeStartX}
          y1={relativeStartY}
          x2={relativeEndX}
          y2={relativeEndY}
          stroke={element.strokeColor === 'transparent' ? 'transparent' : element.strokeColor}
          strokeWidth={element.strokeWidth}
          strokeDasharray={getStrokeDashArray()}
          strokeLinecap="round"
        />
        
        {/* Área de clique invisível mais grossa */}
        <line
          x1={relativeStartX}
          y1={relativeStartY}
          x2={relativeEndX}
          y2={relativeEndY}
          stroke="transparent"
          strokeWidth={Math.max(10, element.strokeWidth + 8)}
          strokeLinecap="round"
        />
      </svg>
    </BaseElement>
  );
};