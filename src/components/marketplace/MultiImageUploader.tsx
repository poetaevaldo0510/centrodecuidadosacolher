import { useState, useCallback } from 'react';
import { X, GripVertical, Plus, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ImageItem {
  id: string;
  url: string;
  order: number;
}

interface MultiImageUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

const MultiImageUploader = ({ images, onImagesChange, maxImages = 5 }: MultiImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newImages: ImageItem[] = [];
      
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Imagem deve ter no máximo 5MB');
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('marketplace-images')
          .upload(fileName, file);

        if (uploadError) {
          // If bucket doesn't exist, use a base64 preview
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          
          newImages.push({
            id: Date.now().toString() + Math.random().toString(36),
            url: dataUrl,
            order: images.length + newImages.length
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('marketplace-images')
            .getPublicUrl(fileName);

          newImages.push({
            id: Date.now().toString() + Math.random().toString(36),
            url: publicUrl,
            order: images.length + newImages.length
          });
        }
      }

      onImagesChange([...images, ...newImages]);
      if (newImages.length > 0) {
        toast.success(`${newImages.length} imagem(s) adicionada(s)`);
      }
    } catch (error: any) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      order: i
    }));
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverItem(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedItem, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i
    }));
    
    onImagesChange(reorderedImages);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Imagens do Produto
        </span>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-move group ${
              dragOverItem === index 
                ? 'border-primary scale-105' 
                : draggedItem === index
                ? 'opacity-50 border-border'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <img
              src={image.url}
              alt={`Produto ${index + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-1 left-1 p-1 bg-card/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} className="text-muted-foreground" />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <X size={12} />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full">
                Principal
              </span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={24} className="text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Adicionar</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Arraste para reordenar • Primeira imagem é a principal
      </p>
    </div>
  );
};

export default MultiImageUploader;
