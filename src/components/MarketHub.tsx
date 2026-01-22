import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Heart, Star, Sparkles, Grid3X3, List, User, LayoutDashboard, Search, SlidersHorizontal, ChevronRight, TrendingUp, Percent, Truck, Shield, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ProductDetailModal from './modals/ProductDetailModal';
import FavoritesTab from './marketplace/FavoritesTab';
import SellerProfile from './marketplace/SellerProfile';
import SellerDashboard from './marketplace/SellerDashboard';
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
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-muted/30 pb-24 animate-fade-in">
      {/* Shopee-style Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent sticky top-0 z-20">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-primary-foreground">Mercado</h1>
          <div className="flex items-center gap-2">
            <NotificationBell userId={currentUserId} />
            <button
              onClick={() => setActiveTab('favorites')}
              className="relative p-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              <Heart size={20} />
              {favorites.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="p-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar no Mercado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-lg bg-background border-0 text-sm shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-lg transition-colors ${
                showFilters ? 'bg-background text-primary' : 'bg-primary-foreground/20 text-primary-foreground'
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border-b border-border p-4 animate-slide-in-from-top">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-foreground">Filtros</span>
            <button onClick={() => setShowFilters(false)} className="text-muted-foreground">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Sort */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Ordenar por</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'recent', label: 'Recentes' },
                  { value: 'price_low', label: 'Menor preço' },
                  { value: 'price_high', label: 'Maior preço' },
                  { value: 'rating', label: 'Avaliação' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as typeof sortBy)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      sortBy === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Faixa de preço</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'low', label: 'Até R$50' },
                  { value: 'medium', label: 'R$50-150' },
                  { value: 'high', label: 'Acima R$150' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriceFilter(opt.value as typeof priceFilter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      priceFilter === opt.value
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Avaliação mínima</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: '4+', label: '4+ ⭐' },
                  { value: '3+', label: '3+ ⭐' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRatingFilter(opt.value as typeof ratingFilter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      ratingFilter === opt.value
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Scroll */}
      <div className="bg-card border-b border-border px-4 py-3">
        <CategoryFilter
          selected={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Benefits Banner */}
      <div className="bg-card border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-2.5 border-r border-border min-w-max">
            <Truck size={16} className="text-primary" />
            <span className="text-xs text-foreground font-medium">Entrega Rápida</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 border-r border-border min-w-max">
            <Shield size={16} className="text-success" />
            <span className="text-xs text-foreground font-medium">Compra Segura</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 border-r border-border min-w-max">
            <Percent size={16} className="text-destructive" />
            <span className="text-xs text-foreground font-medium">Ofertas</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 min-w-max">
            <TrendingUp size={16} className="text-warning" />
            <span className="text-xs text-foreground font-medium">Mais Vendidos</span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle & Results Count */}
      <div className="flex items-center justify-between px-4 py-2 bg-background">
        <span className="text-xs text-muted-foreground">
          {filteredItems.length} produto{filteredItems.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-2 pb-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-muted-foreground" size={36} />
            </div>
            <p className="text-foreground font-semibold text-lg mb-1">
              {searchQuery || categoryFilter ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || categoryFilter ? 'Tente ajustar sua busca' : 'Seja o primeiro a anunciar!'}
            </p>
            <Button
              onClick={() => setActiveModal('sell')}
              className="bg-primary text-primary-foreground rounded-lg px-6"
            >
              <Plus size={18} className="mr-2" /> Anunciar Produto
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Featured Products Carousel */}
            {featuredItems.length > 0 && (
              <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl p-3 mx-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-warning" />
                  <span className="text-sm font-bold text-foreground">🔥 Produtos em Destaque</span>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto" />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-36 bg-card rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow border border-warning/20"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="aspect-square relative bg-muted">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="text-muted-foreground" size={24} />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-warning text-warning-foreground text-[9px] font-bold rounded">
                          DESTAQUE
                        </div>
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium text-xs line-clamp-2 text-foreground mb-1">{item.title}</h4>
                        <span className="text-sm font-bold text-primary">
                          R$ {item.price?.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2 px-2' : 'space-y-2 px-2'}>
              {regularItems.map((item) => (
                viewMode === 'grid' ? (
                  // Grid Card - Shopee Style
                  <div
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-border/50"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <div className="aspect-square relative bg-muted">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <ShoppingBag className="text-muted-foreground" size={32} />
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          favorites.has(item.id)
                            ? 'bg-destructive text-destructive-foreground shadow-md'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        onClick={(e) => toggleFavorite(e, item.id)}
                      >
                        <Heart size={14} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                      </button>

                      {/* Discount Badge (if any) */}
                      {item.featured && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-destructive/90 to-destructive/0 py-1 px-2">
                          <span className="text-[10px] font-bold text-white">OFERTA</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2.5">
                      <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1.5 min-h-[32px]">
                        {item.title}
                      </h4>
                      
                      {/* Price */}
                      <div className="mb-1.5">
                        <span className="text-base font-bold text-primary">
                          R$ {item.price?.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Rating & Sales */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {item.review_count && item.review_count > 0 ? (
                          <div className="flex items-center gap-0.5">
                            <Star size={10} className="text-warning fill-warning" />
                            <span>{item.avg_rating?.toFixed(1)}</span>
                            <span className="text-muted-foreground/70">({item.review_count})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">Novo</span>
                        )}
                        <span className="text-muted-foreground/40">|</span>
                        <button
                          onClick={(e) => handleViewSeller(e, item)}
                          className="hover:text-primary transition-colors truncate max-w-[80px]"
                        >
                          {item.profiles?.display_name || 'Loja'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List Card - Mercado Livre Style
                  <div
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex border border-border/50"
                    onClick={() => setSelectedProduct(item)}
                  >
                    <div className="w-28 h-28 flex-shrink-0 bg-muted relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="text-muted-foreground" size={24} />
                        </div>
                      )}
                      <button
                        className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center ${
                          favorites.has(item.id)
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-black/40 text-white'
                        }`}
                        onClick={(e) => toggleFavorite(e, item.id)}
                      >
                        <Heart size={12} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">{item.title}</h4>
                        <button
                          onClick={(e) => handleViewSeller(e, item)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <User size={10} />
                          {item.profiles?.display_name || 'Vendedor'}
                        </button>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-lg font-bold text-primary block">
                            R$ {item.price?.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[10px] text-success font-medium">Frete grátis</span>
                        </div>
                        {item.review_count && item.review_count > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star size={12} className="text-warning fill-warning" />
                            <span className="font-medium">{item.avg_rating?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Sell Button */}
      <button
        onClick={() => setActiveModal('sell')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-30 hover:bg-primary/90 transition-colors active:scale-95"
      >
        <Plus size={24} />
      </button>

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