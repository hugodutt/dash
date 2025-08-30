import { useRef } from 'react';
import { Search, Plus, FileText, CheckSquare, StickyNote, Image, Table, Download, Upload, Type, Heading, Square, Calendar, BarChart3, Grid3x3, Circle, ArrowRight, Code2, Terminal, TrendingUp, ChevronDown, Minus, MoveUpRight, Hand } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  allCategories: string[];
  onAddTask: () => void;
  onAddChecklist: () => void;
  onAddNote: () => void;
  onAddImage: () => void;
  onAddTable: () => void;
  onAddEisenhower: () => void;
  onAddText: () => void;
  onAddTitle: () => void;
  onAddCheckbox: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddLine: () => void;
  onAddArrow: () => void;
  onAddSticky: () => void;
  onAddProgress: () => void;
  onAddCodeBlock: () => void;
  onAddTerminalBlock: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  connectionMode: boolean;
  onToggleConnectionMode: () => void;
  panMode: boolean;
  onTogglePanMode: () => void;
  drawingMode?: 'line' | 'arrow' | null;
}

export function Toolbar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  allCategories,
  onAddTask,
  onAddChecklist,
  onAddNote,
  onAddImage,
  onAddTable,
  onAddEisenhower,
  onAddText,
  onAddTitle,
  onAddCheckbox,
  onAddRectangle,
  onAddCircle,
  onAddLine,
  onAddArrow,
  onAddSticky,
  onAddProgress,
  onAddCodeBlock,
  onAddTerminalBlock,
  onExport,
  onImport,
  connectionMode,
  onToggleConnectionMode,
  panMode,
  onTogglePanMode,
  drawingMode
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (onImport(content)) {
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar dados. Verifique se o arquivo é válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-paper border-b border-mute/20 p-4 z-10"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#4A5477' }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#4A5477' }} />
          <Input
            placeholder="Buscar cards..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'secondary'}
            className={`cursor-pointer hover:opacity-80 ${
              selectedCategory === 'all' 
                ? 'text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={selectedCategory === 'all' ? { backgroundColor: '#3F30F1' } : {}}
            onClick={() => onCategoryChange('all')}
          >
            Todas
          </Badge>
          {allCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'secondary'}
              className={`cursor-pointer hover:opacity-80 ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === category ? { backgroundColor: '#3F30F1' } : {}}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Cards Básicos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-gray-50 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                Cards
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onAddTask} className="gap-2">
                <FileText className="h-4 w-4" />
                Tarefa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddChecklist} className="gap-2">
                <CheckSquare className="h-4 w-4" />
                Checklist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddNote} className="gap-2">
                <StickyNote className="h-4 w-4" />
                Nota
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddImage} className="gap-2">
                <Image className="h-4 w-4" />
                Imagem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTable} className="gap-2">
                <Table className="h-4 w-4" />
                Tabela
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cards Avançados */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-purple-50 hover:bg-purple-100"
              >
                <BarChart3 className="h-4 w-4" />
                Avançado
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onAddEisenhower} className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                Matriz de Eisenhower
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Elementos Livres */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-blue-50 hover:bg-blue-100"
              >
                <Type className="h-4 w-4" />
                Texto
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onAddText} className="gap-2">
                <Type className="h-4 w-4" />
                Texto Livre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTitle} className="gap-2">
                <Heading className="h-4 w-4" />
                Título
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddCheckbox} className="gap-2">
                <Square className="h-4 w-4" />
                Checkbox Individual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Shapes & Elementos Gráficos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${
                  drawingMode 
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-300' 
                    : 'bg-green-50 hover:bg-green-100'
                }`}
              >
                <Circle className="h-4 w-4" />
                {drawingMode ? `Desenhando ${drawingMode === 'line' ? 'Linha' : 'Seta'}` : 'Shapes'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onAddRectangle} className="gap-2">
                <Square className="h-4 w-4" />
                Retângulo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddCircle} className="gap-2">
                <Circle className="h-4 w-4" />
                Círculo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddLine} className="gap-2">
                <Minus className="h-4 w-4" />
                Linha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddArrow} className="gap-2">
                <MoveUpRight className="h-4 w-4" />
                Seta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddSticky} className="gap-2">
                <StickyNote className="h-4 w-4" />
                Sticky Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddProgress} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Barra de Progresso
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Blocos Técnicos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-orange-50 hover:bg-orange-100"
              >
                <Code2 className="h-4 w-4" />
                Técnico
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onAddCodeBlock} className="gap-2">
                <Code2 className="h-4 w-4" />
                Bloco de Código
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTerminalBlock} className="gap-2">
                <Terminal className="h-4 w-4" />
                Bloco de Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-border"></div>

          {/* Pan Tool */}
          <Button
            variant={panMode ? "default" : "outline"}
            size="sm"
            onClick={onTogglePanMode}
            className="gap-2"
            style={panMode ? { backgroundColor: '#3F30F1' } : {}}
            title="Ferramenta de Mão (Space)"
          >
            <Hand className="h-4 w-4" />
            {panMode ? 'Navegando' : 'Navegar'}
          </Button>

          {/* Connection Mode Toggle */}
          <Button
            variant={connectionMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleConnectionMode}
            className="gap-2"
            style={connectionMode ? { backgroundColor: '#3F30F1' } : {}}
          >
            <ArrowRight className="h-4 w-4" />
            {connectionMode ? 'Conectando...' : 'Conectar'}
          </Button>

          <div className="w-px h-6 bg-border"></div>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}