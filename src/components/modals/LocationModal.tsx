import { X, MapPin, Phone, Clock, Star, Navigation } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const LocationModal = () => {
  const { selectedLocation, setActiveModal, triggerReward } = useAppStore();

  if (!selectedLocation) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block ${
                selectedLocation.free ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              {selectedLocation.type}
            </span>
            <h3 className="font-bold text-xl text-foreground leading-tight">{selectedLocation.name}</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" /> {selectedLocation.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} className="text-primary" /> {selectedLocation.phone}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={16} className="text-primary" /> {selectedLocation.hours}
          </p>
          <div className="flex items-center gap-1 mt-2 text-warning font-bold">
            <Star size={16} fill="currentColor" /> {selectedLocation.rating} (Avaliado por mães)
          </div>
        </div>
        <button
          onClick={() => {
            triggerReward("Rota iniciada!", 10);
            setActiveModal(null);
          }}
          className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90"
        >
          <Navigation size={18} /> Traçar Rota (GPS)
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
