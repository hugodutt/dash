import React, { useState, useRef, useEffect } from 'react';
import { Position } from '../types/dashboard';

interface InlineTextEditorProps {
  position: Position;
  initialText?: string;
  onComplete: (text: string, finalPosition: Position, width: number, height: number) => void;
  onCancel: () => void;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  position,
  initialText = '',
  onComplete,
  onCancel,
  textColor = '#FFFFFF',
  fontFamily = 'Inter',
  fontSize = 16,
  textAlign = 'left',
  isBold = false,
  isItalic = false,
  isUnderlined = false
}) => {
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState({ width: 200, height: 50 });
  const [isResizing, setIsResizing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular tamanho da fonte baseado no tamanho da caixa
  const calculateFontSize = (width: number, height: number, textLength: number) => {
    const baseSize = Math.min(width, height) / 8;
    const textFactor = Math.max(1, Math.sqrt(textLength / 10));
    return Math.max(12, Math.min(48, baseSize / textFactor));
  };

  const currentFontSize = calculateFontSize(size.width, size.height, text.length);

  const handleComplete = () => {
    if (text.trim()) {
      onComplete(text.trim(), position, size.width, size.height);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleComplete();
    }
    // Permitir todos os outros eventos de tecla passarem naturalmente
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Text changed:', e.target.value); // Debug log
    setText(e.target.value);
  };

  // Focus automático quando componente monta
  useEffect(() => {
    console.log('InlineTextEditor mounted'); // Debug log
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        console.log('Focusing textarea'); // Debug log
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(0, initialText.length);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle do redimensionamento
  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveE: MouseEvent) => {
      const deltaX = moveE.clientX - startX;
      const deltaY = moveE.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (corner) {
        case 'se':
          newWidth = Math.max(100, startWidth + deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, startWidth - deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(100, startWidth + deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(100, startWidth - deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          break;
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Restaurar foco
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle cliques fora do editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && !isResizing) {
        handleComplete();
      }
    };

    // Pequeno delay para evitar trigger imediato
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizing]);

  const textStyle: React.CSSProperties = {
    color: textColor,
    fontFamily,
    fontSize: `${currentFontSize}px`,
    textAlign,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderlined ? 'underline' : 'none',
    lineHeight: '1.2',
    resize: 'none',
    userSelect: 'text',
    pointerEvents: 'auto'
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-[100] border-2 border-[#3F30F1] bg-black/95 backdrop-blur-sm rounded shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: 100,
        minHeight: 30
      }}
    >
      {/* Textarea para edição */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full bg-transparent border-none outline-none resize-none p-2 text-white placeholder-gray-400"
        style={textStyle}
        placeholder="Digite seu texto..."
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Handles de redimensionamento */}
      {[
        { corner: 'nw', className: 'top-0 left-0 cursor-nw-resize -translate-x-1 -translate-y-1' },
        { corner: 'ne', className: 'top-0 right-0 cursor-ne-resize translate-x-1 -translate-y-1' },
        { corner: 'sw', className: 'bottom-0 left-0 cursor-sw-resize -translate-x-1 translate-y-1' },
        { corner: 'se', className: 'bottom-0 right-0 cursor-se-resize translate-x-1 translate-y-1' }
      ].map(({ corner, className }) => (
        <div
          key={corner}
          className={`absolute w-3 h-3 bg-[#3F30F1] border border-white rounded-sm ${className}`}
          onMouseDown={(e) => handleResizeMouseDown(e, corner)}
        />
      ))}

      {/* Indicador de fonte */}
      <div className="absolute -top-8 left-0 bg-[#3F30F1] text-white px-2 py-1 rounded text-xs pointer-events-none">
        {Math.round(currentFontSize)}px
      </div>

      {/* Instruções */}
      <div className="absolute -bottom-8 left-0 text-xs text-gray-400 pointer-events-none whitespace-nowrap">
        Ctrl+Enter para confirmar • Esc para cancelar
      </div>
    </div>
  );
};