import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Heart, Star, Sparkles, Grid3X3, List, User, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from './ui/button';
import ProductDetailModal from './modals/ProductDetailModal';
import FavoritesTab from './marketplace/FavoritesTab';
import SellerProfile from './marketplace/SellerProfile';
import SellerDashboard from './marketplace/SellerDashboard';
import AdvancedSearch from './marketplace/AdvancedSearch';
import CategoryFilter, { PRODUCT_CATEGORIES } from './marketplace/CategoryFilter';
import NotificationBell from './marketplace/NotificationBell';

interface MarketItem {
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

const MarketHub = () => {
  const { setActiveModal } = useAppStore();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '4+' | '3+' | 'any'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high' | 'rating'>('recent');
  const [selectedProduct, setSelectedProduct] = useState<MarketItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'dashboard'>('browse');
  const [selectedSeller, setSelectedSeller] = useState<{ id: string; name: string | null; avatar: string | null } | null>(null);

  useEffect(() => {
    fetchMarketplaceItems();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchFavorites();
    }
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchFavorites = async () => {
    if (!currentUserId) return;
    
    const { data } = await supabase
      .from('product_favorites')
      .select('product_id')
      .eq('user_id', currentUserId);
    
    if (data) {
      setFavorites(new Set(data.map(f => f.product_id)));
    }
  };

  const fetchMarketplaceItems = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itemsWithRatings = await Promise.all(
        (data || []).map(async (item) => {
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
      
      setMarketplaceItems(itemsWithRatings);
      setFilteredItems(itemsWithRatings);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    
    if (!currentUserId) {
      toast.error('Faça login para favoritar');
      return;
    }
    
    const isFav = favorites.has(productId);
    const product = marketplaceItems.find(p => p.id === productId);
    
    try {
      if (isFav) {
        await supabase
          .from('product_favorites')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', currentUserId);
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success('Removido dos favoritos');
      } else {
        await supabase
          .from('product_favorites')
          .insert({ product_id: productId, user_id: currentUserId });
        
        // Send notification to seller
        if (product && product.user_id !== currentUserId) {
          await supabase.from('notifications').insert({
            user_id: product.user_id,
            type: 'favorite',
            title: 'Novo favorito!',
            message: `Alguém favoritou seu produto "${product.title}"`,
            data: { product_id: productId }
          });
        }
        
        setFavorites(prev => new Set(prev).add(productId));
        toast.success('Adicionado aos favoritos!');
      }
    } catch {
      toast.error('Erro ao atualizar favoritos');
    }
  };

  useEffect(() => {
    let filtered = [...marketplaceItems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (!item.price) return false;
        if (priceFilter === 'low') return item.price < 50;
        if (priceFilter === 'medium') return item.price >= 50 && item.price < 150;
        if (priceFilter === 'high') return item.price >= 150;
        return true;
      });
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (!item.avg_rating || !item.review_count) return ratingFilter === 'any';
        if (ratingFilter === '4+') return item.avg_rating >= 4;
        if (ratingFilter === '3+') return item.avg_rating >= 3;
        return true;
      });
    }

    if (sortBy === 'price_low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    }

    setFilteredItems(filtered);
  }, [searchQuery, categoryFilter, priceFilter, ratingFilter, sortBy, marketplaceItems]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewSeller = (e: React.MouseEvent, item: MarketItem) => {
    e.stopPropagation();
    setSelectedSeller({
      id: item.user_id,
      name: item.profiles?.display_name || null,
      avatar: item.profiles?.avatar_url || null
    });
  };

  const getCategoryLabel = (value: string | null) => {
    const cat = PRODUCT_CATEGORIES.find(c => c.value === value);
    return cat?.label || 'Outros';
  };

  const featuredItems = filteredItems.filter(item => item.featured);
  const regularItems = filteredItems.filter(item => !item.featured);

  // Seller Profile View
  if (selectedSeller) {
    return (
      <SellerProfile
        sellerId={selectedSeller.id}
        sellerName={selectedSeller.name}
        sellerAvatar={selectedSeller.avatar}
        onClose={() => setSelectedSeller(null)}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />
    );
  }

  // Favorites Tab
  if (activeTab === 'favorites') {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24 animate-fade-in">
        <FavoritesTab 
          onSelectProduct={(product) => setSelectedProduct(product)} 
          onBack={() => setActiveTab('browse')}
        />
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    );
  }

  // Seller Dashboard Tab
  if (activeTab === 'dashboard') {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24 animate-fade-in">
        <SellerDashboard onBack={() => setActiveTab('browse')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 animate-fade-in">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-success/15 via-success/5 to-card px-4 pt-10 pb-5 sticky top-0 z-10 border-b border-border/50 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-success to-success/70 rounded-2xl shadow-lg shadow-success/25">
              <ShoppingBag className="text-success-foreground" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Mercado</h2>
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} produto{filteredItems.length !== 1 ? 's' : ''} disponíveis
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <NotificationBell userId={currentUserId} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('dashboard')}
              className="rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              <LayoutDashboard size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('favorites')}
              className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 relative"
            >
              <Heart size={16} />
              {favorites.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.size}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveModal('sell')}
              className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground rounded-xl px-4 shadow-lg shadow-success/20"
            >
              <Plus size={16} className="mr-1" /> Vender
            </Button>
          </div>
        </div>
        
