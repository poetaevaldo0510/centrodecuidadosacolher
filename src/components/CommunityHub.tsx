import { Users, Zap, Heart, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { suggestedMoms } from '@/lib/data';

const CommunityHub = () => {
  const { setActiveModal, setChatUser } = useAppStore();

  return (
    <div className="px-4 pt-12 pb-24 space-y-6 bg-background min-h-screen animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Users className="text-primary" /> Minha Tribo
      </h2>
      
      <div
        className="bg-gradient-to-r from-accent to-pink-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer"
        onClick={() => setActiveModal('sos')}
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Heart size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-warning fill-current animate-pulse" size={20} />
            <h2 className="font-bold text-lg">SOS Mãe Exausta</h2>
          </div>
          <p className="text-white/90 text-sm mb-4">
            No limite? Fala agora com uma "Mãe Madrinha".
          </p>
          <button className="bg-white text-accent px-6 py-3 rounded-full text-sm font-bold shadow-sm w-full">
            Pedir Ajuda Agora
          </button>
        </div>
      </div>

      {suggestedMoms.map((mom) => (
        <div
          key={mom.id}
          className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4 mb-3"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {mom.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">{mom.name}</h4>
            <p className="text-xs text-muted-foreground">{mom.matchParams.join(" • ")}</p>
          </div>
          <button
            onClick={() => {
              setChatUser(mom);
              setActiveModal('chat');
            }}
            className="text-primary bg-primary/10 p-2 rounded-full"
          >
            <MessageCircle size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CommunityHub;
