import React, { useState } from 'react';
import { TerminalBlockElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Copy, Terminal, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TerminalBlockElementComponentProps {
  element: TerminalBlockElement;
  onUpdate: (element: TerminalBlockElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const TerminalBlockElementComponent: React.FC<TerminalBlockElementComponentProps> = ({
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
  const [newLineContent, setNewLineContent] = useState('');
  const [newLineType, setNewLineType] = useState<'input' | 'output' | 'error'>('input');

  const handleUpdate = (updates: Partial<TerminalBlockElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const addLine = () => {
    if (!newLineContent.trim()) return;
    
    const newLine = {
      id: Date.now().toString(),
      type: newLineType,
      content: newLineContent
    };
    
    handleUpdate({
      lines: [...element.lines, newLine]
    });
    
    setNewLineContent('');
  };

  const removeLine = (lineId: string) => {
    handleUpdate({
      lines: element.lines.filter(line => line.id !== lineId)
    });
  };

  const updateLine = (lineId: string, content: string) => {
    handleUpdate({
      lines: element.lines.map(line => 
        line.id === lineId ? { ...line, content } : line
      )
    });
  };

  const copyCommand = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Comando copiado!');
    } catch (err) {
      toast.error('Erro ao copiar comando');
    }
  };

  const editForm = (
    <div className="p-4 space-y-4 w-80 max-h-[500px] overflow-y-auto">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Prompt</Label>
        <Input
          value={element.prompt}
          onChange={(e) => handleUpdate({ prompt: e.target.value })}
          placeholder="$ "
          className="h-8 border border-gray-300"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Linhas do terminal</Label>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {element.lines.map((line) => (
            <div key={line.id} className="flex items-center gap-2">
              <Select 
                value={line.type} 
                onValueChange={(type: typeof line.type) => {
                  handleUpdate({
                    lines: element.lines.map(l => 
                      l.id === line.id ? { ...l, type } : l
                    )
                  });
                }}
              >
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="input">Input</SelectItem>
                  <SelectItem value="output">Output</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                value={line.content}
                onChange={(e) => updateLine(line.id, e.target.value)}
                placeholder="Conteúdo da linha..."
                className="flex-1 h-8 text-xs"
              />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeLine(line.id)}
                className="p-1 h-6 w-6 hover:bg-red-100"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Select value={newLineType} onValueChange={setNewLineType}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="output">Output</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            value={newLineContent}
            onChange={(e) => setNewLineContent(e.target.value)}
            placeholder="Nova linha..."
            className="flex-1 h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLine();
              }
            }}
          />
          
          <Button
            size="sm"
            onClick={addLine}
            style={{ backgroundColor: '#3F30F1' }}
            className="text-white hover:opacity-90 h-8 w-8 p-0"
          >
            <Plus size={12} />
          </Button>
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

  const getLineColor = (type: string) => {
    switch (type) {
      case 'input': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#e5e7eb';
    }
  };

  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'input': return element.prompt;
      case 'error': return '';
      default: return '';
    }
  };

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
      <div className="w-full h-full bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-green-400" />
            <span className="text-sm font-medium text-gray-300">Terminal</span>
          </div>
        </div>

        {/* Content */}
        <div 
          className="overflow-auto p-3 cursor-pointer font-mono text-sm leading-relaxed"
          style={{ height: 'calc(100% - 40px)' }}
          onDoubleClick={() => handleEditingChange(true)}
        >
          {element.lines.length > 0 ? (
            <div className="space-y-1">
              {element.lines.map((line) => (
                <div 
                  key={line.id} 
                  className="flex items-start gap-2 group"
                  style={{ color: getLineColor(line.type) }}
                >
                  <span className="select-none">
                    {getLinePrefix(line.type)}
                  </span>
                  <span className="flex-1">{line.content}</span>
                  {line.type === 'input' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCommand(line.content)}
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
                    >
                      <Copy size={12} className="text-gray-400" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Duplo clique para configurar o terminal...
            </div>
          )}
        </div>
      </div>
    </BaseElement>
  );
};