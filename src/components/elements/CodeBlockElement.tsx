import React, { useState } from 'react';
import { CodeBlockElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Copy, Code2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CodeBlockElementComponentProps {
  element: CodeBlockElement;
  onUpdate: (element: CodeBlockElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
  'html', 'css', 'json', 'xml', 'sql', 'bash', 'powershell', 'yaml', 'markdown'
];

const getLanguageLabel = (lang: string) => {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    php: 'PHP',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    xml: 'XML',
    sql: 'SQL',
    bash: 'Bash',
    powershell: 'PowerShell',
    yaml: 'YAML',
    markdown: 'Markdown'
  };
  return labels[lang] || lang;
};

export const CodeBlockElementComponent: React.FC<CodeBlockElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
  };

  const handleUpdate = (updates: Partial<CodeBlockElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(element.content);
      toast.success('Código copiado!');
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  const editForm = (
    <div className="p-4 space-y-4 w-80 max-h-[500px] overflow-y-auto">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Código</Label>
        <Textarea
          value={element.content}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          placeholder="Digite seu código aqui..."
          className="min-h-[150px] font-mono text-xs border border-gray-300 rounded-md"
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Linguagem</Label>
          <Select value={element.language} onValueChange={(language) => handleUpdate({ language })}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {getLanguageLabel(lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tema</Label>
            <Select value={element.theme} onValueChange={(theme: 'light' | 'dark') => handleUpdate({ theme })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Fonte</Label>
            <Select value={element.fontSize} onValueChange={(fontSize: typeof element.fontSize) => handleUpdate({ fontSize })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xs">Pequena</SelectItem>
                <SelectItem value="sm">Média</SelectItem>
                <SelectItem value="base">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={element.showLineNumbers}
            onCheckedChange={(showLineNumbers) => handleUpdate({ showLineNumbers })}
          />
          <Label className="text-sm text-gray-700">Números de linha</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button 
          onClick={() => handleEditingChange(false)}
          size="sm"
          style={{ backgroundColor: '#3F30F1' }}
          className="text-white hover:opacity-90 flex-1"
        >
          Concluir
        </Button>
        <Button 
          onClick={onDelete}
          size="sm"
          variant="destructive"
          className="flex-1"
        >
          Excluir
        </Button>
      </div>
    </div>
  );

  const isDark = element.theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#f8fafc';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const fontSizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base'
  }[element.fontSize];

  const lines = element.content.split('\n');

      return (
      <BaseElement
        element={element}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onBringToFront={onBringToFront}
        isEditing={isEditing}
        onEditingChange={handleEditingChange}
        editForm={editForm}
        searchTerm={searchTerm}
        onSelect={onSelect}
        isSelected={isSelected}
      >
      <div 
        className="w-full h-full border-2 rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: bgColor,
          borderColor: borderColor
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ 
            backgroundColor: isDark ? '#374151' : '#f1f5f9',
            borderColor: borderColor,
            color: textColor
          }}
        >
          <div className="flex items-center gap-2">
            <Code2 size={16} />
            <span className="text-sm font-medium">
              {getLanguageLabel(element.language)}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-black/10"
          >
            <Copy size={14} />
          </Button>
        </div>

        {/* Content */}
        <div 
          className="overflow-auto p-3 cursor-pointer"
          style={{ 
            color: textColor,
            height: 'calc(100% - 40px)'
          }}
          onDoubleClick={() => handleEditingChange(true)}
        >
          {element.content ? (
            <pre className={`font-mono ${fontSizeClass} leading-relaxed`}>
              {element.showLineNumbers ? (
                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <div 
                    className="text-right select-none"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  >
                    {lines.map((_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    {lines.map((line, index) => (
                      <div key={index}>{line || '\u00A0'}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {element.content}
                </div>
              )}
            </pre>
          ) : (
            <div 
              className="text-center py-8"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
            >
              Duplo clique para adicionar código...
            </div>
          )}
        </div>
      </div>
    </BaseElement>
  );
};