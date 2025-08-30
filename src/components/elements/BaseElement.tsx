import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { BaseElement as BaseElementType } from '../../types/dashboard';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface BaseElementProps {
  element: BaseElementType;
  onUpdate: (updates: Partial<BaseElementType>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  editForm?: React.ReactNode;
  searchTerm: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enableResize?: boolean;
  resizeHandles?: {
    corner?: boolean;
    edges?: boolean;
  };
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const BaseElement: React.FC<BaseElementProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  isEditing = false,
  onEditingChange,
  editForm,
  searchTerm,
  children,
  className = '',
  style = {},
  enableResize = true,
  resizeHandles = { corner: true, edges: false },
  onSelect,
  isSelected = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startElementPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeType = useRef<'corner' | 'edge'>('corner');

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
      const deltaY = e.clientY - startPos.current.y;
      
      if (resizeType.current === 'corner') {
        const newWidth = Math.max(50, startSize.current.width + deltaX);
        const newHeight = Math.max(50, startSize.current.height + deltaY);
        
        onUpdate({
          width: newWidth,
          height: newHeight
        });
      }
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
    if (target.closest('button, input, textarea, select, [data-no-drag]')) return;
    
    e.preventDefault();
    onBringToFront();
    
    if (onSelect) {
      onSelect(element.id);
    }
    
    isDraggingRef.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startElementPos.current = { x: element.position.x, y: element.position.y };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, type: 'corner' | 'edge' = 'corner') => {
    e.preventDefault();
    e.stopPropagation();
    onBringToFront();
    
    isResizingRef.current = true;
    resizeType.current = type;
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { 
      width: element.width || 200, 
      height: element.height || 100 
    };
    
    document.addEventListener('mousemove', handleMouseMove.current);
    document.addEventListener('mouseup', handleMouseUp.current);
  };

  // Sincronizar estado interno com prop externa
  useEffect(() => {
    setShowEditForm(isEditing);
  }, [isEditing]);

  const handleOpenChange = (open: boolean) => {
    setShowEditForm(open);
    if (onEditingChange) {
      onEditingChange(open);
    }
  };

  const isHighlighted = searchTerm && (
    (element.type === 'sticky' && 'content' in element && element.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (element.type === 'code-block' && 'content' in element && element.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (element.type === 'terminal-block' && 'lines' in element && element.lines.some(line => line.content.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <>
      <motion.div
        ref={dragRef}
        className={`absolute select-none group ${
          (isDragging || isResizing) ? 'cursor-grabbing' : 'cursor-grab'
        } ${isHighlighted ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''} ${className}`}
        style={{
          left: element.position.x,
          top: element.position.y,
          zIndex: element.zIndex,
          width: element.width || 'auto',
          height: element.height || 'auto',
          userSelect: 'none',
          ...style
        }}
        onMouseDown={handleMouseDown}
        animate={{
          scale: (isDragging || isResizing) ? 1.02 : 1
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {children}

        {/* Edit button - aparece no hover */}
        {editForm && (
          <div className="absolute -top-8 -right-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Popover open={showEditForm} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <button
                  className="bg-[#3F30F1] hover:bg-[#3F30F1]/90 text-white rounded-full p-1 shadow-lg transition-colors"
                  data-no-drag
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </PopoverTrigger>
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

        {/* Resize handles */}
        {enableResize && resizeHandles.corner && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-60"
            onMouseDown={(e) => handleResizeMouseDown(e, 'corner')}
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, #3F30F1 30%, #3F30F1 40%, transparent 40%, transparent 60%, #3F30F1 60%, #3F30F1 70%, transparent 70%)'
            }}
            data-no-drag
          />
        )}
      </motion.div>


    </>
  );
};