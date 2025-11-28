import { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const UploadPhotoModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const setActiveModal = useAppStore(state => state.setActiveModal);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    child_name: '',
    caption: '',
    milestone_type: '',
    is_before: false,
    file: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !user) return;

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          child_name: formData.child_name || null,
          photo_url: publicUrl,
          caption: formData.caption || null,
          milestone_type: formData.milestone_type || null,
          is_before: formData.is_before,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Sucesso!',
        description: 'Foto adicionada com sucesso',
      });

      setActiveModal(null);
      window.location.reload(); // Refresh to show new photo
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload da foto',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Adicionar Foto</h3>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Foto *</Label>
            {preview ? (
              <div className="relative mt-2">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null);
                    setFormData({ ...formData, file: null });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para selecionar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Child Name */}
          <div>
            <Label htmlFor="child_name">Nome da Criança</Label>
            <Input
              id="child_name"
              value={formData.child_name}
              onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
              placeholder="Ex: João"
            />
          </div>

          {/* Milestone Type */}
          <div>
            <Label htmlFor="milestone_type">Tipo de Marco</Label>
            <Select
              value={formData.milestone_type}
              onValueChange={(value) => setFormData({ ...formData, milestone_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Desenvolvimento Motor">Desenvolvimento Motor</SelectItem>
                <SelectItem value="Comunicação">Comunicação</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Terapia">Terapia</SelectItem>
                <SelectItem value="Escola">Escola</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Legenda</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Descreva o momento..."
              rows={3}
            />
          </div>

          {/* Is Before Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_before"
              checked={formData.is_before}
              onChange={(e) => setFormData({ ...formData, is_before: e.target.checked })}
              className="w-4 h-4 rounded border-border"
            />
            <Label htmlFor="is_before" className="cursor-pointer">
              Esta é uma foto "antes" (para comparação)
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleUpload}
            disabled={!formData.file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Adicionar Foto
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
