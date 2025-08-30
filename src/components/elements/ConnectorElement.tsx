import React, { useState, useMemo } from 'react';
import { ConnectorElement, Position, Card, FreeElement } from '../../types/dashboard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { getAnchorPosition, getSidePosition } from '../../utils/anchors';
import { calculateStraightRouting, calculateOrthogonalRouting, calculateAutoRouting, getPositionAlongPath } from '../../utils/routing';

interface ConnectorElementComponentProps {
  element: ConnectorElement;
  onUpdate: (element: ConnectorElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  allCards: Card[];
  allElements: FreeElement[];
}

const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const colors = [
    '#3F30F1', '#FFFFFF', '#101113', '#4A5477', '#F2F2FF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#10B981'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: value }}
          />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded border-2 hover:border-white/50"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        <div className="mt-3">
          <Label>Cor personalizada</Label>
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const ConnectorElementComponent: React.FC<ConnectorElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  allCards,
  allElements
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updates: Partial<ConnectorElement>) => {
    onUpdate({ ...element, ...updates });
  };

  // Combinar todos os elementos para resolução de posições
  const allElementsForResolve = useMemo(() => {
    return [
      ...allCards.map(card => ({
        id: card.id,
        position: card.position,
        width: card.width,
        height: card.height,
        type: card.type
      })),
      ...allElements.map(el => ({
        id: el.id,
        position: el.position,
        width: el.width,
        height: el.height,
        type: el.type
      }))
    ];
  }, [allCards, allElements]);

  // Resolver posições dos endpoints
  const resolveEndpoint = (endpoint: typeof element.from | typeof element.to): Position | null => {
    switch (endpoint.mode) {
      case 'port':
        return getAnchorPosition(endpoint.targetId, endpoint.portId, allElementsForResolve);
      case 'side':
        return getSidePosition(endpoint.targetId, endpoint.side, endpoint.t, allElementsForResolve);
      case 'free':
        return { x: endpoint.x, y: endpoint.y };
      default:
        return null;
    }
  };

  const fromPosition = resolveEndpoint(element.from);
  const toPosition = resolveEndpoint(element.to);

  // Calcular path do conector
  const pathPoints = useMemo(() => {
    if (!fromPosition || !toPosition) return [];

    const fromElement = allElementsForResolve.find(el => 
      element.from.mode !== 'free' && el.id === element.from.targetId
    );
    const toElement = allElementsForResolve.find(el => 
      element.to.mode !== 'free' && el.id === element.to.targetId
    );

    switch (element.routing) {
      case 'straight':
        return calculateStraightRouting(fromPosition, toPosition);
      case 'orth':
        return calculateOrthogonalRouting(fromPosition, toPosition, fromElement, toElement);
      case 'auto':
        return calculateAutoRouting(fromPosition, toPosition, fromElement, toElement);
      default:
        return [fromPosition, toPosition];
    }
  }, [fromPosition, toPosition, element.routing, element.from, element.to, allElementsForResolve]);

  if (!fromPosition || !toPosition || pathPoints.length < 2) {
    return null; // Não renderizar se não conseguir resolver posições
  }

  // Calcular bounding box do SVG
  const allX = pathPoints.map(p => p.x);
  const allY = pathPoints.map(p => p.y);
  const minX = Math.min(...allX) - 20;
  const minY = Math.min(...allY) - 20;
  const maxX = Math.max(...allX) + 20;
  const maxY = Math.max(...allY) + 20;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  // Converter pontos para coordenadas relativas do SVG
  const relativePath = pathPoints.map(p => ({
    x: p.x - minX,
    y: p.y - minY
  }));

  // Criar path string
  const pathD = relativePath.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Calcular posição da label se existir
  const labelPosition = element.label ? getPositionAlongPath(relativePath, element.label.t) : null;

  const getStrokeDashArray = () => {
    if (!element.style.dash) return 'none';
    return element.style.dash.join(' ');
  };

  // Calcular setas
  const renderArrows = () => {
    const arrows = [];
    const arrowSize = element.arrow?.size || 10;

    if (element.arrow?.start && relativePath.length > 1) {
      const start = relativePath[0];
      const next = relativePath[1];
      const angle = Math.atan2(next.y - start.y, next.x - start.x);
      arrows.push(renderArrowHead(start, angle + Math.PI, arrowSize, element.arrow.style));
    }

    if (element.arrow?.end && relativePath.length > 1) {
      const end = relativePath[relativePath.length - 1];
      const prev = relativePath[relativePath.length - 2];
      const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
      arrows.push(renderArrowHead(end, angle, arrowSize, element.arrow.style));
    }

    return arrows;
  };

  const renderArrowHead = (position: Position, angle: number, size: number, style: string) => {
    switch (style) {
      case 'triangle':
        const tipX = position.x;
        const tipY = position.y;
        const baseAngle1 = angle + Math.PI - 0.5;
        const baseAngle2 = angle + Math.PI + 0.5;
        const point1X = tipX + size * Math.cos(baseAngle1);
        const point1Y = tipY + size * Math.sin(baseAngle1);
        const point2X = tipX + size * Math.cos(baseAngle2);
        const point2Y = tipY + size * Math.sin(baseAngle2);
        
        return (
          <polygon
            key={`arrow-${position.x}-${position.y}`}
            points={`${tipX},${tipY} ${point1X},${point1Y} ${point2X},${point2Y}`}
            fill={element.style.stroke}
            stroke={element.style.stroke}
          />
        );
      
      case 'circle':
        return (
          <circle
            key={`arrow-${position.x}-${position.y}`}
            cx={position.x}
            cy={position.y}
            r={size / 2}
            fill={element.style.stroke}
            stroke={element.style.stroke}
          />
        );
      
      case 'bar':
        const barX1 = position.x + (size / 2) * Math.cos(angle + Math.PI / 2);
        const barY1 = position.y + (size / 2) * Math.sin(angle + Math.PI / 2);
        const barX2 = position.x + (size / 2) * Math.cos(angle - Math.PI / 2);
        const barY2 = position.y + (size / 2) * Math.sin(angle - Math.PI / 2);
        
        return (
          <line
            key={`arrow-${position.x}-${position.y}`}
            x1={barX1}
            y1={barY1}
            x2={barX2}
            y2={barY2}
            stroke={element.style.stroke}
            strokeWidth={element.style.width}
          />
        );
      
      default:
        return null;
    }
  };

  const editForm = (
    <div className="p-4 space-y-3 w-80 max-h-[500px] overflow-y-auto">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Cor</Label>
        <ColorPicker
          value={element.style.stroke}
          onChange={(color) => handleUpdate({ style: { ...element.style, stroke: color } })}
          label="Cor da linha"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Espessura</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={element.style.width}
            onChange={(e) => handleUpdate({ style: { ...element.style, width: parseInt(e.target.value) || 1 } })}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Roteamento</Label>
          <Select value={element.routing} onValueChange={(routing: 'straight' | 'orth' | 'auto') => handleUpdate({ routing })}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Reto</SelectItem>
              <SelectItem value="orth">Ortogonal</SelectItem>
              <SelectItem value="auto">Automático</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Setas</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={element.arrow?.start || false}
              onCheckedChange={(checked) => handleUpdate({
                arrow: { ...element.arrow, start: checked, size: element.arrow?.size || 10, style: element.arrow?.style || 'triangle' }
              })}
            />
            <Label className="text-xs">Início</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={element.arrow?.end || false}
              onCheckedChange={(checked) => handleUpdate({
                arrow: { ...element.arrow, end: checked, size: element.arrow?.size || 10, style: element.arrow?.style || 'triangle' }
              })}
            />
            <Label className="text-xs">Fim</Label>
          </div>
        </div>

        {(element.arrow?.start || element.arrow?.end) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Tamanho</Label>
              <Input
                type="number"
                min="5"
                max="20"
                value={element.arrow?.size || 10}
                onChange={(e) => handleUpdate({
                  arrow: { ...element.arrow, size: parseInt(e.target.value) || 10 }
                })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Estilo</Label>
              <Select 
                value={element.arrow?.style || 'triangle'} 
                onValueChange={(style: 'triangle' | 'circle' | 'bar') => handleUpdate({
                  arrow: { ...element.arrow, style }
                })}
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="triangle">Triângulo</SelectItem>
                  <SelectItem value="circle">Círculo</SelectItem>
                  <SelectItem value="bar">Barra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button 
          onClick={() => setIsEditing(false)}
          size="sm"
          style={{ backgroundColor: '#3F30F1' }}
          className="text-white hover:opacity-90 flex-1"
        >
          Concluir
        </Button>
        <Button 
          onClick={onDelete}
          size="sm"
          variant="destructive"
          className="flex-1"
        >
          Excluir
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: minX,
        top: minY,
        width: svgWidth,
        height: svgHeight,
        zIndex: element.zIndex
      }}
    >
      <svg 
        width={svgWidth} 
        height={svgHeight}
        className="pointer-events-auto cursor-pointer"
        onDoubleClick={() => setIsEditing(true)}
        onClick={onBringToFront}
      >
        {/* Linha principal */}
        <path
          d={pathD}
          stroke={element.style.stroke}
          strokeWidth={element.style.width}
          strokeDasharray={getStrokeDashArray()}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={element.style.opacity || 1}
        />
        
        {/* Área de clique invisível mais grossa */}
        <path
          d={pathD}
          stroke="transparent"
          strokeWidth={Math.max(12, element.style.width + 8)}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Setas */}
        {renderArrows()}

        {/* Label */}
        {element.label && labelPosition && (
          <text
            x={labelPosition.x + (element.label.offset?.x || 0)}
            y={labelPosition.y + (element.label.offset?.y || 0)}
            fill={element.style.stroke}
            fontSize="12"
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none"
          >
            {element.label.text}
          </text>
        )}
      </svg>

      {/* Edit button */}
      {isEditing && (
        <div className="absolute top-2 right-2">
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverContent 
              className="w-auto p-0 bg-[#F2F2FF] border-2 border-[#3F30F1]/20 shadow-xl" 
              align="end"
              sideOffset={5}
              style={{ zIndex: 9999 }}
            >
              {editForm}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};