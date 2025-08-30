import React, { useState } from 'react';
import { ProgressElement } from '../../types/dashboard';
import { BaseElement } from './BaseElement';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';

interface ProgressElementComponentProps {
  element: ProgressElement;
  onUpdate: (element: ProgressElement) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  searchTerm: string;
  onSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const ProgressElementComponent: React.FC<ProgressElementComponentProps> = ({
  element,
  onUpdate,
  onDelete,
  onBringToFront,
  searchTerm,
  onSelect,
  isSelected
}) => {
  const handleUpdate = (updates: Partial<ProgressElement>) => {
    onUpdate({ ...element, ...updates });
  };

  const handleClick = () => {
    onBringToFront();
    if (onSelect) {
      onSelect(element.id);
    }
  };



  if (element.style === 'circle') {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (element.value / 100) * circumference;

    return (
      <BaseElement
        element={element}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onBringToFront={onBringToFront}
        searchTerm={searchTerm}
        className={isSelected ? 'ring-2 ring-[#3F30F1] ring-opacity-75' : ''}
      >
        <div 
          className="flex flex-col items-center justify-center cursor-pointer bg-white rounded-lg border-2 border-gray-200 p-4"
          onClick={handleClick}
        >
          <div className="relative">
            <svg width="100" height="100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={element.color}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {element.showValue && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold" style={{ color: element.color }}>
                  {element.value}%
                </span>
              </div>
            )}
          </div>
          {element.label && (
            <div className="mt-2 text-sm font-medium text-gray-700">
              {element.label}
            </div>
          )}
        </div>
      </BaseElement>
    );
  }

  return (
    <BaseElement
      element={element}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onBringToFront={onBringToFront}
      searchTerm={searchTerm}
      className={isSelected ? 'ring-2 ring-[#3F30F1] ring-opacity-75' : ''}
    >
      <div 
        className="bg-white rounded-lg border-2 border-gray-200 p-4 cursor-pointer"
        onClick={handleClick}
      >
        {element.label && (
          <div className="mb-2 text-sm font-medium text-gray-700">
            {element.label}
          </div>
        )}
        <div className="flex items-center gap-3">
          <Progress 
            value={element.value} 
            className="flex-1"
            style={{ 
              '--progress-background': element.color 
            } as React.CSSProperties}
          />
          {element.showValue && (
            <span className="text-sm font-medium" style={{ color: element.color }}>
              {element.value}%
            </span>
          )}
        </div>
      </div>
    </BaseElement>
  );
};