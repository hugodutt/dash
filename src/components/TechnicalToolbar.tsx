import React, { useState, useEffect } from 'react';
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
  Plus,
  Save
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output';
  content: string;
}

interface TechnicalToolbarProps {
  isVisible: boolean;
  selectedElement?: any;
  onUpdateElement?: (elementId: string, updates: any) => void;
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

export const TechnicalToolbar: React.FC<TechnicalToolbarProps> = ({
  isVisible,
  selectedElement,
  onUpdateElement
}) => {
  // Estados para edição - inicializar com valores do elemento selecionado
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [prompt, setPrompt] = useState('$ ');
  const [lines, setLines] = useState<TerminalLine[]>([]);

  // Atualizar estados quando o elemento selecionado mudar
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.type === 'code-block') {
        setContent(selectedElement.content || '');
        setLanguage(selectedElement.language || 'javascript');
        setTheme(selectedElement.theme || 'dark');
        setShowLineNumbers(selectedElement.showLineNumbers !== false);
        setFontSize(selectedElement.fontSize || 14);
      } else if (selectedElement.type === 'terminal-block') {
        setLines(selectedElement.lines || []);
        setPrompt(selectedElement.prompt || '$ ');
        setFontSize(selectedElement.fontSize || 14);
      }
    }
  }, [selectedElement]);

  if (!isVisible || !selectedElement || !['code-block', 'terminal-block'].includes(selectedElement.type)) {
    return null;
  }

  const handleSave = () => {
    if (!selectedElement || !onUpdateElement) return;

    const updates: any = {};

    if (selectedElement.type === 'code-block') {
      updates.content = content;
      updates.language = language;
      updates.theme = theme;
      updates.showLineNumbers = showLineNumbers;
      updates.fontSize = fontSize;
    } else if (selectedElement.type === 'terminal-block') {
      updates.lines = lines;
      updates.prompt = prompt;
      updates.fontSize = fontSize;
    }

    onUpdateElement(selectedElement.id, updates);
  };

  const addTerminalLine = (type: 'input' | 'output') => {
    const newLines = [...lines];
    newLines.push({
      id: Date.now().toString(),
      type,
      content: type === 'input' ? prompt : ''
    });
    setLines(newLines);
  };

  const updateTerminalLine = (id: string, content: string) => {
    const newLines = lines.map(line =>
      line.id === id ? { ...line, content } : line
    );
    setLines(newLines);
  };

  const removeTerminalLine = (id: string) => {
    const newLines = lines.filter(line => line.id !== id);
    setLines(newLines);
  };

  const isCodeBlock = selectedElement.type === 'code-block';
  const isTerminalBlock = selectedElement.type === 'terminal-block';

  return (
    <div 
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-4 z-40 max-h-[80vh] overflow-y-auto"
      style={{ backgroundColor: '#F2F2FF' }}
    >
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          {isCodeBlock ? <Code size={16} /> : <Terminal size={16} />}
          Editar {isCodeBlock ? 'Bloco de Código' : 'Terminal'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Modifique as propriedades do elemento selecionado
        </p>
      </div>

      {/* Configurações do Code Block */}
      {isCodeBlock && (
        <>
          <div className="space-y-3 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code size={14} />
              Código
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
                <Select value={language} onValueChange={setLanguage}>
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
                <Select value={theme} onValueChange={(value: 'dark' | 'light') => setTheme(value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((themeOption) => (
                      <SelectItem key={themeOption.value} value={themeOption.value}>
                        {themeOption.label}
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
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Configurações do Terminal Block */}
      {isTerminalBlock && (
        <>
          <div className="space-y-2 mb-4 p-3 bg-white rounded border-2 border-gray-200">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Terminal size={14} />
              Configurações do Terminal
            </Label>
            
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Prompt</Label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
              {lines.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-4">
                  Nenhuma linha adicionada. Use os botões acima para adicionar comandos.
                </p>
              ) : (
                lines.map((line) => (
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
                      ×
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
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
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
                 fontSize: `${fontSize}px`
               }}>
            {isCodeBlock 
              ? 'Sample: console.log("test");'
              : '$ sample command'
            }
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Botão de salvar */}
      <div className="space-y-3">
        <Button
          onClick={handleSave}
          className="w-full py-3 text-white font-medium"
          style={{ backgroundColor: '#3F30F1' }}
        >
          <Save size={16} className="mr-2" />
          Salvar Alterações
        </Button>
      </div>

      {/* Dica de uso */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-700">
          💡 <strong>Dica:</strong> As alterações serão aplicadas ao elemento no canvas em tempo real quando você clicar em "Salvar".
        </p>
      </div>
    </div>
  );
};