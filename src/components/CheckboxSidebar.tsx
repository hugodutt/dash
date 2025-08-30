import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  CheckSquare,
  Square,
  Type,
  Palette,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';

interface CheckboxStyle {
  text: string;
  done: boolean;
  fontSize: number;
  textColor: string;
  opacity?: number;
}

interface CheckboxSidebarProps {
  isVisible: boolean;
  selectedElementId?: string;
  checkboxStyle: CheckboxStyle;
  onStyleChange: (style: Partial<CheckboxStyle>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCreateCheckbox?: (style: CheckboxStyle) => void;
}

const colors = [
  '#000000', '#FFFFFF', '#3F30F1', '#4A5477', '#F2F2FF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#10B981'
];

const fontSizes = [
  { value: 'S', size: 12 },
  { value: 'M', size: 16 },
  { value: 'L', size: 20 },
  { value: 'XL', size: 24 }
];

export const CheckboxSidebar: React.FC<CheckboxSidebarProps> = ({
  isVisible,
  selectedElementId,
  checkboxStyle,
  onStyleChange,
  onDuplicate,
  onDelete,
  onCreateCheckbox
}) => {
  const [newText, setNewText] = useState('');
  const [creationStyle, setCreationStyle] = useState<CheckboxStyle>({
    text: 'Nova tarefa',
    done: false,
    fontSize: 16,
    textColor: '#FFFFFF',
    opacity: 1
  });

  if (!isVisible) return null;

  const currentStyle = selectedElementId ? checkboxStyle : creationStyle;
  const onCurrentStyleChange = selectedElementId ? onStyleChange : setCreationStyle;

  const handleCreateCheckbox = () => {
    if (newText.trim() && onCreateCheckbox) {
      onCreateCheckbox({
        ...creationStyle,
        text: newText.trim()
      });
      setNewText('');
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
          <CheckSquare size={16} />
          {selectedElementId ? 'Editar Checkbox' : 'Criar Checkbox'}
        </h3>
        {selectedElementId ? (
          <p className="text-xs text-gray-500 mt-1">
            Checkbox selecionado
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Configure o texto e estilo
          </p>
        )}
      </div>

      {/* Campo de criação de checkbox - só aparece quando nenhum elemento está selecionado */}
      {!selectedElementId && onCreateCheckbox && (
        <div className="mb-4 p-3 bg-white rounded border-2 border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Texto do checkbox
          </Label>
          <div className="space-y-2">
            <Input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Digite o texto do checkbox..."
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newText.trim()) {
                  handleCreateCheckbox();
                }
              }}
            />
            <Button
              onClick={handleCreateCheckbox}
              disabled={!newText.trim()}
              className="w-full"
              style={{ backgroundColor: '#3F30F1' }}
            >
              Criar Checkbox no Canvas
            </Button>
          </div>
        </div>
      )}

      {/* Texto do checkbox - para edição */}
      {selectedElementId && (
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium text-gray-700">Texto</Label>
          <Input
            type="text"
            value={currentStyle.text}
            onChange={(e) => onCurrentStyleChange({ text: e.target.value })}
            className="w-full"
          />
        </div>
      )}

      {/* Estado do checkbox */}
      <div className="flex items-center justify-between mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {currentStyle.done ? <CheckSquare size={14} /> : <Square size={14} />}
          Marcado
        </Label>
        <Switch
          checked={currentStyle.done}
          onCheckedChange={(done) => onCurrentStyleChange({ done })}
        />
      </div>

      <Separator className="my-4" />

      {/* Cor do texto */}
      <div className="space-y-3 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Palette size={14} />
          Cor do texto
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all ${
                currentStyle.textColor === color ? 'border-[#3F30F1] scale-110' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onCurrentStyleChange({ textColor: color })}
            />
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={currentStyle.textColor}
            onChange={(e) => onCurrentStyleChange({ textColor: e.target.value })}
            className="h-8 w-full"
          />
        </div>
      </div>

      {/* Tamanho da fonte */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Type size={14} />
          Tamanho da fonte
        </Label>
        <div className="flex gap-1">
          {fontSizes.map((size) => (
            <Button
              key={size.value}
              variant={currentStyle.fontSize === size.size ? "default" : "outline"}
              size="sm"
              onClick={() => onCurrentStyleChange({ fontSize: size.size })}
              className="flex-1 text-xs"
              style={currentStyle.fontSize === size.size ? { backgroundColor: '#3F30F1' } : {}}
            >
              {size.value}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={currentStyle.fontSize}
            onChange={(e) => onCurrentStyleChange({ fontSize: parseInt(e.target.value) || 16 })}
            className="h-8 text-xs"
            min="8"
            max="32"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>

      {/* Opacidade */}
      {currentStyle.opacity !== undefined && (
        <div className="space-y-2 mb-4">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Eye size={14} />
            Opacidade
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8">0</span>
            <Slider
              value={[(currentStyle.opacity || 1) * 100]}
              onValueChange={([value]) => onCurrentStyleChange({ opacity: value / 100 })}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">100</span>
          </div>
          <div className="text-center text-xs text-gray-600">
            {Math.round((currentStyle.opacity || 1) * 100)}%
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="mb-4 p-3 bg-white rounded border border-gray-200">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview</Label>
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
              currentStyle.done ? 'bg-[#3F30F1] border-[#3F30F1]' : 'border-gray-400'
            }`}
          >
            {currentStyle.done && (
              <CheckSquare size={12} className="text-white" />
            )}
          </div>
          <span 
            style={{ 
              color: currentStyle.textColor,
              fontSize: currentStyle.fontSize,
              opacity: currentStyle.opacity || 1,
              textDecoration: currentStyle.done ? 'line-through' : 'none'
            }}
          >
            {currentStyle.text || 'Texto do checkbox'}
          </span>
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