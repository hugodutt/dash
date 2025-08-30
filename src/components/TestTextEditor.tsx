import React, { useState, useRef, useEffect } from 'react';

interface TestTextEditorProps {
  position: { x: number; y: number };
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export const TestTextEditor: React.FC<TestTextEditorProps> = ({
  position,
  onComplete,
  onCancel
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('TestTextEditor mounted');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    console.log('Submitting text:', text);
    if (text.trim()) {
      onComplete(text.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value);
    setText(e.target.value);
  };

  console.log('Rendering TestTextEditor with text:', text);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        background: 'white',
        border: '2px solid red',
        padding: '10px'
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Digite aqui..."
        style={{
          width: '200px',
          color: 'black',
          border: '1px solid black',
          padding: '5px'
        }}
      />
      <div style={{ marginTop: '5px' }}>
        <button onClick={handleSubmit} style={{ marginRight: '5px', color: 'black' }}>
          OK
        </button>
        <button onClick={onCancel} style={{ color: 'black' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};