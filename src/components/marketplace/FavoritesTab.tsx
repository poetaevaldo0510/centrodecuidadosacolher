import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Star, MessageCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FavoriteItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
  featured: boolean | null;
  category: string | null;
  profiles: {
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
  avg_rating?: number;
  review_count?: number;
}

interface FavoritesTabProps {
  onSelectProduct: (product: FavoriteItem) => void;
  onBack: () => void;
}

const FavoritesTab = ({ onSelectProduct, onBack }: FavoritesTabProps) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: favoriteData } = await supabase
        .from('product_favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (!favoriteData || favoriteData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const productIds = favoriteData.map(f => f.product_id);
      
      const { data: products } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .in('id', productIds);

      if (products) {
        const itemsWithRatings = await Promise.all(
          products.map(async (item) => {
            const { data: reviews } = await supabase
              .from('product_reviews')
              .select('rating')
              .eq('product_id', item.id);
            
            const reviewCount = reviews?.length || 0;
            const avgRating = reviewCount > 0 
              ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
              : 0;
            
            return { ...item, avg_rating: avgRating, review_count: reviewCount };
          })
        );
        setFavorites(itemsWithRatings);
      }
    } catch (error) {
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('product_favorites')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);
      
      setFavorites(prev => prev.filter(f => f.id !== productId));
      toast.success('Removido dos favoritos');
    } catch {
      toast.error('Erro ao remover favorito');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-destructive/10 rounded-xl">
            <Heart className="text-destructive" size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Meus Favoritos</h2>
            <p className="text-xs text-muted-foreground">{favorites.length} produto{favorites.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="text-muted-foreground" size={32} />
          </div>
          <p className="text-foreground font-medium mb-1">Nenhum favorito ainda</p>
          <p className="text-sm text-muted-foreground mb-4">
            Explore o mercado e salve produtos que gostar
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl"
          >
            Explorar Mercado
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex"
              onClick={() => onSelectProduct(item)}
            >
              <div className="w-28 h-28 flex-shrink-0 bg-muted relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="text-muted-foreground" size={24} />
                  </div>
                )}
                {item.review_count && item.review_count > 0 && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-card/90 backdrop-blur-sm rounded-full flex items-center gap-0.5">
                    <Star size={10} className="text-warning fill-warning" />
                    <span className="text-[10px] font-medium">{item.avg_rating?.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.profiles?.display_name || 'Vendedor'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  {item.price ? (
                    <span className="text-base font-bold text-success">
                      R$ {item.price.toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Consultar</span>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      className="p-2 bg-success/10 hover:bg-success/20 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(item);
                      }}
                    >
                      <MessageCircle size={14} className="text-success" />
                    </button>
                    <button
                      className="p-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
                      onClick={(e) => removeFavorite(e, item.id)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;
