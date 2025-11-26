import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMarketplaceItems(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-fade-in">
      <div className="bg-card px-6 pt-12 pb-6 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center">
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
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : marketplaceItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto disponível ainda.</p>
            <p className="text-xs mt-1">Seja o primeiro a vender!</p>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-foreground mb-3">Destaques</h3>
            {marketplaceItems.map((item) => (
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
