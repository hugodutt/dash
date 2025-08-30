import React from 'react';

interface DebugTextButtonProps {
  onTextCreated: (text: string, position: { x: number; y: number }) => void;
}

export const DebugTextButton: React.FC<DebugTextButtonProps> = ({ onTextCreated }) => {
  const handleClick = () => {
    console.log('Debug button clicked');
    
    // Usar prompt do navegador como último recurso
    const text = prompt('Digite seu texto (teste de debug):');
    console.log('Prompt result:', text);
    
    if (text && text.trim()) {
      onTextCreated(text.trim(), { x: 200, y: 200 });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 999999
    }}>
      <button
        onClick={handleClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FF0000',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        DEBUG: Criar Texto (Prompt)
      </button>
    </div>
  );
};