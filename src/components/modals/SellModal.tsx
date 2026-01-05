import { useState } from 'react';
import { X, Tag, DollarSign, FileText, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiImageUploader from '@/components/marketplace/MultiImageUploader';
import { PRODUCT_CATEGORIES } from '@/components/marketplace/CategoryFilter';

interface ImageItem {
  id: string;
  url: string;
  order: number;
}

const SellModal = () => {
  const { setActiveModal, triggerReward } = useAppStore();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('outros');
  const handleSellProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Digite o título do produto');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      toast.error('Digite um preço válido');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Insert product
      const { data: product, error } = await supabase
        .from('marketplace_items')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          price: parseFloat(price),
          image_url: images.length > 0 ? images[0].url : null,
          category: category,
          featured: false
        })
        .select()
        .single();

      if (error) throw error;

      // Insert additional images
      if (images.length > 1 && product) {
        const imageRecords = images.map((img, index) => ({
          product_id: product.id,
          image_url: img.url,
          display_order: index
        }));

        await supabase
          .from('product_images')
          .insert(imageRecords);
      }

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-success/15 via-success/5 to-card px-5 py-4 border-b border-border/50 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-success to-success/70 rounded-xl shadow-lg shadow-success/20">
              <Tag className="text-success-foreground" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Novo Anúncio</h3>
              <p className="text-xs text-muted-foreground">Venda seu produto</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSellProduct} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Images */}
          <MultiImageUploader
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground" />
              Título do Produto
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Kit de materiais adaptados"
              className="rounded-xl border-border/50 focus:border-success/50 focus:ring-success/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground" />
              Descrição
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu produto em detalhes..."
              rows={3}
              className="rounded-xl border-border/50 focus:border-success/50 focus:ring-success/30 resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
              <Tag size={14} className="text-muted-foreground" />
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl border-border/50 focus:border-success/50 focus:ring-success/30">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
              <DollarSign size={14} className="text-muted-foreground" />
              Preço
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0,00"
                className="pl-12 rounded-xl border-border/50 focus:border-success/50 focus:ring-success/30"
              />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-warning" />
              <span className="text-xs font-semibold text-foreground">Dicas para vender mais</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Adicione fotos claras e de boa qualidade</li>
              <li>• Escreva uma descrição detalhada</li>
              <li>• Defina um preço justo e competitivo</li>
            </ul>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground rounded-xl py-6 text-base font-semibold shadow-lg shadow-success/20 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                Publicando...
              </div>
            ) : (
              <>
                <Tag size={18} className="mr-2" />
                Publicar Produto
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
