import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Square,
  Circle,
  Minus,
  ArrowRight,
  RectangleHorizontal,
  StickyNote,
  TrendingUp
} from 'lucide-react';

interface ShapeDropdownProps {
  onCreateShape: (type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress') => void;
}

const shapes = [
  { type: 'rectangle' as const, icon: Square, label: 'Retângulo' },
  { type: 'circle' as const, icon: Circle, label: 'Círculo' },
  { type: 'line' as const, icon: Minus, label: 'Linha' },
  { type: 'arrow' as const, icon: ArrowRight, label: 'Seta' },
  { type: 'sticky' as const, icon: StickyNote, label: 'Sticky Note' },
  { type: 'progress' as const, icon: TrendingUp, label: 'Barra de Progresso' }
];

export const ShapeDropdown: React.FC<ShapeDropdownProps> = ({ onCreateShape }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateShape = (type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress') => {
    onCreateShape(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 bg-green-50 hover:bg-green-100"
      >
        <Circle className="h-4 w-4" />
        Shapes
      </Button>

      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div 
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-40"
            style={{ backgroundColor: '#F2F2FF' }}
          >
            {/* Cabeçalho */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <RectangleHorizontal size={16} />
                Criar Shape
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Escolha um tipo para adicionar
              </p>
            </div>

            {/* Tipos de Shape */}
            <div className="grid grid-cols-2 gap-2">
              {shapes.map(({ type, icon: Icon, label }) => (
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

            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              💡 Dica: Após criar, selecione o shape para editar suas propriedades
            </div>
          </div>
        </>
      )}
    </div>
  );
};