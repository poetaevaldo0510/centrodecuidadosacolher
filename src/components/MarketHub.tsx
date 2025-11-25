import { ShoppingBag } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const MarketHub = () => {
  const { marketplaceItems, setActiveModal, triggerReward } = useAppStore();

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
        <div>
          <h3 className="font-bold text-foreground mb-3">Destaques</h3>
          {marketplaceItems.map((item) => (
            <div
              key={item.id}
              className="bg-card p-3 rounded-2xl shadow-sm border border-border flex gap-4 items-center mb-3"
            >
              <div className={`w-16 h-16 ${item.imageColor} rounded-xl flex items-center justify-center text-slate-400`}>
                <ShoppingBag size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mb-1">por {item.author}</p>
                <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                  {item.price}
                </span>
              </div>
              <button
                className="bg-foreground text-background p-2 rounded-lg"
                onClick={() => triggerReward("Adicionado ao carrinho!", 5)}
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketHub;
