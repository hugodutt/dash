import React from 'react';
import { ArrowElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';

interface ArrowElementComponentProps {
  element: ArrowElement;
  onUpdate: (element: ArrowElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const ArrowElementComponent: React.FC<ArrowElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const handleUpdate = (updates: Partial<ArrowElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };

  // Calcular posições da seta
  const startX = element.position.x;
  const startY = element.position.y;
  const endX = element.endPosition.x;
  const endY = element.endPosition.y;
  
  // Calcular tamanho do SVG container
  const minX = Math.min(startX, endX) - element.arrowSize;
  const minY = Math.min(startY, endY) - element.arrowSize;
  const maxX = Math.max(startX, endX) + element.arrowSize;
  const maxY = Math.max(startY, endY) + element.arrowSize;
  const svgWidth = Math.abs(maxX - minX) + 20;
  const svgHeight = Math.abs(maxY - minY) + 20;
  
  // Coordenadas relativas dentro do SVG
  const relativeStartX = startX - minX + 10;
  const relativeStartY = startY - minY + 10;
  const relativeEndX = endX - minX + 10;
  const relativeEndY = endY - minY + 10;

  // Calcular ângulo da seta
  const angle = Math.atan2(relativeEndY - relativeStartY, relativeEndX - relativeStartX);
  
  // Calcular pontos da ponta da seta
  const arrowLength = element.arrowSize;
  const arrowAngle = Math.PI / 6; // 30 graus
  
  const arrowPoint1X = relativeEndX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = relativeEndY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowPoint2X = relativeEndX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = relativeEndY - arrowLength * Math.sin(angle + arrowAngle);

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
        {/* Linha da seta */}
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
        
        {/* Ponta da seta */}
        <polygon
          points={`${relativeEndX},${relativeEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
          fill={element.strokeColor === 'transparent' ? 'transparent' : element.strokeColor}
          stroke={element.strokeColor === 'transparent' ? 'transparent' : element.strokeColor}
          strokeWidth={element.strokeWidth / 2}
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