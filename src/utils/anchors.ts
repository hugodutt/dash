import { Position, Anchor } from '../types/dashboard';

// Obter dimensões padrão baseado no tipo do elemento
const getDefaultDimensions = (elementType: string): { width: number; height: number } => {
  switch (elementType) {
    case 'task':
    case 'checklist':
    case 'note':
    case 'image':
    case 'table':
      return { width: 300, height: 200 };
    case 'habit-tracker':
    case 'weekly-review':
    case 'eisenhower':
      return { width: 400, height: 300 };
    case 'rectangle':
    case 'sticky':
      return { width: 200, height: 100 };
    case 'circle':
      return { width: 100, height: 100 };
    case 'text':
    case 'checkbox':
      return { width: 200, height: 50 };
    case 'title':
      return { width: 300, height: 60 };
    case 'progress':
      return { width: 250, height: 80 };
    case 'code-block':
    case 'terminal-block':
      return { width: 400, height: 300 };
    default:
      return { width: 200, height: 100 };
  }
};

// Definição de anchors padrão para qualquer shape
export const createStandardAnchors = (): Anchor[] => [
  // Meios das bordas (principais)
  {
    id: 'top',
    resolve: (shape) => {
      const defaultDims = getDefaultDimensions(shape.type || 'rectangle');
      const width = shape.width || defaultDims.width;
      return {
        x: shape.position.x + width / 2,
        y: shape.position.y
      };
    }
  },
  {
    id: 'right',
    resolve: (shape) => {
      const defaultDims = getDefaultDimensions(shape.type || 'rectangle');
      const width = shape.width || defaultDims.width;
      const height = shape.height || defaultDims.height;
      return {
        x: shape.position.x + width,
        y: shape.position.y + height / 2
      };
    }
  },
  {
    id: 'bottom',
    resolve: (shape) => {
      const defaultDims = getDefaultDimensions(shape.type || 'rectangle');
      const width = shape.width || defaultDims.width;
      const height = shape.height || defaultDims.height;
      return {
        x: shape.position.x + width / 2,
        y: shape.position.y + height
      };
    }
  },
  {
    id: 'left',
    resolve: (shape) => {
      const defaultDims = getDefaultDimensions(shape.type || 'rectangle');
      const height = shape.height || defaultDims.height;
      return {
        x: shape.position.x,
        y: shape.position.y + height / 2
      };
    }
  }
];

// Obter anchors para um elemento específico
export const getAnchorsForElement = (element: { id: string; position: Position; width?: number; height?: number; type?: string }): Array<{ anchor: Anchor; position: Position }> => {
  const anchors = createStandardAnchors();
  return anchors.map(anchor => ({
    anchor,
    position: anchor.resolve({ ...element, type: element.type || 'rectangle' })
  }));
};

// Encontrar o anchor mais próximo de uma posição
export const findNearestAnchor = (
  position: Position,
  excludeElementId: string,
  elements: Array<{ id: string; position: Position; width?: number; height?: number; type?: string }>,
  snapRadius = 20
): { elementId: string; anchorId: string; position: Position } | null => {
  let nearest = null;
  let minDistance = snapRadius;

  for (const element of elements) {
    if (element.id === excludeElementId) continue; // Não conectar no mesmo elemento

    const anchors = getAnchorsForElement(element);
    for (const { anchor, position: anchorPos } of anchors) {
      const distance = Math.sqrt(
        Math.pow(position.x - anchorPos.x, 2) + Math.pow(position.y - anchorPos.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          elementId: element.id,
          anchorId: anchor.id,
          position: anchorPos
        };
      }
    }
  }

  return nearest;
};

// Obter posição de um anchor específico
export const getAnchorPosition = (
  elementId: string,
  anchorId: string,
  elements: Array<{ id: string; position: Position; width?: number; height?: number; type?: string }>
): Position | null => {
  const element = elements.find(e => e.id === elementId);
  if (!element) return null;

  const anchors = createStandardAnchors();
  const anchor = anchors.find(a => a.id === anchorId);
  if (!anchor) return null;

  return anchor.resolve({ ...element, type: element.type || 'rectangle' });
};

// Calcular ponto em uma borda (para modo 'side')
export const getSidePosition = (
  elementId: string,
  side: 'top' | 'right' | 'bottom' | 'left',
  t: number, // 0..1
  elements: Array<{ id: string; position: Position; width?: number; height?: number; type?: string }>
): Position | null => {
  const element = elements.find(e => e.id === elementId);
  if (!element) return null;

  const defaultDims = getDefaultDimensions(element.type || 'rectangle');
  const width = element.width || defaultDims.width;
  const height = element.height || defaultDims.height;

  switch (side) {
    case 'top':
      return {
        x: element.position.x + width * t,
        y: element.position.y
      };
    case 'right':
      return {
        x: element.position.x + width,
        y: element.position.y + height * t
      };
    case 'bottom':
      return {
        x: element.position.x + width * t,
        y: element.position.y + height
      };
    case 'left':
      return {
        x: element.position.x,
        y: element.position.y + height * t
      };
  }
};