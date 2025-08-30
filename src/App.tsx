import { useState, useRef } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { useViewport } from './hooks/useViewport';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { TaskCard, ChecklistCard, NoteCard, ImageCard, TableCard, EisenhowerCard, TextElement, TitleElement, CheckboxElement, RectangleElement, CircleElement, LineElement, ArrowElement, ConnectorElement, StickyElement, ProgressElement, CodeBlockElement, TerminalBlockElement } from './types/dashboard';

export default function App() {
  const [panMode, setPanMode] = useState(false);
  const [showTechnicalSidebar, setShowTechnicalSidebar] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'line' | 'arrow' | null>(null);
  const viewportRef = useRef<any>(null);
  
  const {
    state,
    filteredCards,
    allCategories,
    allLabels,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addCard,
    updateCard,
    deleteCard,
    bringCardToFront,
    addFreeElement,
    updateFreeElement,
    deleteFreeElement,
    bringElementToFront,
    addOrUpdateCategory,
    addLabel,
    exportData,
    importData,
    toggleConnectionMode,
    startDraggingConnection,
    updateDraggingConnection,
    completeDraggingConnection,
    cancelDraggingConnection,
    setHoveredAnchor,
    getConnectedElements,
    selectElement,
    deselectElement,
    updateSelectedElementStyle
  } = useDashboard();

  const togglePanMode = () => {
    setPanMode(!panMode);
  };

  const startDrawingMode = (type: 'line' | 'arrow') => {
    setDrawingMode(type);
  };

  const cancelDrawingMode = () => {
    setDrawingMode(null);
  };

  const createDrawing = (type: 'line' | 'arrow', startPos: { x: number; y: number }, endPos: { x: number; y: number }, style: any) => {
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100,
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 }; // Fallback
    };

    const defaultPosition = getViewportPosition();
    const id = `${type}-${Date.now()}`;
    
    const maxZ = Math.max(
      ...state.cards.map(c => c.zIndex),
      ...(state.freeElements || []).map(e => e.zIndex),
      0
    );

    const baseElement = {
      id,
      position: defaultPosition,
      zIndex: maxZ + 1,
      width: 200,
      height: 50
    };

    switch (type) {
      case 'line':
        const lineElement: LineElement = {
          id: `line-${Date.now()}`,
          type: 'line',
          position: startPos,
          zIndex: maxZ + 1,
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          endPosition: endPos,
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          style: style.style || 'solid',
          opacity: style.opacity
        };
        addFreeElement(lineElement);
        break;

      case 'arrow':
        const arrowElement: ArrowElement = {
          id: `arrow-${Date.now()}`,
          type: 'arrow',
          position: startPos,
          zIndex: maxZ + 1,
          width: Math.abs(endPos.x - startPos.x),
          height: Math.abs(endPos.y - startPos.y),
          endPosition: endPos,
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          arrowSize: 10,
          style: style.style || 'solid',
          opacity: style.opacity
        };
        addFreeElement(arrowElement);
        break;
    }
  };

  // Mostrar o technical sidebar quando um elemento técnico for selecionado
  const handleSelectElement = (elementId: string, elementType: any) => {
    selectElement(elementId, elementType);
    
    // Mostrar sidebar técnico se for um elemento técnico
    if (elementType === 'code-block' || elementType === 'terminal-block') {
      setShowTechnicalSidebar(true);
    } else {
      setShowTechnicalSidebar(false);
    }
  };

  // Fechar sidebar técnico quando desselecionar
  const handleDeselectElement = () => {
    deselectElement();
    setShowTechnicalSidebar(false);
  };

  const createNewCard = (type: 'task' | 'checklist' | 'note' | 'image' | 'table' | 'habit-tracker' | 'weekly-review' | 'eisenhower', position?: { x: number; y: number }) => {
    // Usar a posição central do viewport se não for fornecida uma posição específica
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100, // Pequena variação aleatória
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 }; // Fallback
    };

    const defaultPosition = position || getViewportPosition();
    const id = Date.now().toString();
    
    const baseCard = {
      id,
      position: defaultPosition,
      title: '',
      zIndex: Math.max(...state.cards.map(c => c.zIndex), 0) + 1
    };

    switch (type) {
      case 'task':
        const taskCard: TaskCard = {
          ...baseCard,
          type: 'task',
          title: 'Nova Tarefa',
          done: false,
          description: ''
        };
        addCard(taskCard);
        break;

      case 'checklist':
        const checklistCard: ChecklistCard = {
          ...baseCard,
          type: 'checklist',
          title: 'Nova Checklist',
          items: []
        };
        addCard(checklistCard);
        break;

      case 'note':
        const noteCard: NoteCard = {
          ...baseCard,
          type: 'note',
          title: 'Nova Nota',
          content: ''
        };
        addCard(noteCard);
        break;

      case 'image':
        const imageCard: ImageCard = {
          ...baseCard,
          type: 'image',
          title: 'Nova Imagem',
          src: '',
          alt: ''
        };
        addCard(imageCard);
        break;

      case 'table':
        const tableCard: TableCard = {
          ...baseCard,
          type: 'table',
          title: 'Nova Tabela',
          columns: [
            { id: 'col1', name: 'Coluna 1', type: 'text' },
            { id: 'col2', name: 'Coluna 2', type: 'text' }
          ],
          rows: [
            { id: 'row1', col1: '', col2: '' }
          ]
        };
        addCard(tableCard);
        break;



      case 'eisenhower':
        const eisenhowerCard: EisenhowerCard = {
          ...baseCard,
          type: 'eisenhower',
          title: 'Matriz de Eisenhower',
          tasks: [],
          width: 800,
          height: 600
        };
        addCard(eisenhowerCard);
        break;
    }
  };

  const handleCreateNote = (x: number, y: number) => {
    // Criar uma nota simples no local do duplo clique
    const noteCard: NoteCard = {
      id: Date.now().toString(),
      type: 'note',
      title: 'Nova Nota',
      content: 'Clique para editar...',
      position: { x, y },
      zIndex: Math.max(...state.cards.map(c => c.zIndex), 0) + 1
    };
    addCard(noteCard);
  };

  const createFreeElement = (type: 'text' | 'title' | 'checkbox' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'connector' | 'sticky' | 'progress' | 'code-block' | 'terminal-block', position?: { x: number; y: number }) => {
    // Usar a posição central do viewport se não for fornecida uma posição específica
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100,
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 }; // Fallback
    };

    const defaultPosition = position || getViewportPosition();
    const id = `${type}-${Date.now()}`;
    
    const maxZ = Math.max(
      ...state.cards.map(c => c.zIndex),
      ...(state.freeElements || []).map(e => e.zIndex),
      0
    );

    const baseElement = {
      id,
      position: defaultPosition,
      zIndex: maxZ + 1,
      width: 200,
      height: 50
    };

    switch (type) {
      case 'text':
        const textElement: TextElement = {
          ...baseElement,
          type: 'text',
          content: 'Digite aqui seu texto livre',
          fontSize: 16,
          fontFamily: 'Inter',
          isBold: false,
          isItalic: false,
          isUnderlined: false,
          textAlign: 'left' as const,
          textColor: '#FFFFFF',
          opacity: 1
        };
        addFreeElement(textElement);
        break;

      case 'title':
        const titleElement: TitleElement = {
          ...baseElement,
          type: 'title',
          content: 'Título Principal',
          level: 2 as const,
          fontSize: 24,
          fontFamily: 'Inter',
          width: 300,
          isBold: false,
          isItalic: false,
          isUnderlined: false,
          textAlign: 'left' as const,
          textColor: '#FFFFFF',
          opacity: 1
        };
        addFreeElement(titleElement);
        break;

      case 'checkbox':
        const checkboxElement: CheckboxElement = {
          ...baseElement,
          type: 'checkbox',
          text: 'Item da checklist',
          done: false,
          fontSize: 16,
          textColor: '#FFFFFF'
        };
        addFreeElement(checkboxElement);
        break;

      case 'rectangle':
        const rectangleElement: RectangleElement = {
          ...baseElement,
          type: 'rectangle',
          fillColor: '#3F30F1',
          strokeColor: '#FFFFFF',
          strokeWidth: 2,
          borderRadius: 8,
          width: 200,
          height: 100
        };
        addFreeElement(rectangleElement);
        break;

      case 'circle':
        const circleElement: CircleElement = {
          ...baseElement,
          type: 'circle',
          fillColor: '#3F30F1',
          strokeColor: '#FFFFFF',
          strokeWidth: 2,
          width: 100,
          height: 100
        };
        addFreeElement(circleElement);
        break;

      case 'line':
        const lineElement: LineElement = {
          ...baseElement,
          type: 'line',
          endPosition: { x: defaultPosition.x + 200, y: defaultPosition.y },
          strokeColor: '#3F30F1',
          strokeWidth: 2,
          style: 'solid'
        };
        addFreeElement(lineElement);
        break;

      case 'arrow':
        const arrowElement: ArrowElement = {
          ...baseElement,
          type: 'arrow',
          endPosition: { x: defaultPosition.x + 200, y: defaultPosition.y },
          strokeColor: '#3F30F1',
          strokeWidth: 2,
          arrowSize: 10,
          style: 'solid'
        };
        addFreeElement(arrowElement);
        break;

      case 'connector':
        // Conectores são criados apenas através do modo de conexão
        // Ativar modo de conexão quando este tipo for solicitado
        toggleConnectionMode();
        break;

      case 'sticky':
        const stickyElement: StickyElement = {
          ...baseElement,
          type: 'sticky',
          content: 'Nova nota adesiva',
          color: 'yellow' as const,
          width: 200,
          height: 150
        };
        addFreeElement(stickyElement);
        break;

      case 'progress':
        const progressElement: ProgressElement = {
          ...baseElement,
          type: 'progress',
          value: 75,
          label: 'Progresso',
          showValue: true,
          color: '#3F30F1',
          style: 'bar' as const,
          width: 250,
          height: 80
        };
        addFreeElement(progressElement);
        break;

      case 'code-block':
        const codeBlockElement: CodeBlockElement = {
          ...baseElement,
          type: 'code-block',
          content: '// Exemplo de código\nconsole.log("Hello, World!");',
          language: 'javascript',
          theme: 'dark' as const,
          showLineNumbers: true,
          fontSize: 14,
          width: 400,
          height: 300
        };
        addFreeElement(codeBlockElement);
        break;

      case 'terminal-block':
        const terminalBlockElement: TerminalBlockElement = {
          ...baseElement,
          type: 'terminal-block',
          lines: [
            { id: '1', type: 'input', content: 'npm install' },
            { id: '2', type: 'output', content: 'added 1342 packages in 23.5s' },
            { id: '3', type: 'input', content: 'npm start' },
            { id: '4', type: 'output', content: 'Server running on port 3000' }
          ],
          prompt: '$ ',
          width: 500,
          height: 300
        };
        addFreeElement(terminalBlockElement);
        break;
    }
  };

  const handleCreateTextFromSidebar = (text: string, style: any, type: 'text' | 'title') => {
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100,
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 };
    };

    const position = getViewportPosition();
    const zIndex = Math.max(
      ...state.cards.map(c => c.zIndex),
      ...(state.freeElements || []).map(e => e.zIndex),
      0
    ) + 1;

    if (type === 'text') {
      const textElement: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        content: text,
        position,
        zIndex,
        width: 200,
        height: 50,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        isBold: style.isBold,
        isItalic: style.isItalic,
        isUnderlined: style.isUnderlined,
        textAlign: style.textAlign,
        textColor: style.color,
        opacity: style.opacity
      };
      addFreeElement(textElement);
    } else {
      const titleElement: TitleElement = {
        id: `title-${Date.now()}`,
        type: 'title',
        content: text,
        position,
        zIndex,
        width: 300,
        height: 60,
        level: 2 as const,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        isBold: style.isBold,
        isItalic: style.isItalic,
        isUnderlined: style.isUnderlined,
        textAlign: style.textAlign,
        textColor: style.color,
        opacity: style.opacity
      };
      addFreeElement(titleElement);
    }
  };

  const handleCreateShapeFromSidebar = (type: 'rectangle' | 'circle' | 'line' | 'arrow', style: any) => {
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100,
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 };
    };

    const position = getViewportPosition();
    const zIndex = Math.max(
      ...state.cards.map(c => c.zIndex),
      ...(state.freeElements || []).map(e => e.zIndex),
      0
    ) + 1;

    switch (type) {
      case 'rectangle':
        const rectangleElement: RectangleElement = {
          id: `rectangle-${Date.now()}`,
          type: 'rectangle',
          position,
          zIndex,
          width: 200,
          height: 100,
          fillColor: style.fillColor,
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          borderRadius: style.borderRadius || 8,
          opacity: style.opacity
        };
        addFreeElement(rectangleElement);
        break;

      case 'circle':
        const circleElement: CircleElement = {
          id: `circle-${Date.now()}`,
          type: 'circle',
          position,
          zIndex,
          width: 100,
          height: 100,
          fillColor: style.fillColor,
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity
        };
        addFreeElement(circleElement);
        break;

      case 'line':
        const lineElement: LineElement = {
          id: `line-${Date.now()}`,
          type: 'line',
          position,
          zIndex,
          width: 200,
          height: 50,
          endPosition: { x: position.x + 200, y: position.y },
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          style: style.style || 'solid',
          opacity: style.opacity
        };
        addFreeElement(lineElement);
        break;

      case 'arrow':
        const arrowElement: ArrowElement = {
          id: `arrow-${Date.now()}`,
          type: 'arrow',
          position,
          zIndex,
          width: 200,
          height: 50,
          endPosition: { x: position.x + 200, y: position.y },
          strokeColor: style.strokeColor,
          strokeWidth: style.strokeWidth,
          arrowSize: 10,
          style: style.style || 'solid',
          opacity: style.opacity
        };
        addFreeElement(arrowElement);
        break;
    }
  };

  // Função para atualizar elemento técnico através do sidebar
  const handleUpdateTechnicalElement = (elementId: string, updates: any) => {
    updateFreeElement(elementId, updates);
  };

  const handleCreateCheckboxFromSidebar = (style: any) => {
    const getViewportPosition = () => {
      if (viewportRef.current?.getViewportCenter) {
        const center = viewportRef.current.getViewportCenter();
        return {
          x: center.x + (Math.random() - 0.5) * 100,
          y: center.y + (Math.random() - 0.5) * 100
        };
      }
      return { x: 400, y: 300 };
    };

    const checkboxElement: CheckboxElement = {
      id: `checkbox-${Date.now()}`,
      type: 'checkbox',
      position: getViewportPosition(),
      zIndex: Math.max(
        ...state.cards.map(c => c.zIndex),
        ...(state.freeElements || []).map(e => e.zIndex),
        0
      ) + 1,
      width: 200,
      height: 30,
      text: style.text,
      done: style.done,
      fontSize: style.fontSize,
      textColor: style.textColor,
      opacity: style.opacity
    };
    addFreeElement(checkboxElement);
  };

  return (
    <div className="h-screen w-screen">
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        allCategories={allCategories}
        onAddTask={() => createNewCard('task')}
        onAddChecklist={() => createNewCard('checklist')}
        onAddNote={() => createNewCard('note')}
        onAddImage={() => createNewCard('image')}
        onAddTable={() => createNewCard('table')}
        onAddEisenhower={() => createNewCard('eisenhower')}
        onAddText={() => createFreeElement('text')}
        onAddTitle={() => createFreeElement('title')}
        onAddCheckbox={() => createFreeElement('checkbox')}
        onAddRectangle={() => createFreeElement('rectangle')}
        onAddCircle={() => createFreeElement('circle')}
        onAddLine={() => startDrawingMode('line')}
        onAddArrow={() => startDrawingMode('arrow')}
        onAddSticky={() => createFreeElement('sticky')}
        onAddProgress={() => createFreeElement('progress')}
        onAddCodeBlock={() => createFreeElement('code-block')}
        onAddTerminalBlock={() => createFreeElement('terminal-block')}
        onExport={exportData}
        onImport={importData}
        connectionMode={state.connectionMode}
        onToggleConnectionMode={toggleConnectionMode}
        panMode={panMode}
        onTogglePanMode={togglePanMode}
        drawingMode={drawingMode}
      />

      <Canvas
        ref={viewportRef}
        cards={state.cards}
        freeElements={state.freeElements || []}
        filteredCards={filteredCards}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
        onBringToFront={bringCardToFront}
        onUpdateFreeElement={updateFreeElement}
        onDeleteFreeElement={deleteFreeElement}
        onBringElementToFront={bringElementToFront}
        onCreateNote={handleCreateNote}
        searchTerm={searchTerm}
        availableLabels={allLabels}
        onCreateLabel={addLabel}
        connectionMode={state.connectionMode}
        panMode={panMode}
        drawingMode={drawingMode}
        onCancelDrawing={cancelDrawingMode}
        onCreateDrawing={createDrawing}
        draggingConnection={state.draggingConnection}
        hoveredAnchor={state.hoveredAnchor}
        onStartDraggingConnection={startDraggingConnection}
        onUpdateDraggingConnection={updateDraggingConnection}
        onCompleteDraggingConnection={completeDraggingConnection}
        onCancelDraggingConnection={cancelDraggingConnection}
        onSetHoveredAnchor={setHoveredAnchor}
        selectedElement={state.selectedElement}
        onCreateTextFromSidebar={handleCreateTextFromSidebar}
        onCreateShapeFromSidebar={handleCreateShapeFromSidebar}
        onUpdateTechnicalElement={handleUpdateTechnicalElement}
        onCreateCheckboxFromSidebar={handleCreateCheckboxFromSidebar}
        onSelectElement={handleSelectElement}
        onDeselectElement={handleDeselectElement}
        onUpdateSelectedElementStyle={updateSelectedElementStyle}
        showTechnicalSidebar={showTechnicalSidebar}
      />
    </div>
  );
}