        {/* Advanced Search */}
        <div className="mb-4">
          <AdvancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Buscar produtos, categorias..."
          />
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          <CategoryFilter
            selected={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
        
        {/* Quick actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            <button
              onClick={() => setSortBy(sortBy === 'rating' ? 'recent' : 'rating')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1 ${
                sortBy === 'rating'
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Star size={10} /> Melhor avaliados
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'price_low' ? 'recent' : 'price_low')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                sortBy === 'price_low'
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Menor preço
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'price_high' ? 'recent' : 'price_high')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                sortBy === 'price_high'
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Maior preço
            </button>
          </div>
          
          {/* View toggle */}
          <div className="flex ml-2 gap-1 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShoppingBag className="text-muted-foreground" size={36} />
            </div>
            <p className="text-foreground font-semibold text-lg mb-1">
              {searchQuery || categoryFilter || priceFilter !== 'all' || ratingFilter !== 'all'
                ? 'Nenhum produto encontrado'
                : 'Nenhum produto disponível'}
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              {searchQuery || categoryFilter || priceFilter !== 'all' || ratingFilter !== 'all'
                ? 'Tente ajustar seus filtros de busca'
                : 'Seja o primeiro a anunciar um produto!'}
            </p>
            <Button
              onClick={() => setActiveModal('sell')}
              className="bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-2xl px-6 shadow-lg shadow-success/20"
            >
              <Plus size={18} className="mr-2" /> Anunciar Produto
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-warning" />
                  <span className="text-sm font-semibold text-foreground">Destaques</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                  {featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-44 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-warning/30 overflow-hidden shadow-lg shadow-warning/10 cursor-pointer hover:scale-[1.02] transition-transform"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="aspect-[4/3] relative bg-muted">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="text-muted-foreground" size={28} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-warning to-warning/80 text-warning-foreground text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> Destaque
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                        <span className="text-base font-bold text-success">R$ {item.price?.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
              {regularItems.map((item) => (
                viewMode === 'grid' ? (
                  <div
                    key={item.id}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:border-border transition-all cursor-pointer group"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <div className="aspect-square relative bg-muted overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <ShoppingBag className="text-muted-foreground" size={36} />
                        </div>
                      )}
                      {/* Category Badge */}
                      {item.category && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-card/90 backdrop-blur-sm text-[10px] font-medium rounded-full text-foreground">
                          {getCategoryLabel(item.category)}
                        </span>
                      )}
                      <button
                        className={`absolute top-2 right-2 p-2 rounded-xl shadow-sm transition-all ${
                          favorites.has(item.id)
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-card/90 backdrop-blur-sm hover:bg-card text-muted-foreground hover:text-destructive'
                        }`}
                        onClick={(e) => toggleFavorite(e, item.id)}
                      >
                        <Heart size={16} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                      </button>
                      {item.review_count && item.review_count > 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-lg flex items-center gap-1 shadow-sm">
                          <Star size={12} className="text-warning fill-warning" />
                          <span className="text-xs font-semibold text-foreground">{item.avg_rating?.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({item.review_count})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                        {item.title}
                      </h4>
                      <button
                        onClick={(e) => handleViewSeller(e, item)}
                        className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2"
                      >
                        <User size={10} />
                        {item.profiles?.display_name || 'Vendedor'}
                      </button>
                      <div className="flex items-center justify-between">
                        {item.price ? (
                          <span className="text-base font-bold text-success">
                            R$ {item.price.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Consultar</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <div className="w-28 h-28 flex-shrink-0 bg-muted relative overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="text-muted-foreground" size={24} />
                        </div>
                      )}
                      {item.review_count && item.review_count > 0 && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-card/90 backdrop-blur-sm rounded-lg flex items-center gap-0.5">
                          <Star size={10} className="text-warning fill-warning" />
                          <span className="text-[10px] font-semibold">{item.avg_rating?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.title}</h4>
                          {item.category && (
                            <span className="px-1.5 py-0.5 bg-muted text-[9px] font-medium rounded text-muted-foreground">
                              {getCategoryLabel(item.category)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleViewSeller(e, item)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <User size={10} />
                          {item.profiles?.display_name || 'Vendedor'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {item.price ? (
                          <span className="text-base font-bold text-success">R$ {item.price.toFixed(0)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Consultar</span>
                        )}
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.has(item.id)
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                          }`}
                          onClick={(e) => toggleFavorite(e, item.id)}
                        >
                          <Heart size={14} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default MarketHub;
