import { useState } from 'react';
import { Upload, Link, Image } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LabelManager } from '../LabelManager';
import { ImageCard as ImageCardType } from '../../types/dashboard';

interface ImageCardProps {
  card: ImageCardType;
  onUpdate: (updates: Partial<ImageCardType>) => void;
  onDelete: () => void;
  onMouseDown: () => void;
  isFiltered?: boolean;
  availableLabels: string[];
  onCreateLabel: (labelName: string) => void;
}

export function ImageCard({ card, onUpdate, onDelete, onMouseDown, isFiltered, availableLabels, onCreateLabel }: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(!card.src);
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState(card.alt);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({
          src: result,
          alt: altInput || file.name
        });
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpdate({
        src: urlInput.trim(),
        alt: altInput || 'Imagem'
      });
      setIsEditing(false);
    }
  };

  return (
    <BaseCard
      card={card}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onMouseDown={onMouseDown}
      isFiltered={isFiltered}
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* Labels */}
        <LabelManager
          labels={card.labels || []}
          availableLabels={availableLabels}
          onLabelsChange={(labels) => onUpdate({ labels })}
          onCreateLabel={onCreateLabel}
        />

        {card.src && !isEditing ? (
          <div className="space-y-2">
            <img
              src={card.src}
              alt={card.alt}
              className="w-full max-h-64 object-cover rounded cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
            <Input
              value={card.alt}
              onChange={(e) => onUpdate({ alt: e.target.value })}
              placeholder="Texto alternativo..."
              className="text-sm"
            />
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3">
                <Input
                  value={altInput}
                  onChange={(e) => setAltInput(e.target.value)}
                  placeholder="Texto alternativo..."
                  className="text-sm"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id={`file-${card.id}`}
                  />
                  <label
                    htmlFor={`file-${card.id}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Image className="h-8 w-8" style={{ color: '#4A5477' }} />
                    <span className="text-sm" style={{ color: '#4A5477' }}>
                      Clique para selecionar uma imagem
                    </span>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <Input
                  value={altInput}
                  onChange={(e) => setAltInput(e.target.value)}
                  placeholder="Texto alternativo..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="URL da imagem..."
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUrlSubmit();
                    }}
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    size="sm"
                    className="text-white"
                    style={{ backgroundColor: '#3F30F1' }}
                  >
                    Adicionar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {card.src && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="w-full"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}
      </div>
    </BaseCard>
  );
}