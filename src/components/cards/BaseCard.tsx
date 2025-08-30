import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGlobalKeys } from '../../hooks/useGlobalKeys';
import { X, Grip, Tag, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Card } from '../../types/dashboard';

interface BaseCardProps {
  card: Card;
  onUpdate: (updates: Partial<Card>) => void;
  onDelete: () => void;
  onMouseDown: () => void;
  isFiltered?: boolean;
  children: React.ReactNode;
}

const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function BaseCard({ card, onUpdate, onDelete, onMouseDown, isFiltered = false, children }: BaseCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [tempCategory, setTempCategory] = useState(card.category || '');
  const keyState = useGlobalKeys();
  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startCardPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      onUpdate({
        position: {
          x: startCardPos.current.x + deltaX,
          y: startCardPos.current.y + deltaY
        }
      });
    } else if (isResizingRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      const newWidth = Math.max(280, startSize.current.width + deltaX);
      const newHeight = Math.max(200, startSize.current.height + deltaY);
      
      onUpdate({
        width: newWidth,
        height: newHeight
      });
    }
  });

  const handleMouseUp = useRef((e: MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
    isResizingRef.current = false;
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove.current);
    document.removeEventListener('mouseup', handleMouseUp.current);
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, textarea, [role="combobox"], [contenteditable]')) return;
    
    // Verificar se a tecla Space está pressionada (modo pan) - se sim, não iniciar drag do card
    if (keyState.spacePressed) {
      // Permitir que o evento continue para o Canvas fazer pan
      return;
    }

    // Sempre permitir que o card chame onMouseDown para seleção
    onMouseDown();

    // Só iniciar drag se não estiver em modo pan
    e.preventDefault();
    e.stopPropagation(); // Evitar que o Canvas capture este evento
    isDraggingRef.current = true;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startCardPos.current = { x: card.position.x, y: card.position.y };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMouseDown();
    isResizingRef.current = true;
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { 
      width: card.width || 320, 
      height: card.height || 300 
    };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  // Cleanup effect to remove event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove.current);
      document.removeEventListener('mouseup', handleMouseUp.current);
    };
  }, []);

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      onUpdate({ title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCategorySave = (color?: string) => {
    onUpdate({ 
      category: tempCategory.trim() || undefined,
      categoryColor: color || card.categoryColor 
    });
    setIsEditingCategory(false);
  };

  return (
    <motion.div
      ref={dragRef}
      className={`absolute rounded-lg shadow-lg border select-none flex flex-col ${
        (isDragging || isResizing) ? 'shadow-xl scale-105 cursor-grabbing' : 
        keyState.spacePressed ? 'shadow-md hover:shadow-lg cursor-grab' : 
        'shadow-md hover:shadow-lg cursor-grab'
      } ${isFiltered ? 'opacity-30 pointer-events-none' : ''}`}
      style={{
        left: card.position.x,
        top: card.position.y,
        zIndex: card.zIndex,
        width: card.width || 320,
        height: card.height || 300,
        backgroundColor: '#FFFFFF',
        borderColor: card.categoryColor || '#E5E7EB',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: (isDragging || isResizing) ? 1.05 : 1, 
        opacity: isFiltered ? 0.3 : 1,
        zIndex: (isDragging || isResizing) ? 9999 : card.zIndex 
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-2 flex-1">
          <Grip className="h-4 w-4 cursor-grab active:cursor-grabbing text-gray-600" />
          
          {isEditingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTempTitle(card.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="text-sm font-medium border-none p-0 h-auto"
            />
          ) : (
            <h3
              className="font-medium text-sm flex-1 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded text-gray-900"
              onClick={() => {
                setIsEditingTitle(true);
                setTempTitle(card.title);
              }}
            >
              {card.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Category */}
          <Popover open={isEditingCategory} onOpenChange={setIsEditingCategory}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center justify-center h-6 w-6 p-0 text-sm font-medium transition-colors rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                <Tag className="h-3 w-3" style={{ color: card.categoryColor || '#6B7280' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <Input
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  placeholder="Nome da categoria"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCategorySave();
                  }}
                />
                <div className="grid grid-cols-5 gap-2">
                  {categoryColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: color,
                        borderColor: card.categoryColor === color ? '#000' : 'transparent'
                      }}
                      onClick={() => handleCategorySave(color)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCategorySave()}>
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingCategory(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Category badge */}
      {card.category && (
        <div className="px-3 pt-2">
          <span 
            className="inline-block px-2 py-1 text-xs rounded-full text-white font-medium"
            style={{ backgroundColor: card.categoryColor || '#6B7280' }}
          >
            {card.category}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-3 pt-2 flex-1 overflow-auto">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
        style={{
          background: 'linear-gradient(-45deg, transparent 30%, #9CA3AF 30%, #9CA3AF 40%, transparent 40%, transparent 60%, #9CA3AF 60%, #9CA3AF 70%, transparent 70%)'
        }}
      />
    </motion.div>
  );
}