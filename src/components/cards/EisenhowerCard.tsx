import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, X, AlertTriangle, Clock, CheckCircle, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { EisenhowerCard as EisenhowerCardType, EisenhowerTask, TaskCard } from '../../types/dashboard';
import { BaseCard } from './BaseCard';

interface EisenhowerCardProps {
  card: EisenhowerCardType;
  allCards: TaskCard[]; // Para sincronizar com task cards existentes
  onUpdate: (updates: Partial<EisenhowerCardType>) => void;
  onUpdateTaskCard?: (taskId: string, updates: Partial<TaskCard>) => void; // Para atualizar task cards
  onDelete: () => void;
  onBringToFront: () => void;
  onMouseDown?: () => void;
  searchTerm?: string;
}

export function EisenhowerCard({ 
  card, 
  allCards = [],
  onUpdate, 
  onUpdateTaskCard,
  onDelete, 
  onBringToFront,
  onMouseDown,
  searchTerm = ''
}: EisenhowerCardProps) {
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // quadrant ID
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState<EisenhowerTask | null>(null);

  const quadrants = [
    { 
      id: 'UI' as const, 
      title: 'Urgente + Importante', 
      subtitle: 'Fazer Agora',
      color: 'bg-red-500/10 border-red-500/30',
      headerColor: 'bg-red-500/20',
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    },
    { 
      id: 'UN' as const, 
      title: 'Urgente + Não Importante', 
      subtitle: 'Delegar',
      color: 'bg-orange-500/10 border-orange-500/30',
      headerColor: 'bg-orange-500/20',
      icon: Clock,
      iconColor: 'text-orange-500'
    },
    { 
      id: 'NI' as const, 
      title: 'Não Urgente + Importante', 
      subtitle: 'Planejar',
      color: 'bg-blue-500/10 border-blue-500/30',
      headerColor: 'bg-blue-500/20',
      icon: CheckCircle,
      iconColor: 'text-blue-500'
    },
    { 
      id: 'NN' as const, 
      title: 'Não Urgente + Não Importante', 
      subtitle: 'Eliminar',
      color: 'bg-gray-500/10 border-gray-500/30',
      headerColor: 'bg-gray-500/20',
      icon: Minus,
      iconColor: 'text-gray-500'
    }
  ];

  const getTasksForQuadrant = (quadrant: string) => {
    return card.tasks.filter(task => task.quadrant === quadrant);
  };

  const addTask = (quadrant: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: EisenhowerTask = {
      id: `eisenhower-task-${Date.now()}`,
      title: newTaskTitle.trim(),
      quadrant: quadrant as any
    };

    onUpdate({
      tasks: [...card.tasks, newTask]
    });

    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  const deleteTask = (taskId: string) => {
    onUpdate({
      tasks: card.tasks.filter(t => t.id !== taskId)
    });
  };

  const moveTask = (taskId: string, newQuadrant: string) => {
    const updatedTasks = card.tasks.map(task => 
      task.id === taskId 
        ? { ...task, quadrant: newQuadrant as any }
        : task
    );

    onUpdate({ tasks: updatedTasks });

    // Se a task está sincronizada com um TaskCard, atualizar a prioridade lá também
    const eisenhowerTask = card.tasks.find(t => t.id === taskId);
    if (eisenhowerTask?.originalTaskId && onUpdateTaskCard) {
      onUpdateTaskCard(eisenhowerTask.originalTaskId, { 
        priority: newQuadrant as any 
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, task: EisenhowerTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, quadrant: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.quadrant !== quadrant) {
      moveTask(draggedTask.id, quadrant);
    }
    setDraggedTask(null);
  };

  const syncWithTaskCards = () => {
    // Sincronizar tasks cards existentes que têm prioridade definida
    const syncedTasks: EisenhowerTask[] = [];
    
    allCards.forEach(taskCard => {
      if (taskCard.priority && !card.tasks.find(t => t.originalTaskId === taskCard.id)) {
        syncedTasks.push({
          id: `synced-${taskCard.id}`,
          title: taskCard.title,
          quadrant: taskCard.priority,
          originalTaskId: taskCard.id
        });
      }
    });

    if (syncedTasks.length > 0) {
      onUpdate({
        tasks: [...card.tasks, ...syncedTasks]
      });
    }
  };

  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown || onBringToFront}
      searchTerm={searchTerm}
      className="min-w-[800px] min-h-[600px]"
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Matriz de Eisenhower</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithTaskCards}
            className="text-xs h-7"
          >
            Sincronizar Tasks
          </Button>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {quadrants.map((quadrant) => {
            const tasks = getTasksForQuadrant(quadrant.id);
            const Icon = quadrant.icon;

            return (
              <div
                key={quadrant.id}
                className={`
                  rounded-lg border-2 ${quadrant.color} 
                  flex flex-col overflow-hidden
                `}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, quadrant.id)}
              >
                {/* Header do quadrante */}
                <div className={`p-3 ${quadrant.headerColor} border-b border-white/10`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${quadrant.iconColor}`} />
                    <h4 className="text-sm font-medium text-white">{quadrant.title}</h4>
                  </div>
                  <p className="text-xs text-[#4A5477]">{quadrant.subtitle}</p>
                </div>

                {/* Lista de tasks */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {tasks.map(task => (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, task)}
                      className="
                        group relative bg-white/5 border border-white/10 rounded p-2 
                        cursor-move hover:bg-white/10 transition-colors
                      "
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, zIndex: 1000 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-white flex-1 break-words">
                          {task.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="
                            h-5 w-5 p-0 opacity-0 group-hover:opacity-100 
                            hover:bg-red-500/20 text-red-400 shrink-0
                          "
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {task.originalTaskId && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Sincronizada
                        </Badge>
                      )}
                    </motion.div>
                  ))}

                  {/* Input para adicionar nova task */}
                  {isAddingTask === quadrant.id ? (
                    <div className="bg-white/10 border border-[#3F30F1] rounded p-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Digite o título da task..."
                        className="h-8 text-sm bg-transparent border-0 text-white placeholder:text-gray-400"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTask(quadrant.id);
                          if (e.key === 'Escape') setIsAddingTask(null);
                        }}
                      />
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addTask(quadrant.id)}
                          className="h-6 text-xs text-green-400 hover:bg-green-500/20"
                        >
                          Adicionar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingTask(null)}
                          className="h-6 text-xs text-gray-400 hover:bg-gray-500/20"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingTask(quadrant.id)}
                      className="
                        w-full h-8 border border-dashed border-white/30 
                        hover:border-white/50 hover:bg-white/5 text-xs
                      "
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar task
                    </Button>
                  )}
                </div>

                {/* Footer com contador */}
                <div className="p-2 border-t border-white/10 bg-black/10">
                  <p className="text-xs text-[#4A5477] text-center">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 text-xs text-[#4A5477] space-y-1">
          <p>💡 <strong>Dica:</strong> Arraste as tasks entre os quadrantes para reorganizar</p>
          <p>🔄 Tasks sincronizadas são atualizadas automaticamente com seus cards originais</p>
        </div>
      </div>
    </BaseCard>
  );
}