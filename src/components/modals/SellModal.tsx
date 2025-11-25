import { X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const SellModal = () => {
  const { setActiveModal, addMarketItem, triggerReward } = useAppStore();

  const handleSellProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: Date.now(),
      title: formData.get('title') as string,
      price: `R$ ${formData.get('price')}`,
      author: "Você",
      category: "Novo",
      sales: 0,
      imageColor: "bg-emerald-100",
    };
    addMarketItem(newItem);
    setActiveModal(null);
    triggerReward("Produto anunciado com sucesso!", 50);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 animate-slide-in-from-bottom">
      <div className="bg-card w-full max-w-md rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-foreground">Anunciar Produto</h3>
          <button onClick={() => setActiveModal(null)}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSellProduct} className="space-y-4">
          <input
            name="title"
            required
            placeholder="Título do Produto"
            className="w-full bg-muted border border-border rounded-lg p-3 outline-none focus:border-primary"
          />
          <input
            name="price"
            type="number"
            required
            placeholder="Preço (R$)"
            className="w-full bg-muted border border-border rounded-lg p-3 outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full bg-success text-success-foreground py-3 rounded-xl font-bold"
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
