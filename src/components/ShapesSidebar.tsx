import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { 
  Square,
  Circle,
  Minus,
  ArrowRight,
  Palette,
  Brush,
  RectangleHorizontal,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';

interface ShapeStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  // Para sticky notes
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
  content?: string;
  // Para progress
  value?: number;
  label?: string;
  showValue?: boolean;
  progressStyle?: 'bar' | 'circle';
}

interface ShapesSidebarProps {
  isVisible: boolean;
  selectedElementId?: string;
  elementType?: 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress';
  shapeStyle: ShapeStyle;
  onStyleChange: (style: Partial<ShapeStyle>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCreateShape?: (type: 'rectangle' | 'circle' | 'line' | 'arrow', style: ShapeStyle) => void;
}

const colors = [
  '#000000', '#FFFFFF', '#3F30F1', '#4A5477', '#F2F2FF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#10B981'
];

const strokeStyles = [
  { value: 'solid', label: 'Sólida' },
  { value: 'dashed', label: 'Tracejada' },
  { value: 'dotted', label: 'Pontilhada' }
];

const presetShapes = [
  { type: 'rectangle' as const, icon: Square, label: 'Retângulo' },
  { type: 'circle' as const, icon: Circle, label: 'Círculo' },
  { type: 'line' as const, icon: Minus, label: 'Linha' },
  { type: 'arrow' as const, icon: ArrowRight, label: 'Seta' }
];

export const ShapesSidebar: React.FC<ShapesSidebarProps> = ({
  isVisible,
  selectedElementId,
  elementType,
  shapeStyle,
  onStyleChange,
  onDuplicate,
  onDelete,
  onCreateShape
}) => {
  const [creationStyle, setCreationStyle] = useState<ShapeStyle>({
    fillColor: '#3F30F1',
    strokeColor: '#FFFFFF',
    strokeWidth: 2,
    borderRadius: 8,
    opacity: 1,
    style: 'solid'
  });

  if (!isVisible) return null;

  const currentStyle = selectedElementId ? shapeStyle : creationStyle;
  const onCurrentStyleChange = selectedElementId ? onStyleChange : setCreationStyle;

  const handleCreateShape = (type: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    if (onCreateShape) {
      onCreateShape(type, creationStyle);
    }
  };

  return (
    <div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-40"
      style={{ backgroundColor: '#F2F2FF' }}
    >
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <RectangleHorizontal size={16} />
          {selectedElementId ? 'Editar Shape' : 'Criar Shape'}
        </h3>
        {selectedElementId ? (
          <p className="text-xs text-gray-500 mt-1">
            {elementType} selecionado
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Escolha um tipo e configure o estilo
          </p>
        )}
      </div>

      {/* Criação de shapes - só aparece quando nenhum elemento está selecionado */}
      {!selectedElementId && onCreateShape && (
        <div className="mb-4 p-3 bg-white rounded border-2 border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Tipos de Shape
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {presetShapes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                onClick={() => handleCreateShape(type)}
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Icon size={16} />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cor de preenchimento */}
      <div className="space-y-3 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Palette size={14} />
          Preenchimento
        </Label>
        
        {/* Botão SEM preenchimento */}
        <div className="mb-2">
          <Button
            variant={currentStyle.fillColor === 'transparent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCurrentStyleChange({ fillColor: 'transparent' })}
            className={`w-full h-8 text-xs transition-colors ${
              currentStyle.fillColor === 'transparent' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={currentStyle.fillColor === 'transparent' ? { backgroundColor: '#3F30F1' } : {}}
          >
            {currentStyle.fillColor === 'transparent' ? '✓ SEM preenchimento' : '⭕ SEM preenchimento'}
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all ${
                currentStyle.fillColor === color ? 'border-[#3F30F1] scale-110' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onCurrentStyleChange({ fillColor: color })}
            />
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={currentStyle.fillColor === 'transparent' ? '#3F30F1' : currentStyle.fillColor}
            onChange={(e) => onCurrentStyleChange({ fillColor: e.target.value })}
            className="h-8 w-full"
            disabled={currentStyle.fillColor === 'transparent'}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Contorno */}
      <div className="space-y-3 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Brush size={14} />
          Contorno
        </Label>
        
        {/* Botão SEM contorno */}
        <div className="mb-2">
          <Button
            variant={currentStyle.strokeColor === 'transparent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCurrentStyleChange({ strokeColor: 'transparent' })}
            className={`w-full h-8 text-xs transition-colors ${
              currentStyle.strokeColor === 'transparent' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={currentStyle.strokeColor === 'transparent' ? { backgroundColor: '#3F30F1' } : {}}
          >
            {currentStyle.strokeColor === 'transparent' ? '✓ SEM contorno' : '⭕ SEM contorno'}
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all ${
                currentStyle.strokeColor === color ? 'border-[#3F30F1] scale-110' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onCurrentStyleChange({ strokeColor: color })}
            />
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={currentStyle.strokeColor === 'transparent' ? '#FFFFFF' : currentStyle.strokeColor}
            onChange={(e) => onCurrentStyleChange({ strokeColor: e.target.value })}
            className="h-8 w-full"
            disabled={currentStyle.strokeColor === 'transparent'}
          />
        </div>
      </div>

      {/* Espessura do contorno */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Espessura do contorno</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">0</span>
          <Slider
            value={[currentStyle.strokeColor === 'transparent' ? 0 : currentStyle.strokeWidth]}
            onValueChange={([value]) => onCurrentStyleChange({ strokeWidth: value })}
            min={0}
            max={10}
            step={1}
            className="flex-1"
            disabled={currentStyle.strokeColor === 'transparent'}
          />
          <span className="text-xs text-gray-500 w-8">10</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={currentStyle.strokeColor === 'transparent' ? 0 : currentStyle.strokeWidth}
            onChange={(e) => onCurrentStyleChange({ strokeWidth: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
            min="0"
            max="10"
            disabled={currentStyle.strokeColor === 'transparent'}
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
        {currentStyle.strokeColor === 'transparent' && (
          <p className="text-xs text-gray-500 italic">
            Espessura desabilitada (sem contorno)
          </p>
        )}
      </div>

      {/* Estilo da linha (para linhas e setas) */}
      {(elementType === 'line' || elementType === 'arrow' || !selectedElementId) && (
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium text-gray-700">Estilo da linha</Label>
          <Select 
            value={currentStyle.style || 'solid'} 
            onValueChange={(style: 'solid' | 'dashed' | 'dotted') => onCurrentStyleChange({ style })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strokeStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Border radius (apenas para retângulos) */}
      {(elementType === 'rectangle' || !selectedElementId) && (
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium text-gray-700">Arredondamento</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8">0</span>
            <Slider
              value={[currentStyle.borderRadius || 0]}
              onValueChange={([value]) => onCurrentStyleChange({ borderRadius: value })}
              min={0}
              max={50}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">50</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={currentStyle.borderRadius || 0}
              onChange={(e) => onCurrentStyleChange({ borderRadius: parseInt(e.target.value) || 0 })}
              className="h-8 text-xs"
              min="0"
              max="50"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>
      )}

      {/* Opacidade */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Eye size={14} />
          Opacidade
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">0</span>
          <Slider
            value={[currentStyle.opacity * 100]}
            onValueChange={([value]) => onCurrentStyleChange({ opacity: value / 100 })}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">100</span>
        </div>
        <div className="text-center text-xs text-gray-600">
          {Math.round(currentStyle.opacity * 100)}%
        </div>
      </div>

      {/* Ações */}
      {selectedElementId && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Ações</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicate}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Copy size={14} />
                <span className="text-xs">Duplicar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex flex-col items-center gap-1 h-auto py-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
                <span className="text-xs">Excluir</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};