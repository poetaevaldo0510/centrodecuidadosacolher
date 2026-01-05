import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Star, Heart, Eye, Package, TrendingUp, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SellerProduct {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  featured: boolean | null;
  view_count: number | null;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
}

interface SellerStats {
  totalProducts: number;
  totalViews: number;
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
}

interface SellerProfileProps {
  sellerId: string;
  sellerName: string | null;
  sellerAvatar: string | null;
  onClose: () => void;
  onSelectProduct: (product: any) => void;
}

const SellerProfile = ({ sellerId, sellerName, sellerAvatar, onClose, onSelectProduct }: SellerProfileProps) => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [stats, setStats] = useState<SellerStats>({ 
    totalProducts: 0, 
    totalViews: 0, 
    totalReviews: 0, 
    avgRating: 0,
    totalFavorites: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller's products
      const { data: productsData, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch ratings and reviews for each product
      const productsWithStats = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: reviews } = await supabase
            .from('product_reviews')
            .select('rating')
            .eq('product_id', product.id);

          const reviewCount = reviews?.length || 0;
          const avgRating = reviewCount > 0
            ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

          return { ...product, avg_rating: avgRating, review_count: reviewCount };
        })
      );

      setProducts(productsWithStats);

      // Calculate seller stats
      const totalProducts = productsWithStats.length;
      const totalViews = productsWithStats.reduce((sum, p) => sum + (p.view_count || 0), 0);
      const totalReviews = productsWithStats.reduce((sum, p) => sum + (p.review_count || 0), 0);
      const avgRating = productsWithStats.length > 0
        ? productsWithStats.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / productsWithStats.filter(p => p.review_count && p.review_count > 0).length || 0
        : 0;

      // Fetch total favorites
      const productIds = productsWithStats.map(p => p.id);
      const { count: favCount } = await supabase
        .from('product_favorites')
        .select('*', { count: 'exact', head: true })
        .in('product_id', productIds);

      setStats({
        totalProducts,
        totalViews,
        totalReviews,
        avgRating: isNaN(avgRating) ? 0 : avgRating,
        totalFavorites: favCount || 0
      });
    } catch (error: any) {
      toast.error('Erro ao carregar perfil do vendedor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-card px-4 pt-10 pb-6 sticky top-0 z-10 border-b border-border/50 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Voltar ao Mercado</span>
        </button>

        {/* Seller Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            {sellerAvatar ? (
              <img src={sellerAvatar} alt={sellerName || ''} className="w-full h-full object-cover" />
            ) : (
              <User className="text-primary-foreground" size={32} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{sellerName || 'Vendedor'}</h2>
            <p className="text-sm text-muted-foreground">
              {stats.totalProducts} produto{stats.totalProducts !== 1 ? 's' : ''} anunciado{stats.totalProducts !== 1 ? 's' : ''}
            </p>
            {stats.avgRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-warning fill-warning" />
                <span className="text-sm font-medium text-foreground">{stats.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({stats.totalReviews} avaliações)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-3 text-center border border-border/30">
            <Package size={18} className="mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-foreground">{stats.totalProducts}</p>
            <p className="text-[10px] text-muted-foreground">Produtos</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-3 text-center border border-border/30">
            <Eye size={18} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-foreground">{stats.totalViews}</p>
            <p className="text-[10px] text-muted-foreground">Visualizações</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-3 text-center border border-border/30">
            <Heart size={18} className="mx-auto mb-1 text-destructive" />
            <p className="text-lg font-bold text-foreground">{stats.totalFavorites}</p>
            <p className="text-[10px] text-muted-foreground">Favoritos</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-3 text-center border border-border/30">
            <Star size={18} className="mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold text-foreground">{stats.totalReviews}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <ShoppingBag size={16} />
          Produtos de {sellerName || 'Vendedor'}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="text-muted-foreground" size={28} />
            </div>
            <p className="text-muted-foreground">Este vendedor ainda não tem produtos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:border-border transition-all cursor-pointer group"
                onClick={() => onSelectProduct({
                  ...product,
                  profiles: { display_name: sellerName, avatar_url: sellerAvatar }
                })}
              >
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ShoppingBag className="text-muted-foreground" size={36} />
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-warning text-warning-foreground text-[10px] font-bold rounded-full">
                      Destaque
                    </span>
                  )}
                  {product.review_count && product.review_count > 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-lg flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="text-xs font-semibold text-foreground">{product.avg_rating?.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                    {product.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Publicado em {formatDate(product.created_at)}
                  </p>
                  <div className="flex items-center justify-between">
                    {product.price ? (
                      <span className="text-base font-bold text-success">
                        R$ {product.price.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Consultar</span>
                    )}
                    <button className="p-2 bg-success/10 hover:bg-success/20 rounded-xl transition-colors">
                      <MessageCircle size={16} className="text-success" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
