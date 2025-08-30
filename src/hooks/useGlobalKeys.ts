import { useState, useEffect } from 'react';

export interface GlobalKeyState {
  spacePressed: boolean;
  ctrlPressed: boolean;
  shiftPressed: boolean;
  altPressed: boolean;
}

export function useGlobalKeys() {
  const [keyState, setKeyState] = useState<GlobalKeyState>({
    spacePressed: false,
    ctrlPressed: false,
    shiftPressed: false,
    altPressed: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar se está editando texto
      const activeElement = document.activeElement;
      const isEditingText = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable') ||
        activeElement.closest('[contenteditable]')
      );

      // Atualizar estado das teclas
      setKeyState(prev => {
        let newSpacePressed = prev.spacePressed;
        
        // Se a tecla pressionada for espaço e não estiver editando texto, definir como true
        if (e.code === 'Space' && !isEditingText) {
          newSpacePressed = true;
        }
        

        
        return {
          ...prev,
          spacePressed: newSpacePressed,
          ctrlPressed: e.ctrlKey || e.metaKey,
          shiftPressed: e.shiftKey,
          altPressed: e.altKey,
        };
      });

      // Prevenir comportamentos padrão quando necessário
      if (e.code === 'Space' && !isEditingText) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyState(prev => {
        let newSpacePressed = prev.spacePressed;
        
        // Se a tecla solta for espaço, definir como false
        if (e.code === 'Space') {
          newSpacePressed = false;
        }
        
        return {
          ...prev,
          spacePressed: newSpacePressed,
          ctrlPressed: e.ctrlKey || e.metaKey,
          shiftPressed: e.shiftKey,
          altPressed: e.altKey,
        };
      });
    };

    // Resetar tudo quando perder foco
    const handleBlur = () => {
      setKeyState({
        spacePressed: false,
        ctrlPressed: false,
        shiftPressed: false,
        altPressed: false,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleBlur); // Reset ao ganhar foco também

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleBlur);
    };
  }, []);

  return keyState;
}