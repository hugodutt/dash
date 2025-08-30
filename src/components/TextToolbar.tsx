import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Palette,
  Eye,
  Copy,
  Trash2,
  Link
} from 'lucide-react';

interface TextStyle {
  color: string;
  fontFamily: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  opacity: number;
  content?: string;
}

interface TextToolbarProps {
  isVisible: boolean;
  selectedElementId?: string;
  elementType?: 'text' | 'title';
  textStyle: TextStyle;
  onStyleChange: (style: Partial<TextStyle>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddLink?: () => void;
  onCreateText?: (text: string, style: TextStyle, type: 'text' | 'title') => void;
}

const fontFamilies = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' }
];

const fontSizes = [
  { value: 'S', size: 12 },
  { value: 'M', size: 16 },
  { value: 'L', size: 24 },
  { value: 'XL', size: 32 }
];

const colors = [
  '#000000', '#FFFFFF', '#3F30F1', '#4A5477', '#F2F2FF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#10B981'
];

export const TextToolbar: React.FC<TextToolbarProps> = ({
  isVisible,
  selectedElementId,
  elementType,
  textStyle,
  onStyleChange,
  onDuplicate,
  onDelete,
  onAddLink,
  onCreateText
}) => {
  const [newText, setNewText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'title'>('text');
  const [creationStyle, setCreationStyle] = useState<TextStyle>({
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 16,
    textAlign: 'left' as const,
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    opacity: 1
  });

  if (!isVisible) return null;

  const handleCreateText = () => {
    if (newText.trim() && onCreateText) {
      onCreateText(newText.trim(), creationStyle, selectedType);
      setNewText('');
    }
  };

  const currentStyle = selectedElementId ? textStyle : creationStyle;
  const onCurrentStyleChange = selectedElementId ? onStyleChange : setCreationStyle;

  return (
    <div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-40"
      style={{ backgroundColor: '#F2F2FF' }}
    >
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Type size={16} />
          {selectedElementId ? 'Formatação de Texto' : 'Criar Texto Livre'}
        </h3>
        {selectedElementId ? (
          <p className="text-xs text-gray-500 mt-1">
            {elementType === 'title' ? 'Título' : 'Texto'} selecionado
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Digite seu texto e configure o estilo
          </p>
        )}
      </div>

      {/* Campo de criação de texto - só aparece quando nenhum elemento está selecionado e onCreateText está disponível */}
      {!selectedElementId && onCreateText && (
        <div className="mb-4 p-3 bg-white rounded border-2 border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Tipo de texto
          </Label>
          <div className="flex gap-2 mb-3">
            <Button
              variant={selectedType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('text')}
              className="flex-1"
              style={selectedType === 'text' ? { backgroundColor: '#3F30F1' } : {}}
            >
              Texto
            </Button>
            <Button
              variant={selectedType === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('title')}
              className="flex-1"
              style={selectedType === 'title' ? { backgroundColor: '#3F30F1' } : {}}
            >
              Título
            </Button>
          </div>
          
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Conteúdo
          </Label>
          <div className="space-y-2">
            <Input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={selectedType === 'title' ? 'Digite o título...' : 'Digite o texto...'}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newText.trim()) {
                  handleCreateText();
                }
              }}
            />
            <Button
              onClick={handleCreateText}
              disabled={!newText.trim()}
              className="w-full"
              style={{ backgroundColor: '#3F30F1' }}
            >
              Criar {selectedType === 'title' ? 'Título' : 'Texto'} no Canvas
            </Button>
          </div>
        </div>
      )}

      {/* Campo de edição de conteúdo - só aparece quando um elemento está selecionado */}
      {selectedElementId && (
        <div className="mb-4 p-3 bg-white rounded border-2 border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Editar Conteúdo
          </Label>
          <div className="space-y-2">
            <Textarea
              value={currentStyle.content || ''}
              onChange={(e) => onCurrentStyleChange({ content: e.target.value })}
              placeholder={elementType === 'title' ? 'Digite o título...' : 'Digite o texto...'}
              className="min-h-[60px]"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Edite o conteúdo do {elementType === 'title' ? 'título' : 'texto'} selecionado
            </p>
          </div>
        </div>
      )}

      {/* Contorno/Cores */}
      <div className="space-y-3 mb-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Palette size={14} />
          Contorno
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all ${
                currentStyle.color === color ? 'border-[#3F30F1] scale-110' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onCurrentStyleChange({ color })}
            />
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={currentStyle.color}
            onChange={(e) => onCurrentStyleChange({ color: e.target.value })}
            className="h-8 w-full"
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Família da fonte */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Família da fonte</Label>
        <div className="flex gap-2">
          {/* Ícones de estilo */}
          <Button
            variant={currentStyle.isBold ? "default" : "outline"}
            size="sm"
            onClick={() => onCurrentStyleChange({ isBold: !currentStyle.isBold })}
            className="p-2"
            style={currentStyle.isBold ? { backgroundColor: '#3F30F1' } : {}}
          >
            <Bold size={14} />
          </Button>
          <Button
            variant={currentStyle.isItalic ? "default" : "outline"}
            size="sm"
            onClick={() => onCurrentStyleChange({ isItalic: !currentStyle.isItalic })}
            className="p-2"
            style={currentStyle.isItalic ? { backgroundColor: '#3F30F1' } : {}}
          >
            <Italic size={14} />
          </Button>
          <Button
            variant={currentStyle.isUnderlined ? "default" : "outline"}
            size="sm"
            onClick={() => onCurrentStyleChange({ isUnderlined: !currentStyle.isUnderlined })}
            className="p-2"
            style={currentStyle.isUnderlined ? { backgroundColor: '#3F30F1' } : {}}
          >
            <Underline size={14} />
          </Button>
        </div>
        <Select 
          value={currentStyle.fontFamily} 
          onValueChange={(fontFamily) => onCurrentStyleChange({ fontFamily })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tamanho da fonte */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Tamanho da fonte</Label>
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
            max="72"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>

      {/* Alinhamento */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Alinhamento do texto</Label>
        <div className="flex gap-1">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight }
          ].map(({ value, icon: Icon }) => (
            <Button
              key={value}
              variant={currentStyle.textAlign === value ? "default" : "outline"}
              size="sm"
              onClick={() => onCurrentStyleChange({ textAlign: value as 'left' | 'center' | 'right' })}
              className="flex-1 p-2"
              style={currentStyle.textAlign === value ? { backgroundColor: '#3F30F1' } : {}}
            >
              <Icon size={14} />
            </Button>
          ))}
        </div>
      </div>

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
            <div className="grid grid-cols-3 gap-2">
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
                onClick={onAddLink}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Link size={14} />
                <span className="text-xs">Link</span>
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