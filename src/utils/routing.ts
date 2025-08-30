import { Position } from '../types/dashboard';

// Calcular roteamento reto (direto)
export const calculateStraightRouting = (from: Position, to: Position): Position[] => {
  return [from, to];
};

// Calcular roteamento ortogonal (com cotovelos)
export const calculateOrthogonalRouting = (
  from: Position,
  to: Position,
  fromElement?: { position: Position; width?: number; height?: number },
  toElement?: { position: Position; width?: number; height?: number },
  margin = 12
): Position[] => {
  // Expandir bounding boxes com margem para evitar cruzar os elementos
  const fromBounds = fromElement ? {
    left: fromElement.position.x - margin,
    right: fromElement.position.x + (fromElement.width || 200) + margin,
    top: fromElement.position.y - margin,
    bottom: fromElement.position.y + (fromElement.height || 100) + margin
  } : null;

  const toBounds = toElement ? {
    left: toElement.position.x - margin,
    right: toElement.position.x + (toElement.width || 200) + margin,
    top: toElement.position.y - margin,
    bottom: toElement.position.y + (toElement.height || 100) + margin
  } : null;

  // Caso simples: se os pontos estão alinhados horizontalmente ou verticalmente
  if (Math.abs(from.x - to.x) < 5) {
    return [from, to]; // Linha vertical
  }
  if (Math.abs(from.y - to.y) < 5) {
    return [from, to]; // Linha horizontal
  }

  // Tentar roteamento em L (2 segmentos)
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Preferir horizontal primeiro, depois vertical
  const horizontalFirst = [
    from,
    { x: to.x, y: from.y },
    to
  ];

  // Preferir vertical primeiro, depois horizontal
  const verticalFirst = [
    from,
    { x: from.x, y: to.y },
    to
  ];

  // Verificar se alguma das rotas simples não cruza os elementos
  const checkRoute = (route: Position[]): boolean => {
    for (let i = 0; i < route.length - 1; i++) {
      const segment = { from: route[i], to: route[i + 1] };
      
      // Verificar se o segmento cruza os bounding boxes
      if (fromBounds && segmentIntersectsRect(segment, fromBounds)) return false;
      if (toBounds && segmentIntersectsRect(segment, toBounds)) return false;
    }
    return true;
  };

  if (checkRoute(horizontalFirst)) {
    return horizontalFirst;
  }

  if (checkRoute(verticalFirst)) {
    return verticalFirst;
  }

  // Se ambas as rotas simples cruzam, usar roteamento em U (3 segmentos)
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Sair horizontalmente, depois verticalmente, depois horizontalmente
    const intermediateX = from.x + deltaX * 0.7;
    return [
      from,
      { x: intermediateX, y: from.y },
      { x: intermediateX, y: to.y },
      to
    ];
  } else {
    // Sair verticalmente, depois horizontalmente, depois verticalmente
    const intermediateY = from.y + deltaY * 0.7;
    return [
      from,
      { x: from.x, y: intermediateY },
      { x: to.x, y: intermediateY },
      to
    ];
  }
};

// Verificar se um segmento intersecta um retângulo
const segmentIntersectsRect = (
  segment: { from: Position; to: Position },
  rect: { left: number; right: number; top: number; bottom: number }
): boolean => {
  const { from, to } = segment;
  
  // Se ambos os pontos estão fora do retângulo na mesma direção, não há interseção
  if ((from.x < rect.left && to.x < rect.left) ||
      (from.x > rect.right && to.x > rect.right) ||
      (from.y < rect.top && to.y < rect.top) ||
      (from.y > rect.bottom && to.y > rect.bottom)) {
    return false;
  }

  // Verificar interseção de linha com retângulo (algoritmo simplificado)
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const maxY = Math.max(from.y, to.y);

  return !(maxX < rect.left || minX > rect.right || maxY < rect.top || minY > rect.bottom);
};

// Calcular roteamento automático (escolhe entre reto e ortogonal)
export const calculateAutoRouting = (
  from: Position,
  to: Position,
  fromElement?: { position: Position; width?: number; height?: number },
  toElement?: { position: Position; width?: number; height?: number }
): Position[] => {
  // Se a distância é pequena ou elementos não se sobrepõem, usar reto
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  
  if (distance < 100) {
    return calculateStraightRouting(from, to);
  }

  // Verificar se há sobreposição entre elementos
  if (!fromElement || !toElement) {
    return calculateStraightRouting(from, to);
  }

  const fromBounds = {
    left: fromElement.position.x,
    right: fromElement.position.x + (fromElement.width || 200),
    top: fromElement.position.y,
    bottom: fromElement.position.y + (fromElement.height || 100)
  };

  const toBounds = {
    left: toElement.position.x,
    right: toElement.position.x + (toElement.width || 200),
    top: toElement.position.y,
    bottom: toElement.position.y + (toElement.height || 100)
  };

  // Se não há sobreposição no eixo X ou Y, uma linha reta pode funcionar
  const noOverlapX = fromBounds.right < toBounds.left || toBounds.right < fromBounds.left;
  const noOverlapY = fromBounds.bottom < toBounds.top || toBounds.bottom < fromBounds.top;

  if (noOverlapX || noOverlapY) {
    return calculateStraightRouting(from, to);
  }

  // Usar roteamento ortogonal para elementos que se sobrepõem
  return calculateOrthogonalRouting(from, to, fromElement, toElement);
};

// Calcular comprimento total do path
export const calculatePathLength = (points: Position[]): number => {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

// Obter posição ao longo do path baseado em t (0..1)
export const getPositionAlongPath = (points: Position[], t: number): Position => {
  if (points.length < 2) return points[0] || { x: 0, y: 0 };
  
  const totalLength = calculatePathLength(points);
  const targetLength = totalLength * Math.max(0, Math.min(1, t));
  
  let currentLength = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    
    if (currentLength + segmentLength >= targetLength) {
      const segmentT = (targetLength - currentLength) / segmentLength;
      return {
        x: points[i].x + dx * segmentT,
        y: points[i].y + dy * segmentT
      };
    }
    
    currentLength += segmentLength;
  }
  
  return points[points.length - 1];
};