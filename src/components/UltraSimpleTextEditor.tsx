import React from 'react';

interface UltraSimpleTextEditorProps {
  position: { x: number; y: number };
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export const UltraSimpleTextEditor: React.FC<UltraSimpleTextEditorProps> = ({
  position,
  onComplete,
  onCancel
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('text') as string;
    console.log('Form submitted with text:', text);
    if (text && text.trim()) {
      onComplete(text.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  console.log('Rendering UltraSimpleTextEditor at position:', position);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 999999,
        backgroundColor: 'white',
        border: '3px solid red',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            name="text"
            type="text"
            placeholder="Digite seu texto..."
            autoFocus
            style={{
              width: '250px',
              padding: '8px',
              fontSize: '16px',
              border: '2px solid #333',
              borderRadius: '4px',
              color: 'black',
              backgroundColor: 'white'
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};