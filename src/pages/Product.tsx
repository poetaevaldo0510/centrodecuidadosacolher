import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle,
  ArrowLeft,
  User,
  Percent,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
  category: string | null;
  share_link: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

const ProductPage = () => {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Buy form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (shareLink) {
      loadProduct();
    }
  }, [shareLink]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('share_link', shareLink)
        .single();

      if (error) throw error;
      
      setProduct(data);
      setSelectedImage(data.image_url);

      // Load additional images
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', data.id)
        .order('display_order');

      setImages(imagesData || []);
      
      if (imagesData && imagesData.length > 0) {
        setSelectedImage(imagesData[0].image_url);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!buyerName.trim()) {
      toast.error('Digite seu nome');
      return;
    }

    setSubmitting(true);
    try {
      const unitPrice = product.price || 0;
      
      const { error } = await supabase
        .from('marketplace_sales')
        .insert({
          product_id: product.id,
          seller_id: product.user_id,
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim() || null,
          buyer_phone: buyerPhone.trim() || null,
          quantity,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
          platform_fee: unitPrice * quantity * 0.10,
          seller_amount: unitPrice * quantity * 0.90,
          external_sale: true,
          share_link_used: shareLink
        });

      if (error) throw error;

      // Notify seller
      await supabase.from('notifications').insert({
        user_id: product.user_id,
        type: 'sale',
        title: 'Nova venda!',
        message: `${buyerName} comprou ${quantity}x "${product.title}"`,
        data: { product_id: product.id }
      });

      toast.success('Pedido enviado com sucesso! O vendedor entrará em contato.');
      setShowBuyForm(false);
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setQuantity(1);
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast.error('Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShoppingBag className="text-muted-foreground mb-4" size={48} />
        <h1 className="text-xl font-bold text-foreground mb-2">Produto não encontrado</h1>
        <p className="text-muted-foreground mb-4">O link pode estar incorreto ou o produto foi removido.</p>
        <Button onClick={() => navigate('/')}>Ir para o início</Button>
      </div>
    );
  }

  const totalPrice = (product.price || 0) * quantity;
  const platformFee = totalPrice * 0.10;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={18} className="mr-1" /> Voltar
        </Button>
        <Button variant="outline" size="sm" onClick={copyShareLink}>
          {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
        </Button>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-muted relative">
        {selectedImage ? (
          <img 
            src={selectedImage} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="text-muted-foreground" size={64} />
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img.image_url)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === img.image_url ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <div>
          {product.category && (
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
          )}
          <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
        </div>

        {/* Price */}
        {product.price && (
          <div className="bg-success/10 rounded-2xl p-4">
            <span className="text-3xl font-bold text-success">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
        )}

        {/* Seller */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {product.profiles?.avatar_url ? (
              <img src={product.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="text-primary" size={20} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {product.profiles?.display_name || 'Vendedor'}
            </p>
            <p className="text-xs text-muted-foreground">Vendedor</p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* Commission Notice */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2">
          <Percent className="text-warning mt-0.5" size={16} />
          <div className="text-xs">
            <span className="font-semibold text-warning">Informação importante</span>
            <p className="text-muted-foreground mt-0.5">
              Este é um produto do marketplace. A plataforma retém 10% do valor como taxa de serviço.
            </p>
          </div>
        </div>

        {/* Buy Form */}
        {!showBuyForm ? (
          <Button 
            onClick={() => setShowBuyForm(true)}
            className="w-full bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-xl py-6 text-lg font-bold shadow-lg shadow-success/20"
          >
            <ShoppingCart size={20} className="mr-2" />
            Comprar Agora
          </Button>
        ) : (
          <form onSubmit={handleBuy} className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              Dados para contato
            </h3>

            <div>
              <Label htmlFor="buyerName">Seu Nome *</Label>
              <Input
                id="buyerName"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Como você se chama?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buyerEmail">Email</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="buyerPhone">WhatsApp</Label>
                <Input
                  id="buyerPhone"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-muted/30 rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço unitário:</span>
                <span>R$ {product.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantidade:</span>
                <span>{quantity}x</span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
                <span>Total:</span>
                <span className="text-success">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Ao enviar, o vendedor receberá seus dados e entrará em contato para finalizar a compra.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBuyForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-success hover:bg-success/90"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enviar Pedido'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
