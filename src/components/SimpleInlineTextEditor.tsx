import React, { useState, useRef, useEffect } from 'react';
import { Position } from '../types/dashboard';

interface SimpleInlineTextEditorProps {
  position: Position;
  initialText?: string;
  onComplete: (text: string, finalPosition: Position, width: number, height: number) => void;
  onCancel: () => void;
  textColor?: string;
}

export const SimpleInlineTextEditor: React.FC<SimpleInlineTextEditorProps> = ({
  position,
  initialText = '',
  onComplete,
  onCancel,
  textColor = '#FFFFFF'
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('SimpleInlineTextEditor mounted');
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      if (text.trim()) {
        onComplete(text.trim(), position, 200, 50);
      } else {
        onCancel();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Text changed to:', e.target.value);
    setText(e.target.value);
  };

  return (
    <div
      className="absolute z-[9999] border-2 border-blue-500 bg-black rounded p-2"
      style={{
        left: position.x,
        top: position.y,
        width: 200,
        height: 80
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full bg-transparent border-none outline-none resize-none text-white"
        placeholder="Digite aqui..."
        style={{ color: textColor }}
      />
    </div>
  );
};