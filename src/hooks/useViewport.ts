import { useState, useCallback, useRef, useEffect } from 'react';

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface UseViewportReturn {
  viewport: ViewportState;
  setZoom: (zoom: number) => void;
  setZoomAtPoint: (zoom: number, screenX: number, screenY: number) => void;
  setPan: (panX: number, panY: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  startPanning: (startX: number, startY: number) => void;
  updatePanning: (currentX: number, currentY: number) => void;
  stopPanning: () => void;
  isPanning: boolean;
  getViewportCenter: () => { x: number; y: number };
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export function useViewport(): UseViewportReturn {
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    panX: 0,
    panY: 0
  });

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  const setZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    setViewport(prev => ({ ...prev, zoom: clampedZoom }));
  }, []);

  const setZoomAtPoint = useCallback((newZoom: number, screenX: number, screenY: number) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    
    setViewport(prev => {
      // Calcular a posição no mundo antes da mudança de zoom
      const worldX = (screenX - prev.panX) / prev.zoom;
      const worldY = (screenY - prev.panY) / prev.zoom;
      
      // Calcular o novo pan para manter o ponto na mesma posição da tela
      const newPanX = screenX - worldX * clampedZoom;
      const newPanY = screenY - worldY * clampedZoom;
      
      return {
        zoom: clampedZoom,
        panX: newPanX,
        panY: newPanY
      };
    });
  }, []);

  const setPan = useCallback((panX: number, panY: number) => {
    setViewport(prev => ({ ...prev, panX, panY }));
  }, []);

  const zoomIn = useCallback(() => {
    // Usar o centro da tela como ponto de referência para o zoom
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = (window.innerHeight - 64) / 2; // Subtrair altura da toolbar
    setZoomAtPoint(viewport.zoom + ZOOM_STEP, screenCenterX, screenCenterY);
  }, [viewport.zoom, setZoomAtPoint]);

  const zoomOut = useCallback(() => {
    // Usar o centro da tela como ponto de referência para o zoom
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = (window.innerHeight - 64) / 2; // Subtrair altura da toolbar
    setZoomAtPoint(viewport.zoom - ZOOM_STEP, screenCenterX, screenCenterY);
  }, [viewport.zoom, setZoomAtPoint]);

  const resetZoom = useCallback(() => {
    setViewport({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.panX) / viewport.zoom,
      y: (screenY - viewport.panY) / viewport.zoom
    };
  }, [viewport]);

  const fitToScreen = useCallback(() => {
    // Implementar lógica para ajustar zoom baseado no conteúdo
    resetZoom();
  }, [resetZoom]);

  const getViewportCenter = useCallback(() => {
    // Obter o centro da área visível atual
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = (window.innerHeight - 64) / 2; // Subtrair altura da toolbar
    const worldPos = screenToWorld(screenCenterX, screenCenterY);
    // Garantir que sempre retorne coordenadas válidas
    return {
      x: Math.max(0, worldPos.x),
      y: Math.max(0, worldPos.y)
    };
  }, [screenToWorld]);

  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * viewport.zoom + viewport.panX,
      y: worldY * viewport.zoom + viewport.panY
    };
  }, [viewport]);

  const startPanning = useCallback((startX: number, startY: number) => {
    setIsPanning(true);
    panStartRef.current = {
      x: startX,
      y: startY,
      initialPanX: viewport.panX,
      initialPanY: viewport.panY
    };
  }, [viewport.panX, viewport.panY]);

  const updatePanning = useCallback((currentX: number, currentY: number) => {
    if (!isPanning) return;

    const deltaX = currentX - panStartRef.current.x;
    const deltaY = currentY - panStartRef.current.y;

    setViewport(prev => ({
      ...prev,
      panX: panStartRef.current.initialPanX + deltaX,
      panY: panStartRef.current.initialPanY + deltaY
    }));
  }, [isPanning]);

  const stopPanning = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoomAtPoint(viewport.zoom + delta, e.clientX, e.clientY);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [viewport.zoom, setZoomAtPoint]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar for temporary pan mode - evitar que interfira com inputs
      if (e.code === 'Space' && !e.repeat) {
        const activeElement = document.activeElement;
        const isEditingText = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.hasAttribute('contenteditable') ||
          activeElement.closest('[contenteditable]')
        );

        if (!isEditingText) {
          e.preventDefault();
          // Não definir isPanning aqui, pois isso deve ser gerenciado pelo Canvas
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeElement = document.activeElement;
        const isEditingText = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.hasAttribute('contenteditable') ||
          activeElement.closest('[contenteditable]')
        );

        if (!isEditingText) {
          e.preventDefault();
          // Não definir isPanning aqui, pois isso deve ser gerenciado pelo Canvas
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    viewport,
    setZoom,
    setZoomAtPoint,
    setPan,
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
  };
}