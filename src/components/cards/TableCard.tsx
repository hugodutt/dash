import React, { useState } from 'react';
import { BaseCard } from './BaseCard';
import { TableCard as TableCardType, TableColumn, TableRow } from '../../types/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow as TableRowComponent } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { LabelManager } from '../LabelManager';

interface TableCardProps {
  card: TableCardType;
  onUpdate: (card: TableCardType) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onMouseDown?: () => void;
  isFiltered?: boolean;
  searchTerm: string;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
}

export function TableCard({ 
  card, 
  onUpdate, 
  onDelete, 
  onBringToFront, 
  onMouseDown,
  isFiltered = false,
  searchTerm,
  availableLabels,
  onCreateLabel 
}: TableCardProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);

  const handleAddColumn = () => {
    const newColumn: TableColumn = {
      id: `col-${Date.now()}`,
      name: 'Nova Coluna',
      type: 'text'
    };
    
    const updatedCard = {
      ...card,
      columns: [...card.columns, newColumn]
    };
    
    onUpdate(updatedCard);
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      ...card.columns.reduce((acc, col) => {
        acc[col.id] = col.type === 'checkbox' ? 'false' : '';
        return acc;
      }, {} as Record<string, string>)
    };
    
    const updatedCard = {
      ...card,
      rows: [...card.rows, newRow]
    };
    
    onUpdate(updatedCard);
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedCard = {
      ...card,
      columns: card.columns.filter(col => col.id !== columnId),
      rows: card.rows.map(row => {
        const { [columnId]: deleted, ...rest } = row;
        return rest as TableRow;
      })
    };
    
    onUpdate(updatedCard);
  };

  const handleDeleteRow = (rowId: string) => {
    const updatedCard = {
      ...card,
      rows: card.rows.filter(row => row.id !== rowId)
    };
    
    onUpdate(updatedCard);
  };

  const handleUpdateColumn = (columnId: string, updates: Partial<TableColumn>) => {
    const updatedCard = {
      ...card,
      columns: card.columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    };
    
    onUpdate(updatedCard);
  };

  const handleUpdateCell = (rowId: string, columnId: string, value: string) => {
    const updatedCard = {
      ...card,
      rows: card.rows.map(row => 
        row.id === rowId ? { ...row, [columnId]: value } : row
      )
    };
    
    onUpdate(updatedCard);
    setEditingCell(null);
  };

  const handleTitleSave = () => {
    onUpdate({ ...card, title: tempTitle });
    setEditingTitle(false);
  };

  const renderCell = (row: TableRow, column: TableColumn) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === column.id;
    const value = row[column.id] || '';

    if (isEditing) {
      return (
        <Input
          autoFocus
          value={value}
          onChange={(e) => handleUpdateCell(row.id, column.id, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
          className="w-full min-w-[80px]"
        />
      );
    }

    if (column.type === 'checkbox') {
      return (
        <Checkbox
          checked={value === 'true'}
          onCheckedChange={(checked) => handleUpdateCell(row.id, column.id, checked ? 'true' : 'false')}
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[24px] min-w-[80px]"
        onClick={() => setEditingCell({ rowId: row.id, columnId: column.id })}
      >
        {value || <span className="text-gray-400 text-sm">Clique para editar</span>}
      </div>
    );
  };

  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onDelete={() => onDelete(card.id)}
      onMouseDown={onMouseDown || (() => onBringToFront(card.id))}
      isFiltered={isFiltered}
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Header com título e labels */}
        <div className="space-y-2">
          {editingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
              className="font-medium"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => setEditingTitle(true)}
            >
              {card.title || 'Clique para adicionar título'}
            </h3>
          )}
          
          <LabelManager
            labels={card.labels || []}
            availableLabels={availableLabels}
            onLabelsChange={(labels) => onUpdate({ ...card, labels })}
            onCreateLabel={onCreateLabel}
          />
        </div>

        {/* Tabela */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRowComponent>
                {card.columns.map((column) => (
                  <TableHead key={column.id} className="relative group">
                    <div className="flex items-center justify-between">
                      <Input
                        value={column.name}
                        onChange={(e) => handleUpdateColumn(column.id, { name: e.target.value })}
                        className="border-0 p-0 h-auto font-medium bg-transparent"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteColumn(column.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar Coluna
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Select
                      value={column.type}
                      onValueChange={(type: 'text' | 'number' | 'date' | 'checkbox') => 
                        handleUpdateColumn(column.id, { type })
                      }
                    >
                      <SelectTrigger className="h-6 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableHead>
                ))}
                <TableHead className="w-12">
                  <Button
                    onClick={handleAddColumn}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableHead>
              </TableRowComponent>
            </TableHeader>
            <TableBody>
              {card.rows.map((row) => (
                <TableRowComponent key={row.id} className="group">
                  {card.columns.map((column) => (
                    <TableCell key={column.id}>
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteRow(row.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRowComponent>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Botão para adicionar linha */}
        <Button
          onClick={handleAddRow}
          variant="outline"
          size="sm"
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Linha
        </Button>
      </div>
    </BaseCard>
  );
}