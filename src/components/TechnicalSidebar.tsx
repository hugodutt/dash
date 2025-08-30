import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  Code,
  Terminal,
  FileCode,
  Hash,
  Type,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';

interface TechnicalStyle {
  content?: string;
  language?: string;
  theme?: 'dark' | 'light';
  showLineNumbers?: boolean;
  fontSize?: number;
  lines?: Array<{ id: string; type: 'input' | 'output'; content: string }>;
  prompt?: string;
}

interface TechnicalSidebarProps {
  isVisible: boolean;
  selectedElementId?: string;
  elementType?: 'code-block' | 'terminal-block';
  technicalStyle: TechnicalStyle;
  onStyleChange: (style: Partial<TechnicalStyle>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCreateTechnical?: (type: 'code-block' | 'terminal-block', style: TechnicalStyle) => void;
}

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' }
];

const themes = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' }
];

const presetElements = [
  { type: 'code-block' as const, icon: Code, label: 'Bloco de Código' },
  { type: 'terminal-block' as const, icon: Terminal, label: 'Terminal' }
];

export const TechnicalSidebar: React.FC<TechnicalSidebarProps> = ({
  isVisible,
  selectedElementId,
  elementType,
  technicalStyle,
  onStyleChange,
  onDuplicate,
  onDelete,
  onCreateTechnical
}) => {
  const [creationStyle, setCreationStyle] = useState<TechnicalStyle>({
    content: '// Exemplo de código\nconsole.log("Hello, World!");',
    language: 'javascript',
    theme: 'dark',
    showLineNumbers: true,
    fontSize: 14,
    lines: [
      { id: '1', type: 'input', content: 'npm install' },
      { id: '2', type: 'output', content: 'added 1342 packages in 23.5s' }
    ],
    prompt: '$ '
  });

  if (!isVisible) return null;

  const currentStyle = selectedElementId ? technicalStyle : creationStyle;
  const onCurrentStyleChange = selectedElementId ? onStyleChange : setCreationStyle;

  const handleCreateTechnical = (type: 'code-block' | 'terminal-block') => {
    if (onCreateTechnical) {
      onCreateTechnical(type, creationStyle);
    }
  };

  const addTerminalLine = (type: 'input' | 'output') => {
    const newLines = [...(currentStyle.lines || [])];
    const prompt = currentStyle.prompt || '$ ';
    newLines.push({
      id: Date.now().toString(),
      type,
      content: type === 'input' ? prompt : ''
    });
    onCurrentStyleChange({ lines: newLines });
  };

  const updateTerminalLine = (id: string, content: string) => {
    const newLines = (currentStyle.lines || []).map(line =>
      line.id === id ? { ...line, content } : line
    );
    onCurrentStyleChange({ lines: newLines });
  };

  const removeTerminalLine = (id: string) => {
    const newLines = (currentStyle.lines || []).filter(line => line.id !== id);
    onCurrentStyleChange({ lines: newLines });
  };

  return (
    <div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-40 max-h-[80vh] overflow-y-auto technical-sidebar"
      style={{ backgroundColor: '#F2F2FF' }}
    >
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FileCode size={16} />
          {selectedElementId ? 'Editar Técnico' : 'Criar Elemento Técnico'}
        </h3>
        {selectedElementId ? (
          <p className="text-xs text-gray-500 mt-1">
            {elementType === 'code-block' ? 'Bloco de código' : 'Terminal'} selecionado
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Escolha um tipo e configure o conteúdo
          </p>
        )}
      </div>

      {/* Criação de elementos técnicos - só aparece quando nenhum elemento está selecionado */}
      {!selectedElementId && onCreateTechnical && (
        <div className="mb-4 p-3 bg-white rounded border-2 border-gray-200">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Tipos de Elemento
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {presetElements.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                onClick={() => handleCreateTechnical(type)}
                variant="outline"
                className="flex items-center gap-2 justify-start h-auto py-3"
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Configurações do Code Block */}
      {(elementType === 'code-block' || !selectedElementId) && (
        <>
          <Separator className="my-4" />
          
          <div className="space-y-3 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code size={14} />
              Código
            </Label>
            <Textarea
              value={currentStyle.content || ''}
              onChange={(e) => onCurrentStyleChange({ content: e.target.value })}
              placeholder="Digite seu código aqui..."
              className="min-h-[120px] font-mono text-sm resize-none"
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
          </div>

          <div className="space-y-3 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <Label className="text-sm font-medium text-gray-700">Configurações do Código</Label>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Linguagem</Label>
                <Select 
                  value={currentStyle.language || 'javascript'} 
                  onValueChange={(language) => onCurrentStyleChange({ language })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Tema</Label>
                <Select 
                  value={currentStyle.theme || 'dark'} 
                  onValueChange={(theme: 'dark' | 'light') => onCurrentStyleChange({ theme })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600 flex items-center gap-1">
                  <Hash size={12} />
                  Números de linha
                </Label>
                <Switch
                  checked={currentStyle.showLineNumbers !== false}
                  onCheckedChange={(showLineNumbers) => onCurrentStyleChange({ showLineNumbers })}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Configurações do Terminal Block */}
      {(elementType === 'terminal-block' || !selectedElementId) && (
        <>
          <Separator className="my-4" />
          
          <div className="space-y-2 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Terminal size={14} />
              Configurações do Terminal
            </Label>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Prompt</Label>
              <Input
                value={currentStyle.prompt || '$ '}
                onChange={(e) => onCurrentStyleChange({ prompt: e.target.value })}
                placeholder="$ "
                className="h-8 font-mono text-sm"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </div>

          <div className="space-y-3 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Linhas do Terminal</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTerminalLine('input')}
                  className="h-7 px-2 text-xs"
                  style={{ backgroundColor: '#3F30F1', color: 'white', border: 'none' }}
                >
                  <Plus size={12} />
                  Input
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTerminalLine('output')}
                  className="h-7 px-2 text-xs"
                >
                  <Plus size={12} />
                  Output
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(currentStyle.lines || []).length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4">
                  Nenhuma linha adicionada. Use os botões acima para adicionar comandos.
                </p>
              ) : (
                (currentStyle.lines || []).map((line) => (
                  <div key={line.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      line.type === 'input' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {line.type === 'input' ? '>' : '✓'}
                    </span>
                    <Input
                      value={line.content}
                      onChange={(e) => updateTerminalLine(line.id, e.target.value)}
                      className="h-8 flex-1 font-mono text-xs"
                      style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                      placeholder={line.type === 'input' ? 'comando...' : 'saída...'}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTerminalLine(line.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <Separator className="my-4" />

      {/* Configurações de Aparência */}
      <div className="space-y-3 mb-4 p-3 bg-white rounded border-2 border-gray-200">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Type size={14} />
          Aparência
        </Label>
        
        <div className="space-y-3">
          {/* Tamanho da fonte */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Tamanho da fonte</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentStyle.fontSize || 14}
                onChange={(e) => onCurrentStyleChange({ fontSize: parseInt(e.target.value) || 14 })}
                className="h-8 text-xs flex-1"
                min="8"
                max="32"
              />
              <span className="text-xs text-gray-500 w-8">px</span>
            </div>
          </div>
          
          {/* Preview da fonte */}
          <div className="p-2 bg-gray-100 rounded border text-xs" 
               style={{ 
                 fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                 fontSize: `${currentStyle.fontSize || 14}px`
               }}>
            Sample: console.log("test");
          </div>
        </div>
      </div>

      {/* Ações */}
      {selectedElementId && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Ações</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicate}
                className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-gray-100"
              >
                <Copy size={14} />
                <span className="text-xs">Duplicar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex flex-col items-center gap-1 h-auto py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} />
                <span className="text-xs">Excluir</span>
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Dica de uso */}
      {!selectedElementId && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">
            💡 <strong>Dica:</strong> Configure o estilo e clique em um dos botões acima para criar o elemento no canvas.
          </p>
        </div>
      )}
    </div>
  );
};