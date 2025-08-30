import React from 'react';
import { Card, FreeElement, Position } from '../types/dashboard';
import { getAnchorsForElement } from '../utils/anchors';

interface AnchorOverlayProps {
  cards: Card[];
  freeElements: FreeElement[];
  connectionMode: boolean;
  hoveredAnchor?: {
    elementId: string;
    elementType: 'card' | 'element';
    anchorId: string;
    position: Position;
  };
  onAnchorHover: (anchor: { elementId: string; elementType: 'card' | 'element'; anchorId: string; position: Position } | undefined) => void;
  onAnchorClick: (elementId: string, elementType: 'card' | 'element', anchorId: string, position: Position) => void;
}

export const AnchorOverlay: React.FC<AnchorOverlayProps> = ({
  cards,
  freeElements,
  connectionMode,
  hoveredAnchor,
  onAnchorHover,
  onAnchorClick
}) => {
  if (!connectionMode) return null;

  // Combinar todos os elementos
  const allElements = [
    ...cards.map(card => ({
      id: card.id,
      position: card.position,
      width: card.width || 300,
      height: card.height || 200,
      type: card.type,
      elementType: 'card' as const
    })),
    ...freeElements
      .filter(el => el.type !== 'line' && el.type !== 'arrow' && el.type !== 'connector') // Não mostrar anchors em conectores
      .map(el => ({
        id: el.id,
        position: el.position,
        width: el.width || 200,
        height: el.height || 100,
        type: el.type,
        elementType: 'element' as const
      }))
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
      {allElements.map(element => {
        const anchors = getAnchorsForElement(element);
        
        return anchors.map(({ anchor, position }) => {
          const isHovered = hoveredAnchor?.elementId === element.id && 
                           hoveredAnchor?.anchorId === anchor.id;
          
          return (
            <div
              key={`${element.id}-${anchor.id}`}
              className="absolute pointer-events-auto cursor-crosshair transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: position.x,
                top: position.y,
                zIndex: 10001
              }}
              onMouseEnter={() => onAnchorHover({
                elementId: element.id,
                elementType: element.elementType,
                anchorId: anchor.id,
                position
              })}
              onMouseLeave={() => onAnchorHover(undefined)}
              onClick={(e) => {
                e.stopPropagation();
                onAnchorClick(element.id, element.elementType, anchor.id, position);
              }}
            >
              {/* Área de clique maior (invisível) */}
              <div className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2" />
              
              {/* Anchor visual */}
              <div 
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-150
                  ${isHovered 
                    ? 'bg-white border-[#3F30F1] scale-125 shadow-lg' 
                    : 'bg-[#3F30F1] border-white scale-100 opacity-75 hover:opacity-100'
                  }
                `}
              />
              
              {/* Tooltip no hover */}
              {isHovered && (
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap"
                  style={{ zIndex: 10002 }}
                >
                  {anchor.id}
                </div>
              )}
            </div>
          );
        });
      })}
      
      {/* Indicador de modo conexão */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#3F30F1] text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Modo Conexão Ativo</span>
        </div>
        <div className="text-xs opacity-90 mt-1">
          Clique em um anchor para conectar elementos
        </div>
      </div>
    </div>
  );
};