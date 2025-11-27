import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketItem {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  user_id: string;
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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (!item.price) return false;
        if (priceFilter === 'low') return item.price < 50;
        if (priceFilter === 'medium') return item.price >= 50 && item.price < 150;
        if (priceFilter === 'high') return item.price >= 150;
        return true;
      });
    }

    setFilteredItems(filtered);
  }, [searchQuery, priceFilter, marketplaceItems]);

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-fade-in">
      <div className="bg-card px-6 pt-12 pb-6 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="text-success" /> Mercado
          </h2>
          <button
            onClick={() => setActiveModal('sell')}
            className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold shadow hover:bg-primary/90"
          >
            + Vender
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                priceFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPriceFilter('low')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                priceFilter === 'low'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Até R$ 50
            </button>
            <button
              onClick={() => setPriceFilter('medium')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                priceFilter === 'medium'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              R$ 50 - R$ 150
            </button>
            <button
              onClick={() => setPriceFilter('high')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                priceFilter === 'high'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Acima de R$ 150
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>
              {searchQuery || priceFilter !== 'all'
                ? 'Nenhum produto encontrado com os filtros selecionados.'
                : 'Nenhum produto disponível ainda.'}
            </p>
            {!searchQuery && priceFilter === 'all' && (
              <p className="text-xs mt-1">Seja o primeiro a vender!</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground">
                {searchQuery || priceFilter !== 'all' ? 'Resultados' : 'Destaques'}
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredItems.length} produto{filteredItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-card p-3 rounded-2xl shadow-sm border border-border flex gap-4 items-center mb-3"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                    <ShoppingBag size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    por {item.profiles?.display_name || 'Vendedor'}
                  </p>
                  {item.price && (
                    <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                      R$ {item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  className="bg-foreground text-background p-2 rounded-lg hover:scale-105 transition"
                  onClick={() => triggerReward("Interesse registrado!", 5)}
                >
                  <ShoppingBag size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHub;
