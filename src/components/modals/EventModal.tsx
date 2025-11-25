import { X, Calendar } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const EventModal = () => {
  const { selectedEvent, setActiveModal, triggerReward } = useAppStore();

  if (!selectedEvent) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="bg-primary/10 p-3 rounded-xl text-center min-w-[60px] h-min">
              <span className="block text-xs font-bold text-primary/60">{selectedEvent.month}</span>
              <span className="block text-2xl font-bold text-primary">{selectedEvent.day}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground leading-tight">{selectedEvent.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{selectedEvent.loc}</p>
            </div>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{selectedEvent.desc}</p>
        <button
          onClick={() => {
            triggerReward("Interesse registrado!", 20);
            setActiveModal(null);
          }}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90"
        >
          <Calendar size={18} /> Inscrever-se / Saiba Mais
        </button>
      </div>
    </div>
  );
};

export default EventModal;
