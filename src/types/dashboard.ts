export interface Position {
  x: number;
  y: number;
}

export interface CategoryInfo {
  name: string;
  color: string;
}

export interface BaseCard {
  id: string;
  type: 'task' | 'checklist' | 'note' | 'image' | 'table' | 'eisenhower';
  position: Position;
  title: string;
  category?: string;
  categoryColor?: string;
  labels?: string[];
  zIndex: number;
  width?: number;
  height?: number;
}

export interface TaskCard extends BaseCard {
  type: 'task';
  done: boolean;
  description: string;
  startDate?: string;
  endDate?: string;
  priority?: 'UI' | 'UN' | 'NI' | 'NN'; // Urgente/Importante, Urgente/Não-importante, etc.
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ChecklistCard extends BaseCard {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface NoteCard extends BaseCard {
  type: 'note';
  content: string;
}

export interface ImageCard extends BaseCard {
  type: 'image';
  src: string;
  alt: string;
}

export interface TableRow {
  id: string;
  [key: string]: string;
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'checkbox';
}

export interface TableCard extends BaseCard {
  type: 'table';
  columns: TableColumn[];
  rows: TableRow[];
}



export interface EisenhowerTask {
  id: string;
  title: string;
  quadrant: 'UI' | 'UN' | 'NI' | 'NN';
  originalTaskId?: string; // referência ao task card original se existir
}

export interface EisenhowerCard extends BaseCard {
  type: 'eisenhower';
  tasks: EisenhowerTask[];
}

export type Card = TaskCard | ChecklistCard | NoteCard | ImageCard | TableCard | HabitTrackerCard | WeeklyReviewCard | EisenhowerCard;

// Free elements (não são cards) - incluindo shapes e blocos técnicos
export interface BaseElement {
  id: string;
  type: 'text' | 'checkbox' | 'title' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'connector' | 'sticky' | 'progress' | 'code-block' | 'markdown-block' | 'terminal-block';
  position: Position;
  zIndex: number;
  width?: number;
  height?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize?: number | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  opacity?: number;
}

export interface CheckboxElement extends BaseElement {
  type: 'checkbox';
  text: string;
  done: boolean;
  fontSize?: number | 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  textColor?: string;
  opacity?: number;
}

export interface TitleElement extends BaseElement {
  type: 'title';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  opacity?: number;
}

// Shapes básicos
export interface RectangleElement extends BaseElement {
  type: 'rectangle';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

// Sistema de Anchors/Portas
export interface Anchor {
  id: string; // ex: 'top-center', 'bottom-left', 'center'
  resolve(shape: { position: Position; width?: number; height?: number }): Position; // world coords
}

// Endpoints para conectores
export type Endpoint =
  | { mode: 'port'; targetId: string; portId: string }
  | { mode: 'side'; targetId: string; side: 'top' | 'right' | 'bottom' | 'left'; t: number } // 0..1
  | { mode: 'free'; x: number; y: number }; // solto

// Conector avançado
export interface ConnectorElement extends BaseElement {
  type: 'connector';
  from: Endpoint;
  to: Endpoint;
  routing: 'straight' | 'orth' | 'auto';
  waypoints?: Position[]; // dobras manuais
  arrow?: {
    start?: boolean;
    end?: boolean;
    style: 'triangle' | 'circle' | 'bar';
    size: number;
  };
  label?: {
    text: string;
    t: number; // 0..1 ao longo do caminho
    offset?: Position;
  };
  style: {
    stroke: string;
    width: number;
    dash?: number[];
    opacity?: number;
  };
}

// Manter compatibilidade com linhas/setas simples (deprecated)
export interface LineElement extends BaseElement {
  type: 'line';
  endPosition: Position;
  strokeColor: string;
  strokeWidth: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  endPosition: Position;
  strokeColor: string;
  strokeWidth: number;
  arrowSize: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange';
}

export interface ProgressElement extends BaseElement {
  type: 'progress';
  value: number; // 0-100
  label: string;
  showValue: boolean;
  color: string;
  style: 'bar' | 'circle';
}

// Blocos técnicos
export interface CodeBlockElement extends BaseElement {
  type: 'code-block';
  content: string;
  language: string;
  theme: 'light' | 'dark';
  showLineNumbers: boolean;
  fontSize: number | 'xs' | 'sm' | 'base';
}

export interface MarkdownBlockElement extends BaseElement {
  type: 'markdown-block';
  content: string;
  isEditMode: boolean;
}

export interface TerminalBlockElement extends BaseElement {
  type: 'terminal-block';
  lines: Array<{
    id: string;
    type: 'input' | 'output' | 'error';
    content: string;
  }>;
  prompt: string;
}

export type FreeElement = TextElement | CheckboxElement | TitleElement | RectangleElement | CircleElement | LineElement | ArrowElement | ConnectorElement | StickyElement | ProgressElement | CodeBlockElement | MarkdownBlockElement | TerminalBlockElement;

export interface DashboardState {
  cards: Card[];
  freeElements: FreeElement[];
  categories: CategoryInfo[];
  connectionMode: boolean; // Modo especial para conectar elementos
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
  inlineTextEditor?: {
    position: Position;
    initialText?: string;
    textStyle: {
      color: string;
      fontFamily: string;
      fontSize: number;
      textAlign: 'left' | 'center' | 'right';
      isBold: boolean;
      isItalic: boolean;
      isUnderlined: boolean;
      opacity: number;
    };
  };
  selectedElement?: {
    id: string;
    type: 'text' | 'title' | 'checkbox' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress' | 'code-block' | 'terminal-block' | 'task' | 'checklist' | 'note' | 'image' | 'table' | 'habit-tracker' | 'weekly-review' | 'eisenhower';
    category: 'text' | 'shapes' | 'technical' | 'cards' | 'other';
  };
}