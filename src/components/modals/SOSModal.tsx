import { Phone } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const SOSModal = () => {
  const { setActiveModal } = useAppStore();

  return (
    <div className="fixed inset-0 z-[80] bg-accent text-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Phone size={48} />
      </div>
      <h2 className="text-3xl font-bold mb-2">SOS Acolher</h2>
      <p className="text-xl font-medium mb-8">Conectando com Psicóloga...</p>
      <button
        onClick={() => setActiveModal(null)}
        className="bg-white text-accent px-8 py-3 rounded-full font-bold"
      >
        Cancelar
      </button>
    </div>
  );
};

export default SOSModal;
