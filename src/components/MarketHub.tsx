import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, MessageCircle, Heart, Eye } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface MarketItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
  featured: boolean | null;
  profiles: {
    display_name: string | null;
  } | null;
}

const MarketHub = () => {
  const { setActiveModal, triggerReward } = useAppStore();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_low' | 'price_high'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  const fetchMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarketplaceItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
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

    if (priceFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (!item.price) return false;
        if (priceFilter === 'low') return item.price < 50;
        if (priceFilter === 'medium') return item.price >= 50 && item.price < 150;
        if (priceFilter === 'high') return item.price >= 150;
        return true;
      });
    }

    if (sortBy === 'price_low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setFilteredItems(filtered);
  }, [searchQuery, priceFilter, sortBy, marketplaceItems]);

  const priceFilters = [
    { value: 'all', label: 'Todos' },
    { value: 'low', label: '< R$50' },
    { value: 'medium', label: 'R$50-150' },
    { value: 'high', label: '> R$150' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recentes' },
    { value: 'price_low', label: '↑ Preço' },
    { value: 'price_high', label: '↓ Preço' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header - Compacto para mobile */}
      <div className="bg-gradient-to-br from-success/10 via-card to-card px-4 pt-10 pb-4 sticky top-0 z-10 border-b border-border">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-success/20 rounded-xl">
              <ShoppingBag className="text-success" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Mercado</h2>
              <p className="text-[10px] text-muted-foreground">
                {filteredItems.length} produto{filteredItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveModal('sell')}
            className="bg-success hover:bg-success/90 text-white rounded-xl px-4"
          >
            <Plus size={16} className="mr-1" /> Vender
          </Button>
        </div>
        
        {/* Search - Mais compacto */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-success/50"
          />
        </div>
        
        {/* Filters - Scroll horizontal com chips menores */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {priceFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setPriceFilter(filter.value as any)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                priceFilter === filter.value
                  ? 'bg-success text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <div className="w-px bg-border mx-1 flex-shrink-0" />
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as any)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                sortBy === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content - Grid otimizado para mobile */}
      <div className="flex-1 p-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="text-muted-foreground" size={32} />
            </div>
            <p className="text-foreground font-medium mb-1">
              {searchQuery || priceFilter !== 'all'
                ? 'Nenhum produto encontrado'
                : 'Nenhum produto disponível'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {searchQuery || priceFilter !== 'all'
                ? 'Tente outros filtros'
                : 'Seja o primeiro a vender!'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('sell')}
              className="rounded-xl"
            >
              <Plus size={14} className="mr-1" /> Anunciar Produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Imagem do produto */}
                <div className="aspect-square relative bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="text-muted-foreground" size={32} />
                    </div>
                  )}
                  {item.featured && (
                    <span className="absolute top-2 left-2 bg-warning text-warning-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Destaque
                    </span>
                  )}
                  {/* Quick action button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-card transition-colors"
                    onClick={() => triggerReward("Adicionado aos favoritos!", 2)}
                  >
                    <Heart size={14} className="text-muted-foreground" />
                  </button>
                </div>
                
                {/* Info do produto */}
                <div className="p-2.5">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1 mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">
                    {item.profiles?.display_name || 'Vendedor'}
                  </p>
                  <div className="flex items-center justify-between">
                    {item.price ? (
                      <span className="text-sm font-bold text-success">
                        R$ {item.price.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Consultar</span>
                    )}
                    <button
                      className="p-1.5 bg-success/10 hover:bg-success/20 rounded-lg transition-colors"
                      onClick={() => {
                        triggerReward("Interesse registrado!", 5);
                        toast.success('Vendedor notificado!');
                      }}
                    >
                      <MessageCircle size={14} className="text-success" />
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

export default MarketHub;
