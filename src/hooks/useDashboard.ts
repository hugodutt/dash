import { useState, useEffect, useCallback } from 'react';
import { Card, FreeElement, CategoryInfo, DashboardState } from '../types/dashboard';
import { findNearestAnchor } from '../utils/anchors';

const STORAGE_KEY = 'dashboard-livre-v1';

const initialState: DashboardState = {
  cards: [],
  freeElements: [],
  categories: [],
  connectionMode: false,
  draggingConnection: undefined,
  hoveredAnchor: undefined,
  selectedElement: undefined
};

export function useDashboard() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          cards: parsed.cards || [],
          freeElements: parsed.freeElements || [],
          categories: parsed.categories || [],
          connectionMode: false,
          draggingConnection: undefined,
          hoveredAnchor: undefined,
          selectedElement: undefined
        });
      }
    } catch (error) {
      console.error('Error loading dashboard state:', error);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving dashboard state:', error);
    }
  }, [state]);

  const addCard = useCallback((card: Card) => {
    setState(prev => {
      const maxZ = Math.max(
        ...prev.cards.map(c => c.zIndex),
        ...(prev.freeElements || []).map(e => e.zIndex),
        0
      );
      return {
        ...prev,
        cards: [...prev.cards, { ...card, zIndex: maxZ + 1 }]
      };
    });
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === id ? { ...card, ...updates } : card
      )
    }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== id)
    }));
  }, []);

  const bringCardToFront = useCallback((id: string) => {
    setState(prev => {
      const maxZ = Math.max(
        ...prev.cards.map(c => c.zIndex),
        ...(prev.freeElements || []).map(e => e.zIndex),
        0
      );
      return {
        ...prev,
        cards: prev.cards.map(card => 
          card.id === id ? { ...card, zIndex: maxZ + 1 } : card
        )
      };
    });
  }, []);

  // Free Elements functions
  const addFreeElement = useCallback((element: FreeElement) => {
    setState(prev => {
      const currentElements = prev.freeElements || [];
      return {
        ...prev,
        freeElements: [...currentElements, element]
      };
    });
  }, []);

  const updateFreeElement = useCallback((id: string, updates: Partial<FreeElement>) => {
    setState(prev => ({
      ...prev,
      freeElements: (prev.freeElements || []).map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    }));
  }, []);

  const deleteFreeElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      freeElements: (prev.freeElements || []).filter(element => element.id !== id)
    }));
  }, []);

  const bringElementToFront = useCallback((id: string) => {
    setState(prev => {
      const maxZ = Math.max(
        ...prev.cards.map(c => c.zIndex),
        ...(prev.freeElements || []).map(e => e.zIndex),
        0
      );
      return {
        ...prev,
        freeElements: (prev.freeElements || []).map(element =>
          element.id === id ? { ...element, zIndex: maxZ + 1 } : element
        )
      };
    });
  }, []);

  // Connection management functions
  const toggleConnectionMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      connectionMode: !prev.connectionMode,
      draggingConnection: undefined,
      hoveredAnchor: undefined
    }));
  }, []);

  const setHoveredAnchor = useCallback((anchor: typeof initialState.hoveredAnchor) => {
    setState(prev => ({
      ...prev,
      hoveredAnchor: anchor
    }));
  }, []);

  const startDraggingConnection = useCallback((fromElementId: string, fromElementType: 'card' | 'element', fromAnchorId: string, fromPosition: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      draggingConnection: {
        fromElementId,
        fromElementType,
        fromAnchorId,
        fromPosition,
        currentPosition: fromPosition
      }
    }));
  }, []);

  const updateDraggingConnection = useCallback((currentPosition: { x: number; y: number }) => {
    setState(prev => {
      if (!prev.draggingConnection) return prev;

      // Combinar todos os elementos para busca de anchors
      const allElements = [
        ...prev.cards.map(card => ({
          id: card.id,
          position: card.position,
          width: card.width,
          height: card.height,
          type: card.type
        })),
        ...prev.freeElements
          .filter(el => el.type !== 'line' && el.type !== 'arrow' && el.type !== 'connector')
          .map(el => ({
            id: el.id,
            position: el.position,
            width: el.width,
            height: el.height,
            type: el.type
          }))
      ];

      // Encontrar anchor mais próximo
      const nearestAnchor = findNearestAnchor(
        currentPosition,
        prev.draggingConnection.fromElementId,
        allElements,
        25 // raio de snap aumentado
      );

      return {
        ...prev,
        draggingConnection: {
          ...prev.draggingConnection,
          currentPosition,
          nearestAnchor: nearestAnchor ? {
            elementId: nearestAnchor.elementId,
            elementType: allElements.find(e => e.id === nearestAnchor.elementId) ? 
              (prev.cards.find(c => c.id === nearestAnchor.elementId) ? 'card' : 'element') as 'card' | 'element' : 'element',
            anchorId: nearestAnchor.anchorId,
            position: nearestAnchor.position
          } : undefined
        }
      };
    });
  }, []);

  const completeDraggingConnection = useCallback((endElementId?: string, endElementType?: 'card' | 'element', endAnchorId?: string) => {
    setState(prev => {
      if (!prev.draggingConnection) return prev;

      // Se não foi fornecido um destino específico, usar o nearestAnchor se disponível
      const targetElementId = endElementId || prev.draggingConnection.nearestAnchor?.elementId;
      const targetElementType = endElementType || prev.draggingConnection.nearestAnchor?.elementType;
      const targetAnchorId = endAnchorId || prev.draggingConnection.nearestAnchor?.anchorId;

      if (!targetElementId || !targetElementType || !targetAnchorId) {
        // Cancelar se não há destino válido
        return {
          ...prev,
          draggingConnection: undefined
        };
      }

      const id = `connector-${Date.now()}`;
      const maxZ = Math.max(
        ...prev.cards.map(c => c.zIndex),
        ...(prev.freeElements || []).map(e => e.zIndex),
        0
      );

      const newConnector: any = {
        id,
        type: 'connector',
        position: prev.draggingConnection.fromPosition,
        zIndex: maxZ + 1,
        from: {
          mode: 'port',
          targetId: prev.draggingConnection.fromElementId,
          portId: prev.draggingConnection.fromAnchorId
        },
        to: {
          mode: 'port',
          targetId: targetElementId,
          portId: targetAnchorId
        },
        routing: 'auto',
        arrow: {
          end: true,
          style: 'triangle',
          size: 10
        },
        style: {
          stroke: '#3F30F1',
          width: 2,
          opacity: 1
        }
      };

      return {
        ...prev,
        freeElements: [...(prev.freeElements || []), newConnector],
        draggingConnection: undefined,
        hoveredAnchor: undefined
      };
    });
  }, []);

  const cancelDraggingConnection = useCallback(() => {
    setState(prev => ({
      ...prev,
      draggingConnection: undefined,
      hoveredAnchor: undefined
    }));
  }, []);



  // Element selection
  const selectElement = useCallback((elementId: string, elementType: 'text' | 'title' | 'checkbox' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky' | 'progress' | 'code-block' | 'terminal-block' | 'task' | 'checklist' | 'note' | 'image' | 'table' | 'habit-tracker' | 'weekly-review' | 'eisenhower') => {
    const getCategory = (type: string): 'text' | 'shapes' | 'technical' | 'cards' | 'other' => {
      if (['text', 'title'].includes(type)) return 'text';
      if (['rectangle', 'circle', 'line', 'arrow', 'sticky', 'progress'].includes(type)) return 'shapes';
      if (['code-block', 'terminal-block'].includes(type)) return 'technical';
      if (['task', 'checklist', 'note', 'image', 'table', 'habit-tracker', 'weekly-review', 'eisenhower'].includes(type)) return 'cards';
      return 'other';
    };

    setState(prev => ({
      ...prev,
      selectedElement: { 
        id: elementId, 
        type: elementType,
        category: getCategory(elementType)
      }
    }));
  }, []);

  const deselectElement = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedElement: undefined
    }));
  }, []);

  const updateSelectedElementStyle = useCallback((style: any) => {
    setState(prev => {
      if (!prev.selectedElement) return prev;

      return {
        ...prev,
        freeElements: (prev.freeElements || []).map(element =>
          element.id === prev.selectedElement?.id
            ? { ...element, ...style }
            : element
        )
      };
    });
  }, []);

  // Helper function to get connected elements
  const getConnectedElements = useCallback((elementId: string, elementType: 'card' | 'element') => {
    const connections = (state.freeElements || []).filter(el => 
      (el.type === 'line' || el.type === 'arrow') &&
      ((el.startConnection?.elementId === elementId && el.startConnection?.elementType === elementType) ||
       (el.endConnection?.elementId === elementId && el.endConnection?.elementType === elementType))
    );

    const connectedElements = new Set<string>();
    connections.forEach(conn => {
      if (conn.type === 'line' || conn.type === 'arrow') {
        if (conn.startConnection) {
          connectedElements.add(`${conn.startConnection.elementType}:${conn.startConnection.elementId}`);
        }
        if (conn.endConnection) {
          connectedElements.add(`${conn.endConnection.elementType}:${conn.endConnection.elementId}`);
        }
      }
    });

    return Array.from(connectedElements).filter(id => id !== `${elementType}:${elementId}`);
  }, [state.freeElements]);

  // Enhanced update functions that move connected elements  
  const updateCardWithConnections = useCallback((id: string, updates: Partial<Card>) => {
    setState(prev => {
      // Update the main card
      const newState = {
        ...prev,
        cards: prev.cards.map(card => 
          card.id === id ? { ...card, ...updates } : card
        )
      };

      // Os conectores se atualizam automaticamente baseado nos anchors
      // Não precisamos mover elementos conectados manualmente
      return newState;
    });
  }, []);

  const updateFreeElementWithConnections = useCallback((id: string, updates: Partial<FreeElement>) => {
    setState(prev => ({
      ...prev,
      freeElements: (prev.freeElements || []).map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    }));
  }, []);

  // Enhanced delete functions that also remove connections
  const deleteCardWithConnections = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== id),
      freeElements: (prev.freeElements || []).filter(element => {
        if (element.type === 'connector') {
          const connector = element as any;
          return !(
            (connector.from?.mode !== 'free' && connector.from?.targetId === id) ||
            (connector.to?.mode !== 'free' && connector.to?.targetId === id)
          );
        }
        return true;
      })
    }));
  }, []);

  const deleteFreeElementWithConnections = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      freeElements: (prev.freeElements || []).filter(element => {
        if (element.id === id) return false;
        if (element.type === 'connector') {
          const connector = element as any;
          return !(
            (connector.from?.mode !== 'free' && connector.from?.targetId === id) ||
            (connector.to?.mode !== 'free' && connector.to?.targetId === id)
          );
        }
        return true;
      })
    }));
  }, []);



  const addOrUpdateCategory = useCallback((name: string, color: string) => {
    setState(prev => {
      const existing = prev.categories.find(cat => cat.name === name);
      if (existing) {
        return {
          ...prev,
          categories: prev.categories.map(cat =>
            cat.name === name ? { ...cat, color } : cat
          )
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, { name, color }]
        };
      }
    });
  }, []);

  // Labels management
  const getAllLabels = useCallback(() => {
    const labels = new Set<string>();
    state.cards.forEach(card => {
      if (card.labels) {
        card.labels.forEach(label => labels.add(label));
      }
    });
    return Array.from(labels);
  }, [state.cards]);

  const addLabel = useCallback((labelName: string) => {
    // Labels são criadas automaticamente quando usadas pela primeira vez
    // Não precisamos armazenar separadamente
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-livre-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [state]);

  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.cards && Array.isArray(parsed.cards)) {
        setState({
          ...parsed,
          freeElements: parsed.freeElements || []
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, []);

  const filteredCards = state.cards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('description' in card && card.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ('content' in card && card.content?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.labels && card.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(new Set(state.cards.map(c => c.category).filter(Boolean)));

  return {
    state,
    filteredCards,
    allCategories,
    allLabels: getAllLabels(),
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addCard,
    updateCard: updateCardWithConnections,
    deleteCard: deleteCardWithConnections,
    bringCardToFront,
    addFreeElement,
    updateFreeElement: updateFreeElementWithConnections,
    deleteFreeElement: deleteFreeElementWithConnections,
    bringElementToFront,
    addOrUpdateCategory,
    addLabel,
    exportData,
    importData,
    // Connection management
    toggleConnectionMode,
    setHoveredAnchor,
    startDraggingConnection,
    updateDraggingConnection,
    completeDraggingConnection,
    cancelDraggingConnection,
    getConnectedElements,

    // Element selection  
    selectElement,
    deselectElement,
    updateSelectedElementStyle
  };
}