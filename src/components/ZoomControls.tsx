import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomIn}
        className="w-8 h-8 p-0 hover:bg-gray-100"
        title="Zoom In (Ctrl + Scroll)"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="text-xs font-medium text-gray-600 px-1 min-w-[40px] text-center">
        {zoomPercentage}%
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomOut}
        className="w-8 h-8 p-0 hover:bg-gray-100"
        title="Zoom Out (Ctrl + Scroll)"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <div className="w-full h-px bg-gray-200 my-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onFitToScreen}
        className="w-8 h-8 p-0 hover:bg-gray-100"
        title="Ajustar à Tela"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onResetZoom}
        className="w-8 h-8 p-0 hover:bg-gray-100"
        title="Reset Zoom (100%)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}