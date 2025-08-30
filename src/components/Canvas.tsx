import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useViewport } from '../hooks/useViewport';
import { useGlobalKeys } from '../hooks/useGlobalKeys';
import { ZoomControls } from './ZoomControls';
import { TaskCard } from './cards/TaskCard';
import { ChecklistCard } from './cards/ChecklistCard';
import { NoteCard } from './cards/NoteCard';
import { ImageCard } from './cards/ImageCard';
import { TableCard } from './cards/TableCard';
import { EisenhowerCard } from './cards/EisenhowerCard';
import { TextElement } from './elements/TextElement';
import { TitleElement } from './elements/TitleElement';
import { CheckboxElement } from './elements/CheckboxElement';
import { RectangleElementComponent } from './elements/RectangleElement';
import { CircleElementComponent } from './elements/CircleElement';
import { LineElementComponent } from './elements/LineElement';
import { ArrowElementComponent } from './elements/ArrowElement';
import { ConnectorElementComponent } from './elements/ConnectorElement';
import { StickyElementComponent } from './elements/StickyElement';
import { ConnectionOverlay } from './ConnectionOverlay';

import { TextToolbar } from './TextToolbar';
import { ShapesSidebar } from './ShapesSidebar';
import { TechnicalSidebar } from './TechnicalSidebar';
import { CheckboxSidebar } from './CheckboxSidebar';
import { ProgressElementComponent } from './elements/ProgressElement';
import { CodeBlockElementComponent } from './elements/CodeBlockElement';
import { TerminalBlockElementComponent } from './elements/TerminalBlockElement';
import { Card, FreeElement, TaskCard as TaskCardType, ChecklistCard as ChecklistCardType, NoteCard as NoteCardType, ImageCard as ImageCardType, TableCard as TableCardType, EisenhowerCard as EisenhowerCardType, TextElement as TextElementType, TitleElement as TitleElementType, CheckboxElement as CheckboxElementType, RectangleElement, CircleElement, LineElement, ArrowElement, ConnectorElement, StickyElement, ProgressElement, CodeBlockElement, TerminalBlockElement } from '../types/dashboard';

interface CanvasProps {
  cards: Card[];
  freeElements: FreeElement[];
  filteredCards: Card[];
  onUpdateCard: (id: string, updates: Partial<Card>) => void;
  onDeleteCard: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdateFreeElement: (id: string, updates: Partial<FreeElement>) => void;
  onDeleteFreeElement: (id: string) => void;
  onBringElementToFront: (id: string) => void;
  onCreateNote: (x: number, y: number) => void;
  searchTerm: string;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
  connectionMode: boolean;
  panMode: boolean;
  drawingMode?: 'line' | 'arrow' | null;
  onCancelDrawing?: () => void;
  onCreateDrawing?: (type: 'line' | 'arrow', startPos: { x: number; y: number }, endPos: { x: number; y: number }, style: any) => void;
  draggingConnection?: {
    fromElementId: string;
    fromElementType: 'card' | 'element';
    fromAnchorId: string;
    fromPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
    nearestAnchor?: {
      elementId: string;
      elementType: 'card' | 'element';
      anchorId: string;
      position: { x: number; y: number };
    };
  };
  hoveredAnchor?: {
    elementId: string;
    elementType: 'card' | 'element';
    anchorId: string;
    position: { x: number; y: number };
  };
  onStartDraggingConnection: (elementId: string, elementType: 'card' | 'element', anchorId: string, position: { x: number; y: number }) => void;
  onUpdateDraggingConnection: (position: { x: number; y: number }) => void;
  onCompleteDraggingConnection: (endElementId?: string, endElementType?: 'card' | 'element', endAnchorId?: string) => void;
  onCancelDraggingConnection: () => void;
  onSetHoveredAnchor: (anchor: { elementId: string; elementType: 'card' | 'element'; anchorId: string; position: { x: number; y: number } } | undefined) => void;

