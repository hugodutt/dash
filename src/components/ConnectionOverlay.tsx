import React, { useEffect, useState } from 'react';
import { Card, FreeElement, Position } from '../types/dashboard';
import { getAnchorsForElement, findNearestAnchor } from '../utils/anchors';

interface ConnectionOverlayProps {
  cards: Card[];
  freeElements: FreeElement[];
  connectionMode: boolean;
  draggingConnection?: {
    fromElementId: string;
    fromElementType: 'card' | 'element';
    fromAnchorId: string;
    fromPosition: Position;
    currentPosition: Position;
    nearestAnchor?: {
      elementId: string;
      elementType: 'card' | 'element';
      anchorId: string;
      position: Position;
    };
  };
  hoveredAnchor?: {
    elementId: string;
    elementType: 'card' | 'element';
    anchorId: string;
    position: Position;
  };
  onAnchorHover: (anchor: { elementId: string; elementType: 'card' | 'element'; anchorId: string; position: Position } | undefined) => void;
  onAnchorMouseDown: (elementId: string, elementType: 'card' | 'element', anchorId: string, position: Position, event: React.MouseEvent) => void;
  onAnchorMouseUp: (elementId: string, elementType: 'card' | 'element', anchorId: string, position: Position) => void;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  cards,
  freeElements,
  connectionMode,
  draggingConnection,
  hoveredAnchor,
  onAnchorHover,
  onAnchorMouseDown,
  onAnchorMouseUp
}) => {
  if (!connectionMode) return null;

  // Combinar todos os elementos
  const allElements = [
    ...cards.map(card => ({
      id: card.id,
      position: card.position,
      width: card.width,
      height: card.height,
      type: card.type,
      elementType: 'card' as const
    })),
    ...freeElements
      .filter(el => el.type !== 'line' && el.type !== 'arrow' && el.type !== 'connector') // Não mostrar anchors em conectores
      .map(el => ({
        id: el.id,
        position: el.position,
        width: el.width,
        height: el.height,
        type: el.type,
        elementType: 'element' as const
      }))
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }}>
      {/* Anchors */}
      {allElements.map(element => {
        const anchors = getAnchorsForElement(element);
        
        return anchors.map(({ anchor, position }) => {
          const isHovered = hoveredAnchor?.elementId === element.id && 
                           hoveredAnchor?.anchorId === anchor.id;
          
          const isConnected = draggingConnection?.fromElementId === element.id &&
                             draggingConnection?.fromAnchorId === anchor.id;

          const isNearestTarget = draggingConnection?.nearestAnchor?.elementId === element.id &&
                                 draggingConnection?.nearestAnchor?.anchorId === anchor.id;
          
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
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAnchorMouseDown(element.id, element.elementType, anchor.id, position, e);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAnchorMouseUp(element.id, element.elementType, anchor.id, position);
              }}
            >
              {/* Área de clique maior (invisível) */}
              <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2" />
              
              {/* Anchor visual */}
              <div 
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-150
                  ${isConnected 
                    ? 'bg-[#3F30F1] border-white scale-150 shadow-lg' 
                    : isNearestTarget
                    ? 'bg-green-400 border-white scale-125 shadow-lg animate-pulse'
                    : isHovered 
                    ? 'bg-white border-[#3F30F1] scale-125 shadow-lg' 
                    : 'bg-[#3F30F1] border-white scale-100 opacity-75 hover:opacity-100'
                  }
                `}
              />
              
              {/* Tooltip no hover */}
              {(isHovered || isNearestTarget) && (
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap"
                  style={{ zIndex: 10002 }}
                >
                  {isNearestTarget ? 'Solte para conectar' : anchor.id}
                </div>
              )}
            </div>
          );
        });
      })}

      {/* Preview da linha durante o drag */}
      {draggingConnection && (
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 9999 }}
        >
          <line
            x1={draggingConnection.fromPosition.x}
            y1={draggingConnection.fromPosition.y}
            x2={draggingConnection.nearestAnchor?.position.x || draggingConnection.currentPosition.x}
            y2={draggingConnection.nearestAnchor?.position.y || draggingConnection.currentPosition.y}
            stroke={draggingConnection.nearestAnchor ? '#22C55E' : '#3F30F1'}
            strokeWidth="3"
            strokeDasharray="5,5"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Seta no final */}
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="10" 
              refY="3.5" 
              orient="auto"
            >
              <polygon 
                points="0 0, 10 3.5, 0 7" 
                fill={draggingConnection.nearestAnchor ? '#22C55E' : '#3F30F1'} 
              />
            </marker>
          </defs>
          
          <line
            x1={draggingConnection.fromPosition.x}
            y1={draggingConnection.fromPosition.y}
            x2={draggingConnection.nearestAnchor?.position.x || draggingConnection.currentPosition.x}
            y2={draggingConnection.nearestAnchor?.position.y || draggingConnection.currentPosition.y}
            stroke="transparent"
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}
      
      {/* Indicador de modo conexão */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#3F30F1] text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {draggingConnection ? 'Arraste para conectar' : 'Modo Conexão Ativo'}
          </span>
        </div>
        <div className="text-xs opacity-90 mt-1">
          {draggingConnection ? 'Solte em um anchor para criar conexão' : 'Clique e arraste entre anchors para conectar'}
        </div>
      </div>
    </div>
  );
};