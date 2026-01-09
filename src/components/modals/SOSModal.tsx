import { Phone } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ModalBase from './ModalBase';

const SOSModal = () => {
  const { setActiveModal } = useAppStore();

  return (
    <ModalBase variant="fullscreen" title="" showCloseButton={false}>
      <div className="text-white text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse mx-auto">
          <Phone size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">SOS Acolher</h2>
        <p className="text-xl font-medium mb-8">Conectando com Psicóloga...</p>
        <button
          onClick={() => setActiveModal(null)}
          className="bg-white text-accent px-8 py-3 rounded-full font-bold hover:bg-white/90 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </ModalBase>
  );
};

export default SOSModal;