  selectedElement?: {
    id: string;
    type: 'text' | 'title' | 'checkbox' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress' | 'code-block' | 'terminal-block' | 'task' | 'checklist' | 'note' | 'image' | 'table' | 'habit-tracker' | 'weekly-review' | 'eisenhower';
    category: 'text' | 'shapes' | 'technical' | 'cards' | 'other';
  };
  showTechnicalSidebar?: boolean;
  onCreateTextFromSidebar: (text: string, style: any, type: 'text' | 'title') => void;
  onCreateShapeFromSidebar: (type: 'rectangle' | 'circle' | 'line' | 'arrow', style: any) => void;
  onUpdateTechnicalElement?: (elementId: string, updates: any) => void;
  onCreateCheckboxFromSidebar: (style: any) => void;
  onSelectElement: (elementId: string, elementType: 'text' | 'title' | 'checkbox' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress' | 'code-block' | 'terminal-block' | 'task' | 'checklist' | 'note' | 'image' | 'table' | 'habit-tracker' | 'weekly-review' | 'eisenhower') => void;
  onDeselectElement: () => void;
  onUpdateSelectedElementStyle: (style: any) => void;
}

export const Canvas = forwardRef<{ getViewportCenter: () => { x: number; y: number } }, CanvasProps>(function Canvas({
  cards,
  freeElements,
  filteredCards,
  onUpdateCard,
  onDeleteCard,
  onBringToFront,
  onUpdateFreeElement,
  onDeleteFreeElement,
  onBringElementToFront,
  onCreateNote,
  searchTerm,
  availableLabels,
  onCreateLabel,
  connectionMode,
  panMode,
  drawingMode,
  onCancelDrawing,
  onCreateDrawing,
  draggingConnection,
  hoveredAnchor,
  onStartDraggingConnection,
  onUpdateDraggingConnection,
  onCompleteDraggingConnection,
  onCancelDraggingConnection,
  onSetHoveredAnchor,
  selectedElement,
  onCreateTextFromSidebar,
  onCreateShapeFromSidebar,
  onUpdateTechnicalElement,
  onCreateCheckboxFromSidebar,
  onSelectElement,
  onDeselectElement,
  onUpdateSelectedElementStyle,
  showTechnicalSidebar
}: CanvasProps, ref) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const keyState = useGlobalKeys();
  
  // Estado interno para desenho
  const [drawingState, setDrawingState] = useState<{
    isDrawing: boolean;
    startPos: { x: number; y: number } | null;
    currentPos: { x: number; y: number } | null;
    type: 'line' | 'arrow' | null;
  }>({
    isDrawing: false,
    startPos: null,
    currentPos: null,
    type: null
  });

  const {
    viewport,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    screenToWorld,
    worldToScreen,
    startPanning,
    updatePanning,
    stopPanning,
    isPanning,
    getViewportCenter
  } = useViewport();

  // Expor a função getViewportCenter através da ref
  useImperativeHandle(ref, () => ({
    getViewportCenter
  }), [getViewportCenter]);

  // Event listener para a tecla DELETE e ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cancelar desenho com ESC
      if (e.key === 'Escape' && drawingMode) {
        setDrawingState({
          isDrawing: false,
          startPos: null,
          currentPos: null,
          type: null
        });
        if (onCancelDrawing) {
          onCancelDrawing();
        }
        return;
      }

      // Verificar se a tecla DELETE foi pressionada
      if (e.key === 'Delete') {
        // Verificar se o usuário está editando um campo de texto ou interagindo com componentes de UI
        const activeElement = document.activeElement;
        const isEditingText = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.hasAttribute('contenteditable') ||
          activeElement.closest('[contenteditable]') ||
          activeElement.closest('input') ||
          activeElement.closest('textarea') ||
          activeElement.closest('select') ||
          activeElement.closest('[role="combobox"]') ||
          activeElement.closest('[role="textbox"]') ||
          activeElement.closest('.text-toolbar') ||
          activeElement.closest('.sidebar') ||
          activeElement.closest('.technical-sidebar')
        );

        // Se estiver editando texto, não processar a exclusão
        if (isEditingText) {
          return;
        }

        // Só processar exclusão se há um elemento selecionado e não está editando texto
        if (selectedElement) {
          e.preventDefault();
          
          // Verificar se o elemento selecionado é um card ou um elemento livre
          const isCard = cards.some(card => card.id === selectedElement.id);
          const isFreeElement = freeElements.some(element => element.id === selectedElement.id);
          
          if (isCard) {
            // Deletar card
            onDeleteCard(selectedElement.id);
          } else if (isFreeElement) {
            // Deletar elemento livre  
            onDeleteFreeElement(selectedElement.id);
          }
          
          // Desselecionar o elemento após exclusão
          onDeselectElement();
        }
      }
    };

    // Adicionar event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup - remover event listener quando o componente for desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, cards, freeElements, onDeleteCard, onDeleteFreeElement, onDeselectElement, drawingMode, onCancelDrawing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (connectionMode || panMode) {
      onCancelDraggingConnection();
      return;
    }

    if (e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = screenToWorld(screenX, screenY);
        onCreateNote(worldPos.x, worldPos.y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      updatePanning(e.clientX, e.clientY);
      return;
    }

    if (draggingConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = screenToWorld(screenX, screenY);
        onUpdateDraggingConnection(worldPos);
      }
    }

    // Atualizar posição atual durante o desenho
    if (drawingState.isDrawing && drawingState.startPos) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = screenToWorld(screenX, screenY);
        setDrawingState(prev => ({
          ...prev,
          currentPos: worldPos
        }));
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      stopPanning();
      return;
    }

    if (draggingConnection) {
      onCompleteDraggingConnection();
    }
  };

    const handleMouseDown = (e: React.MouseEvent) => {
    // Pan mode: ativado por modo pan, tecla space, ou botão do meio do mouse
    // Só ativar pan se clicar diretamente no canvas (e.target === e.currentTarget)
    if (panMode || keyState.spacePressed || e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      startPanning(e.clientX, e.clientY);
      return;
    }
  };

  const handleAnchorMouseDown = (elementId: string, elementType: 'card' | 'element', anchorId: string, position: { x: number; y: number }, event: React.MouseEvent) => {
    if (connectionMode && !draggingConnection) {
      event.preventDefault();
      event.stopPropagation();
      onStartDraggingConnection(elementId, elementType, anchorId, position);
    }
  };

  const handleAnchorMouseUp = (elementId: string, elementType: 'card' | 'element', anchorId: string, position: { x: number; y: number }) => {
    if (connectionMode && draggingConnection) {
      onCompleteDraggingConnection(elementId, elementType, anchorId);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Se estiver no modo de desenho, processar o clique para desenho
    if (drawingMode && e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = screenToWorld(screenX, screenY);
        
        if (!drawingState.isDrawing) {
          // Primeiro clique - iniciar desenho
          console.log('Iniciando desenho:', drawingMode, worldPos);
          setDrawingState({
            isDrawing: true,
            startPos: worldPos,
            currentPos: worldPos,
            type: drawingMode
          });
        } else {
          // Segundo clique - finalizar desenho
          console.log('Finalizando desenho:', drawingState.startPos, worldPos);
          if (onCreateDrawing && drawingState.startPos) {
            onCreateDrawing(drawingMode, drawingState.startPos, worldPos, {
              strokeColor: '#3F30F1',
              strokeWidth: 2,
              style: 'solid',
              opacity: 1
            });
          }
          setDrawingState({
            isDrawing: false,
            startPos: null,
            currentPos: null,
            type: null
          });
          if (onCancelDrawing) {
            onCancelDrawing();
          }
        }
      }
      return;
    }

    // Desselecionar elemento se clicar no canvas
    if (e.target === e.currentTarget && selectedElement) {
      onDeselectElement();
    }
  };

  const renderCard = (card: Card) => {
    const isFiltered = searchTerm && !filteredCards.includes(card);
    const commonProps = {
      onUpdate: (updates: Partial<Card>) => onUpdateCard(card.id, updates),
      onDelete: () => onDeleteCard(card.id),
      onBringToFront: (id: string) => onBringToFront(id),
      searchTerm,
      availableLabels,
      onCreateLabel
    };

    const handleCardClick = () => {
      if (!connectionMode) {
        onBringToFront(card.id);
        // Selecionar o card para poder deletá-lo com DELETE
        onSelectElement(card.id, card.type);
      }
    };

    switch (card.type) {
      case 'task':
        return <TaskCard key={card.id} card={card as TaskCardType} onMouseDown={handleCardClick} isFiltered={isFiltered} {...commonProps} />;
      case 'checklist':
        return <ChecklistCard key={card.id} card={card as ChecklistCardType} onMouseDown={handleCardClick} isFiltered={isFiltered} {...commonProps} />;
      case 'note':
        return <NoteCard key={card.id} card={card as NoteCardType} onMouseDown={handleCardClick} isFiltered={isFiltered} {...commonProps} />;
      case 'image':
        return <ImageCard key={card.id} card={card as ImageCardType} onMouseDown={handleCardClick} isFiltered={isFiltered} {...commonProps} />;
      case 'table':
        return <TableCard key={card.id} card={card as TableCardType} onUpdate={(updates) => onUpdateCard(card.id, updates)} onDelete={() => onDeleteCard(card.id)} onBringToFront={() => onBringToFront(card.id)} onMouseDown={handleCardClick} isFiltered={isFiltered} searchTerm={searchTerm} availableLabels={availableLabels} onCreateLabel={onCreateLabel} />;
      case 'eisenhower':
        return <EisenhowerCard key={card.id} card={card as EisenhowerCardType} allCards={cards.filter(c => c.type === 'task') as TaskCardType[]} onUpdate={(updates) => onUpdateCard(card.id, updates)} onUpdateTaskCard={(taskId, updates) => onUpdateCard(taskId, updates)} onDelete={() => onDeleteCard(card.id)} onBringToFront={() => onBringToFront(card.id)} onMouseDown={handleCardClick} searchTerm={searchTerm} />;
      default:
        return null;
    }
  };

  const renderFreeElement = (element: FreeElement) => {
    const commonProps = {
      onUpdate: (updates: Partial<FreeElement>) => onUpdateFreeElement(element.id, updates),
      onDelete: () => onDeleteFreeElement(element.id),
      onBringToFront: () => onBringElementToFront(element.id),
      searchTerm
    };

    switch (element.type) {
      case 'text':
        return (
          <TextElement 
            key={element.id} 
            element={element as TextElementType} 
            onMouseDown={() => onBringElementToFront(element.id)}
            onSelect={(elementId) => onSelectElement(elementId, 'text')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'title':
        return (
          <TitleElement 
            key={element.id} 
            element={element as TitleElementType} 
            onMouseDown={() => onBringElementToFront(element.id)}
            onSelect={(elementId) => onSelectElement(elementId, 'title')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'checkbox':
        return (
          <CheckboxElement 
            key={element.id} 
            element={element as CheckboxElementType} 
            onMouseDown={() => onBringElementToFront(element.id)}
            onSelect={(elementId) => onSelectElement(elementId, 'checkbox')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'rectangle':
        return (
          <RectangleElementComponent 
            key={element.id} 
            element={element as RectangleElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'rectangle')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'circle':
        return (
          <CircleElementComponent 
            key={element.id} 
            element={element as CircleElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'circle')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'line':
        return (
          <LineElementComponent 
            key={element.id} 
            element={element as LineElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'line')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'arrow':
        return (
          <ArrowElementComponent 
            key={element.id} 
            element={element as ArrowElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'arrow')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'connector':
        return <ConnectorElementComponent key={element.id} element={element as ConnectorElement} allCards={cards} allElements={freeElements} {...commonProps} />;
      case 'sticky':
        return (
          <StickyElementComponent 
            key={element.id} 
            element={element as StickyElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'sticky')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'progress':
        return (
          <ProgressElementComponent 
            key={element.id} 
            element={element as ProgressElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'progress')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'code-block':
        return (
          <CodeBlockElementComponent 
            key={element.id} 
            element={element as CodeBlockElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'code-block')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      case 'terminal-block':
        return (
          <TerminalBlockElementComponent 
            key={element.id} 
            element={element as TerminalBlockElement} 
            onSelect={(elementId) => onSelectElement(elementId, 'terminal-block')}
            isSelected={selectedElement?.id === element.id}
            {...commonProps} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`fixed top-16 left-0 right-0 bottom-0 overflow-hidden ${
        drawingMode ? 'cursor-crosshair' :
        connectionMode ? 'cursor-crosshair' : 
        (panMode || keyState.spacePressed) ? 'cursor-grab' : 
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundColor: '#101113'
      }}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
    >
      {/* Canvas infinito com transformações */}
      <div 
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`
        }}
      >
        {/* Background infinito da grade */}
        <div 
          className="absolute inset-0"
          style={{
            width: '10000px',
            height: '10000px',
            left: '-5000px',
            top: '-5000px',
            backgroundImage: viewport.zoom >= 0.3 ? `
              radial-gradient(circle at ${16 / viewport.zoom}px ${16 / viewport.zoom}px, rgba(255,255,255,0.05) 1px, transparent 0),
              radial-gradient(circle at ${16 / viewport.zoom}px ${16 / viewport.zoom}px, rgba(255,255,255,0.05) 1px, transparent 0)
            ` : 'none',
            backgroundSize: viewport.zoom >= 0.3 ? `${32 / viewport.zoom}px ${32 / viewport.zoom}px` : 'auto',
            backgroundPosition: viewport.zoom >= 0.3 ? `0 0, ${16 / viewport.zoom}px ${16 / viewport.zoom}px` : '0 0',
            backgroundRepeat: 'repeat'
          }}
        />
        
        {/* Container interno para posicionamento dos elementos - canvas verdadeiramente infinito */}
        <div 
          className="relative" 
          style={{ 
            minWidth: '100vw', 
            minHeight: '100vh'
          }}
        >
          {/* Cards */}
          {cards.map(renderCard)}

          {/* Free Elements */}
          {freeElements.map(renderFreeElement)}

          {/* Connection Overlay */}
          <ConnectionOverlay
            cards={cards}
            freeElements={freeElements}
            connectionMode={connectionMode}
            draggingConnection={draggingConnection}
            hoveredAnchor={hoveredAnchor}
            onAnchorHover={onSetHoveredAnchor}
            onAnchorMouseDown={handleAnchorMouseDown}
            onAnchorMouseUp={handleAnchorMouseUp}
          />

        </div>
      </div>

      {/* Drawing Preview - fora do container transformado */}
      {drawingState.isDrawing && drawingState.startPos && drawingState.currentPos && (
        console.log('Renderizando preview:', drawingState),
        <svg
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000
          }}
        >
          {drawingState.type === 'line' && (
            <line
              x1={drawingState.startPos.x * viewport.zoom + viewport.panX}
              y1={drawingState.startPos.y * viewport.zoom + viewport.panY}
              x2={drawingState.currentPos.x * viewport.zoom + viewport.panX}
              y2={drawingState.currentPos.y * viewport.zoom + viewport.panY}
              stroke="#3F30F1"
              strokeWidth={2 * viewport.zoom}
              strokeDasharray="5,5"
              strokeLinecap="round"
            />
          )}
          {drawingState.type === 'arrow' && (
            <>
              <line
                x1={drawingState.startPos.x * viewport.zoom + viewport.panX}
                y1={drawingState.startPos.y * viewport.zoom + viewport.panY}
                x2={drawingState.currentPos.x * viewport.zoom + viewport.panX}
                y2={drawingState.currentPos.y * viewport.zoom + viewport.panY}
                stroke="#3F30F1"
                strokeWidth={2 * viewport.zoom}
                strokeDasharray="5,5"
                strokeLinecap="round"
              />
              {/* Seta da seta */}
              <polygon
                points={`${drawingState.currentPos.x * viewport.zoom + viewport.panX},${drawingState.currentPos.y * viewport.zoom + viewport.panY} ${(drawingState.currentPos.x - 10) * viewport.zoom + viewport.panX},${(drawingState.currentPos.y - 5) * viewport.zoom + viewport.panY} ${(drawingState.currentPos.x - 10) * viewport.zoom + viewport.panX},${(drawingState.currentPos.y + 5) * viewport.zoom + viewport.panY}`}
                fill="#3F30F1"
              />
            </>
          )}
        </svg>
      )}

      {/* Text Sidebar - aparece quando elemento de texto está selecionado */}
      <TextToolbar
        isVisible={selectedElement?.category === 'text'}
        selectedElementId={selectedElement?.id}
        elementType={selectedElement?.type as 'text' | 'title'}
        textStyle={(() => {
          const element = freeElements.find(e => e.id === selectedElement?.id) as any;
          return element ? {
            color: element.textColor || '#FFFFFF',
            fontFamily: element.fontFamily || 'Inter',
            fontSize: element.fontSize || 16,
            textAlign: element.textAlign || 'left',
            isBold: element.isBold || false,
            isItalic: element.isItalic || false,
            isUnderlined: element.isUnderlined || false,
            opacity: element.opacity || 1,
            content: element.content || ''
          } : {
            color: '#FFFFFF',
            fontFamily: 'Inter',
            fontSize: 16,
            textAlign: 'left' as const,
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            opacity: 1,
            content: ''
          };
        })()}
        onStyleChange={(style) => {
          // Mapear para as propriedades corretas do elemento
          const mappedStyle: any = {};
          if (style.color !== undefined) mappedStyle.textColor = style.color;
          if (style.fontFamily !== undefined) mappedStyle.fontFamily = style.fontFamily;
          if (style.fontSize !== undefined) mappedStyle.fontSize = style.fontSize;
          if (style.textAlign !== undefined) mappedStyle.textAlign = style.textAlign;
          if (style.isBold !== undefined) mappedStyle.isBold = style.isBold;
          if (style.isItalic !== undefined) mappedStyle.isItalic = style.isItalic;
          if (style.isUnderlined !== undefined) mappedStyle.isUnderlined = style.isUnderlined;
          if (style.opacity !== undefined) mappedStyle.opacity = style.opacity;
          if (style.content !== undefined) mappedStyle.content = style.content;
          
          onUpdateSelectedElementStyle(mappedStyle);
        }}
        onCreateText={undefined}
        onDuplicate={() => {
          if (selectedElement) {
            const element = freeElements.find(e => e.id === selectedElement.id);
            if (element) {
              const newElement = {
                ...element,
                id: `${element.type}-${Date.now()}`,
                position: {
                  x: element.position.x + 20,
                  y: element.position.y + 20
                }
              };
              // Aqui você precisaria chamar uma função para adicionar o elemento duplicado
            }
          }
        }}
        onDelete={() => {
          if (selectedElement) {
            onDeleteFreeElement(selectedElement.id);
            onDeselectElement();
          }
        }}
      />

      {/* Shapes Sidebar - aparece quando shape está selecionado */}
      <ShapesSidebar
        isVisible={selectedElement?.category === 'shapes'}
        selectedElementId={selectedElement?.category === 'shapes' ? selectedElement.id : undefined}
        elementType={selectedElement?.type as 'rectangle' | 'circle' | 'line' | 'arrow'}
        shapeStyle={
          selectedElement && selectedElement.category === 'shapes'
            ? (() => {
                const element = freeElements.find(e => e.id === selectedElement.id) as any;
                return element ? {
                  fillColor: element.fillColor || '#3F30F1',
                  strokeColor: element.strokeColor || '#FFFFFF',
                  strokeWidth: element.strokeWidth || 2,
                  borderRadius: element.borderRadius || 8,
                  opacity: element.opacity || 1,
                  style: element.style || 'solid'
                } : {
                  fillColor: '#3F30F1',
                  strokeColor: '#FFFFFF',
                  strokeWidth: 2,
                  borderRadius: 8,
                  opacity: 1,
                  style: 'solid' as const
                };
              })()
            : {
                fillColor: '#3F30F1',
                strokeColor: '#FFFFFF',
                strokeWidth: 2,
                borderRadius: 8,
                opacity: 1,
                style: 'solid' as const
              }
        }
        onStyleChange={(style) => {
          if (selectedElement && selectedElement.category === 'shapes') {
            onUpdateSelectedElementStyle(style);
          }
        }}
        onCreateShape={(type, style) => {
          onCreateShapeFromSidebar(type, style);
        }}
        onDuplicate={() => {
          if (selectedElement) {
            const element = freeElements.find(e => e.id === selectedElement.id);
            if (element) {
              const newElement = {
                ...element,
                id: `${element.type}-${Date.now()}`,
                position: {
                  x: element.position.x + 20,
                  y: element.position.y + 20
                }
              };
              // Aqui você precisaria chamar uma função para adicionar o elemento duplicado
            }
          }
        }}
        onDelete={() => {
          if (selectedElement) {
            onDeleteFreeElement(selectedElement.id);
            onDeselectElement();
          }
        }}
      />

      {/* Technical Sidebar - aparece quando elemento técnico está selecionado */}
      <TechnicalSidebar
        isVisible={selectedElement?.category === 'technical'}
        selectedElementId={selectedElement?.category === 'technical' ? selectedElement.id : undefined}
        elementType={selectedElement?.type as 'code-block' | 'terminal-block'}
        technicalStyle={
          selectedElement && selectedElement.category === 'technical'
            ? (() => {
                const element = freeElements.find(e => e.id === selectedElement.id) as any;
                return element ? {
                  content: element.content,
                  language: element.language,
                  theme: element.theme,
                  showLineNumbers: element.showLineNumbers,
                  fontSize: element.fontSize,
                  lines: element.lines,
                  prompt: element.prompt
                } : {
                  content: '// Exemplo de código\nconsole.log("Hello, World!");',
                  language: 'javascript',
                  theme: 'dark' as const,
                  showLineNumbers: true,
                  fontSize: 14
                };
              })()
            : {
                content: '// Exemplo de código\nconsole.log("Hello, World!");',
                language: 'javascript',
                theme: 'dark' as const,
                showLineNumbers: true,
                fontSize: 14
              }
        }
        onStyleChange={(style) => {
          if (selectedElement && selectedElement.category === 'technical') {
            onUpdateSelectedElementStyle(style);
          }
        }}
        onDuplicate={() => {
          if (selectedElement) {
            const element = freeElements.find(e => e.id === selectedElement.id);
            if (element) {
              const newElement = {
                ...element,
                id: `${element.type}-${Date.now()}`,
                position: {
                  x: element.position.x + 20,
                  y: element.position.y + 20
                }
              };
              // Aqui você precisaria chamar uma função para adicionar o elemento duplicado
            }
          }
        }}
        onDelete={() => {
          if (selectedElement) {
            onDeleteFreeElement(selectedElement.id);
            onDeselectElement();
          }
        }}
      />

      {/* Zoom Controls */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={fitToScreen}
        currentZoom={viewport.zoom}
      />
    </div>
  );
});