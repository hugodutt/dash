import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Position } from '../types/dashboard';

interface TextEditorModalProps {
  isOpen: boolean;
  position: Position;
  initialText?: string;
  onComplete: (text: string, finalPosition: Position, width: number, height: number) => void;
  onCancel: () => void;
}

export const TextEditorModal: React.FC<TextEditorModalProps> = ({
  isOpen,
  position,
  initialText = '',
  onComplete,
  onCancel
}) => {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Múltiplas tentativas de foco
      setTimeout(() => inputRef.current?.focus(), 0);
      setTimeout(() => inputRef.current?.focus(), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Modal: Submitting text:', text);
    if (text.trim()) {
      onComplete(text.trim(), position, 200, 50);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Modal: Key pressed:', e.key);
    e.stopPropagation(); // Impedir propagação
    
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Modal: Text changing to:', e.target.value);
    setText(e.target.value);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          border: '3px solid #3F30F1',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          minWidth: '400px',
          maxWidth: '600px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          color: 'black', 
          marginBottom: '20px', 
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Criar Texto Livre
        </h3>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite seu texto aqui..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #3F30F1',
              borderRadius: '8px',
              marginBottom: '20px',
              color: 'black',
              backgroundColor: 'white',
              outline: 'none'
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3F30F1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Criar Texto
            </button>
          </div>
        </form>
        
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#666',
          textAlign: 'center'
        }}>
          Pressione Enter para confirmar • Escape para cancelar
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar fora da estrutura do app
  return createPortal(modalContent, document.body);
};