import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGlobalKeys } from '../../hooks/useGlobalKeys';
import { X, Type } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckboxElement as CheckboxElementType } from '../../types/dashboard';

interface CheckboxElementProps {
  element: CheckboxElementType;
  onUpdate: (updates: Partial<CheckboxElementType>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onMouseDown: () => void;
  searchTerm: string;
}

export function CheckboxElement({ element, onUpdate, onDelete, onBringToFront, onMouseDown, searchTerm }: CheckboxElementProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHoveringElement, setIsHoveringElement] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [tempText, setTempText] = useState(element.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const keyState = useGlobalKeys();

  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startElementPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // Cleanup hover states quando sair do modo de edição
  useEffect(() => {
    if (!isEditingText && !isHoveringElement && !isHoveringControls) {
      setShowControls(false);
    }
  }, [isEditingText, isHoveringElement, isHoveringControls]);

  const fontSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > 3) {
        setIsDragging(true);
        onUpdate({
          position: {
            x: startElementPos.current.x + deltaX,
            y: startElementPos.current.y + deltaY
          }
        });
      }
    } else if (isResizingRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - startPos.current.x;
      
      const newWidth = Math.max(120, startSize.current.width + deltaX);
      
      onUpdate({
        width: newWidth
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
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, [data-checkbox], [data-text-content]')) return;
    
    // Verificar se a tecla Space está pressionada (modo pan)
    if (keyState.spacePressed) {
      // Permitir que o evento continue para o Canvas fazer pan
      return;
    }
    
    e.preventDefault();
    e.stopPropagation(); // Evitar que o Canvas capture este evento
    onMouseDown();
    
    isDraggingRef.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startElementPos.current = { x: element.position.x, y: element.position.y };
    
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
      width: element.width || 200, 
      height: element.height || 40 
    };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingText(true);
    setTempText(element.text);
  };

  const handleTextBlur = () => {
    setIsEditingText(false);
    onUpdate({ text: tempText });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditingText(false);
      setTempText(element.text);
    } else if (e.key === 'Enter') {
      setIsEditingText(false);
      onUpdate({ text: tempText });
    }
  };

  const handleDoneChange = (done: boolean) => {
    onUpdate({ done });
  };

  const getCurrentFontSize = () => {
    if (typeof element.fontSize === 'number') {
      return element.fontSize;
    }
    // Converter tamanhos antigos baseados em classes para pixels
    const sizeMap = {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20
    };
    return sizeMap[element.fontSize as keyof typeof sizeMap] || 16;
  };

  const shouldShowControls = showControls || isHoveringElement || isHoveringControls;
  const currentFontSize = getCurrentFontSize();
  const fontSizeKey = typeof element.fontSize === 'number' ? 'base' : (element.fontSize || 'base');

  return (
    <motion.div
      ref={dragRef}
      className={`absolute select-none group ${
        (isDragging || isResizing) ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: element.zIndex,
        width: element.width || 'auto',
        minWidth: '150px',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setShowControls(true);
        setIsHoveringElement(true);
      }}
      onMouseLeave={() => {
        setIsHoveringElement(false);
        if (!isEditingText && !isHoveringControls) {
          setShowControls(false);
        }
      }}
      animate={{
        scale: (isDragging || isResizing) ? 1.02 : 1
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* Controles de formatação */}
      {shouldShowControls && !isEditingText && (
        <>
          {/* Área invisível que conecta o elemento aos controles */}
          <div 
            className="absolute -top-8 left-0 right-0 h-8 z-10"
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => {
              setIsHoveringControls(false);
              if (!isHoveringElement && !isEditingText) {
                setShowControls(false);
              }
            }}
          />
          
          <motion.div 
            className="absolute -top-8 left-0 flex items-center gap-1 bg-[#3F30F1] text-white px-2 py-1 rounded shadow-lg text-xs z-20 border border-white/20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => {
              setIsHoveringControls(false);
              if (!isHoveringElement && !isEditingText) {
                setShowControls(false);
              }
            }}
          >
          <Select value={fontSizeKey} onValueChange={(value: any) => onUpdate({ fontSize: value })}>
            <SelectTrigger className="h-6 w-12 border-0 bg-white/10 text-white text-xs">
              <Type className="h-3 w-3" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Pequeno</SelectItem>
              <SelectItem value="sm">Médio</SelectItem>
              <SelectItem value="base">Grande</SelectItem>
              <SelectItem value="lg">XL</SelectItem>
              <SelectItem value="xl">2XL</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-4 bg-white/20" />

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6 p-0 hover:bg-red-500/80 text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
        </>
      )}

      {/* Conteúdo do checkbox */}
      <div 
        className="flex items-center gap-3 px-2 py-2 rounded transition-all duration-200 border-2 border-transparent hover:border-white/30 hover:bg-white/5"
        style={{ width: element.width || 'auto' }}
      >
        <Checkbox
          checked={element.done}
          onCheckedChange={(checked) => handleDoneChange(!!checked)}
          className="border-2 border-white data-[state=checked]:bg-[#3F30F1] data-[state=checked]:border-[#3F30F1] data-[state=checked]:text-white w-5 h-5"
          data-checkbox
        />
        
        {isEditingText ? (
          <Input
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            placeholder="Digite o texto..."
            className="border-2 border-[#3F30F1] flex-1 text-black bg-white/95"
            style={{ fontSize: `${currentFontSize}px` }}
            autoFocus
          />
        ) : (
          <span
            className={`
              cursor-text px-2 py-1 rounded flex-1 transition-colors
              ${element.done ? 'line-through opacity-60' : ''}
            `}
            style={{ 
              color: element.textColor || '#FFFFFF',
              fontSize: `${currentFontSize}px`
            }}
            onDoubleClick={handleTextDoubleClick}
            data-text-content
          >
            {element.text || 'Duplo clique para editar...'}
          </span>
        )}
      </div>

      {/* Handle de redimensionamento horizontal */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-6 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-60"
        onMouseDown={handleResizeMouseDown}
        style={{
          background: 'linear-gradient(90deg, transparent 30%, #3F30F1 30%, #3F30F1 70%, transparent 70%)'
        }}
      />
    </motion.div>
  );
}