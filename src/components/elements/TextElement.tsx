import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGlobalKeys } from '../../hooks/useGlobalKeys';
import { TextElement as TextElementType } from '../../types/dashboard';

interface TextElementProps {
  element: TextElementType;
  onUpdate: (updates: Partial<TextElementType>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onMouseDown: () => void;
  onSelect?: (elementId: string) => void;
  searchTerm: string;
  isSelected?: boolean;
}

export function TextElement({ 
  element, 
  onUpdate, 
  onDelete, 
  onBringToFront, 
  onMouseDown, 
  onSelect,
  searchTerm,
  isSelected = false 
}: TextElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const keyState = useGlobalKeys();
  
  const elementRef = useRef<HTMLDivElement>(null);

  const isHighlighted = searchTerm && element.content.toLowerCase().includes(searchTerm.toLowerCase());

  // Usar o fontSize definido pelo usuário ou calcular baseado no tamanho quando não definido
  const currentFontSize = element.fontSize || 16;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Verificar se a tecla Space está pressionada (modo pan)
    if (keyState.spacePressed) {
      // Permitir que o evento continue para o Canvas fazer pan
      return;
    }

    e.preventDefault();
    e.stopPropagation(); // Evitar que o Canvas capture este evento
    onMouseDown();
    onBringToFront();
    
    if (onSelect) {
      onSelect(element.id);
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.position.x,
      elementY: element.position.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width || 200,
      height: element.height || 50
    });

    const handleMouseMove = (moveE: MouseEvent) => {
      const deltaX = moveE.clientX - resizeStart.x;
      const deltaY = moveE.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      switch (corner) {
        case 'se':
          newWidth = Math.max(100, resizeStart.width + deltaX);
          newHeight = Math.max(30, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, resizeStart.width - deltaX);
          newHeight = Math.max(30, resizeStart.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(100, resizeStart.width + deltaX);
          newHeight = Math.max(30, resizeStart.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(100, resizeStart.width - deltaX);
          newHeight = Math.max(30, resizeStart.height - deltaY);
          break;
      }

      onUpdate({
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onUpdate({
        position: {
          x: dragStart.elementX + deltaX,
          y: dragStart.elementY + deltaY
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onUpdate]);

  const textStyle: React.CSSProperties = {
    fontSize: `${currentFontSize}px`,
    fontWeight: element.isBold ? 'bold' : 'normal',
    fontStyle: element.isItalic ? 'italic' : 'normal',
    textDecoration: element.isUnderlined ? 'underline' : 'none',
    textAlign: element.textAlign,
    color: element.textColor,
    fontFamily: element.fontFamily || 'Inter',
    opacity: element.opacity || 1,
    backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
    lineHeight: '1.2',
    wordBreak: 'break-word',
    overflow: 'hidden'
  };

  return (
    <motion.div
      ref={elementRef}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-[#3F30F1] ring-opacity-50' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.width || 200,
        height: element.height || 50,
        zIndex: element.zIndex
      }}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging || isResizing ? 1.02 : 1 
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Conteúdo do texto */}
      <div 
        className="w-full h-full p-2 flex items-center justify-start"
        style={textStyle}
      >
        {element.content || 'Texto'}
      </div>

      {/* Handles de redimensionamento - só aparecem quando selecionado */}
      {isSelected && (
        <>
          {[
            { corner: 'nw', className: 'top-0 left-0 cursor-nw-resize' },
            { corner: 'ne', className: 'top-0 right-0 cursor-ne-resize' },
            { corner: 'sw', className: 'bottom-0 left-0 cursor-sw-resize' },
            { corner: 'se', className: 'bottom-0 right-0 cursor-se-resize' }
          ].map(({ corner, className }) => (
            <div
              key={corner}
              className={`absolute w-3 h-3 bg-[#3F30F1] border border-white rounded-sm ${className}`}
              style={{ transform: 'translate(-50%, -50%)' }}
              onMouseDown={(e) => handleResizeMouseDown(e, corner)}
            />
          ))}
          
          {/* Indicador de fonte */}
          <div className="absolute -top-8 left-0 bg-[#3F30F1] text-white px-2 py-1 rounded text-xs">
            {Math.round(currentFontSize)}px
          </div>
        </>
      )}

      {/* Borda sutil quando hover */}
      {!isSelected && (
        <div className="absolute inset-0 border border-transparent hover:border-white/20 rounded transition-colors pointer-events-none" />
      )}
    </motion.div>
  );
}