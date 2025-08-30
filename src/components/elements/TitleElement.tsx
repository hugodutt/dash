import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGlobalKeys } from '../../hooks/useGlobalKeys';
import { X, Heading, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Hash } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TitleElement as TitleElementType } from '../../types/dashboard';

interface TitleElementProps {
  element: TitleElementType;
  onUpdate: (updates: Partial<TitleElementType>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onMouseDown: () => void;
  onSelect?: (elementId: string, elementType: 'text' | 'title') => void;
  searchTerm: string;
  isSelected?: boolean;
}

export function TitleElement({ element, onUpdate, onDelete, onBringToFront, onMouseDown, onSelect, searchTerm, isSelected = false }: TitleElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHoveringElement, setIsHoveringElement] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [tempContent, setTempContent] = useState(element.content);
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
    if (!isEditing && !isHoveringElement && !isHoveringControls) {
      setShowControls(false);
    }
  }, [isEditing, isHoveringElement, isHoveringControls]);

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
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
      
      const newWidth = Math.max(150, startSize.current.width + deltaX);
      
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
    if (target.closest('button, input, select, [data-text-content]')) return;
    
    // Verificar se a tecla Space está pressionada (modo pan)
    if (keyState.spacePressed) {
      // Permitir que o evento continue para o Canvas fazer pan
      return;
    }
    
    e.preventDefault();
    e.stopPropagation(); // Evitar que o Canvas capture este evento
    onMouseDown();
    
    if (onSelect) {
      onSelect(element.id, 'title');
    }
    
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
      width: element.width || 300, 
      height: element.height || 60 
    };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTempContent(element.content);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ content: tempContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempContent(element.content);
    } else if (e.key === 'Enter') {
      setIsEditing(false);
      onUpdate({ content: tempContent });
    }
  };

  const HeadingTag = `h${element.level}` as keyof JSX.IntrinsicElements;
  const shouldShowControls = showControls || isHoveringElement || isHoveringControls;
  const textAlign = element.textAlign || 'left';

  // Usar o fontSize definido pelo usuário ou o padrão baseado no nível
  const getCurrentFontSize = () => {
    if (element.fontSize) {
      return element.fontSize;
    }
    // Tamanhos padrão baseados no nível do heading
    const defaultSizes = {
      1: 48, // text-6xl
      2: 40, // text-5xl  
      3: 32, // text-4xl
      4: 24, // text-3xl
      5: 20, // text-2xl
      6: 18  // text-xl
    };
    return defaultSizes[element.level as keyof typeof defaultSizes] || 32;
  };

  const currentFontSize = getCurrentFontSize();

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
        minWidth: '200px',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setShowControls(true);
        setIsHoveringElement(true);
      }}
      onMouseLeave={() => {
        setIsHoveringElement(false);
        if (!isEditing && !isHoveringControls) {
          setShowControls(false);
        }
      }}
      animate={{
        scale: (isDragging || isResizing) ? 1.02 : 1
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* Controles de formatação */}
      {shouldShowControls && !isEditing && (
        <>
          {/* Área invisível que conecta o elemento aos controles */}
          <div 
            className="absolute -top-8 left-0 right-0 h-8 z-10"
            onMouseEnter={() => setIsHoveringControls(true)}
            onMouseLeave={() => {
              setIsHoveringControls(false);
              if (!isHoveringElement && !isEditing) {
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
              if (!isHoveringElement && !isEditing) {
                setShowControls(false);
              }
            }}
          >
          <Select value={element.level.toString()} onValueChange={(value) => onUpdate({ level: parseInt(value) as any })}>
            <SelectTrigger className="h-6 w-12 border-0 bg-white/10 text-white text-xs">
              <Hash className="h-3 w-3" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
              <SelectItem value="5">H5</SelectItem>
              <SelectItem value="6">H6</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ isBold: !element.isBold })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${element.isBold ? 'bg-white/20' : ''}`}
          >
            <Bold className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ isItalic: !element.isItalic })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${element.isItalic ? 'bg-white/20' : ''}`}
          >
            <Italic className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ isUnderlined: !element.isUnderlined })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${element.isUnderlined ? 'bg-white/20' : ''}`}
          >
            <Underline className="h-3 w-3" />
          </Button>

          <div className="w-px h-4 bg-white/20" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ textAlign: 'left' })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${textAlign === 'left' ? 'bg-white/20' : ''}`}
          >
            <AlignLeft className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ textAlign: 'center' })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${textAlign === 'center' ? 'bg-white/20' : ''}`}
          >
            <AlignCenter className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ textAlign: 'right' })}
            className={`h-6 w-6 p-0 hover:bg-white/20 ${textAlign === 'right' ? 'bg-white/20' : ''}`}
          >
            <AlignRight className="h-3 w-3" />
          </Button>

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

      {/* Conteúdo do título */}
      {isEditing ? (
        <Input
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Digite o título..."
          className={`
            bg-white/95 border-2 border-[#3F30F1] text-black 
            ${element.isBold ? 'font-bold' : 'font-semibold'}
            ${element.isItalic ? 'italic' : ''}
            ${element.isUnderlined ? 'underline' : ''}
            ${alignmentClasses[textAlign]}
          `}
          style={{ 
            width: element.width || 300,
            fontSize: `${currentFontSize}px`
          }}
          autoFocus
        />
      ) : (
        <HeadingTag
          className={`
            cursor-text px-3 py-2 rounded transition-all duration-200 border-2 border-transparent
            hover:border-white/30 hover:bg-white/5
            ${element.isBold ? 'font-bold' : 'font-semibold'}
            ${element.isItalic ? 'italic' : ''}
            ${element.isUnderlined ? 'underline' : ''}
            ${alignmentClasses[textAlign]}
          `}
          onDoubleClick={handleDoubleClick}
          data-text-content
          style={{ 
            margin: 0, 
            width: element.width || 'auto',
            color: element.textColor || '#FFFFFF',
            fontSize: `${currentFontSize}px`
          }}
        >
          {element.content || 'Duplo clique para editar título...'}
        </HeadingTag>
      )}

      {/* Handle de redimensionamento horizontal */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-8 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-60"
        onMouseDown={handleResizeMouseDown}
        style={{
          background: 'linear-gradient(90deg, transparent 30%, #3F30F1 30%, #3F30F1 70%, transparent 70%)'
        }}
      />
    </motion.div>
  );
}