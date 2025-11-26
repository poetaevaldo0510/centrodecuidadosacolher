import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import UploadImageModal from './UploadImageModal';

const SellModal = () => {
  const { setActiveModal, triggerReward } = useAppStore();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSellProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          user_id: user.id,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          price: parseFloat(formData.get('price') as string),
          image_url: imageUrl || null,
          featured: false
        });

      if (error) throw error;

      setActiveModal(null);
      triggerReward("Produto anunciado com sucesso!", 50);
      toast.success('Produto publicado no mercado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao publicar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 animate-slide-in-from-bottom">
        <div className="bg-card w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-foreground">Anunciar Produto</h3>
            <button onClick={() => setActiveModal(null)}>
              <X />
            </button>
          </div>
          
          <form onSubmit={handleSellProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Produto</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ex: Kit de materiais adaptados"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva seu produto..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              {imageUrl ? (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(true)}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Adicionar Imagem
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-success text-success-foreground hover:bg-success/90"
              disabled={loading}
            >
              {loading ? 'Publicando...' : 'Publicar Produto'}
            </Button>
          </form>
        </div>
      </div>

      <UploadImageModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={setImageUrl}
      />
    </>
  );
};

export default SellModal;
