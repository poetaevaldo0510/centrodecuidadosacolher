import { useState } from 'react';
import { Map, MapPin, Star, HeartHandshake, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { nearbyServices, eventsAgenda } from '@/lib/data';

const ExploreMap = () => {
  const [mapFilter, setMapFilter] = useState<'all' | 'ong' | 'health' | 'leisure'>('all');
  const { setSelectedLocation, setSelectedEvent, setActiveModal, triggerReward } = useAppStore();

  const filteredServices = nearbyServices.filter((s) =>
    mapFilter === 'all' ? true : mapFilter === 'ong' ? s.type === 'ONG' : mapFilter === 'health' ? s.type === 'Saúde' : s.type === 'Lazer'
  );

  return (
    <div className="flex flex-col h-screen pb-20 bg-background animate-fade-in">
      <div className="bg-slate-200 h-2/3 relative w-full flex items-center justify-center text-slate-400">
        <Map size={64} className="opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
        <div
          className="absolute top-1/3 left-1/2 -ml-4 -mt-8 flex flex-col items-center cursor-pointer"
          onClick={() => triggerReward("Local encontrado!", 10)}
        >
          <MapPin size={32} className="text-primary animate-bounce-soft" fill="currentColor" />
        </div>
      </div>
      <div className="bg-card rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-10 relative z-10 flex-1 p-6 overflow-y-auto">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6"></div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setMapFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              mapFilter === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setMapFilter('ong')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
              mapFilter === 'ong' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}
          >
            <HeartHandshake size={12} /> ONGs & Apoio
          </button>
          <button
            onClick={() => setMapFilter('health')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              mapFilter === 'health' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}
          >
            Saúde
          </button>
          <button
            onClick={() => setMapFilter('leisure')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              mapFilter === 'leisure' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}
          >
            Lazer
          </button>
        </div>

        <div className="space-y-3 pb-10">
          <h3 className="font-bold text-foreground text-sm">
            {mapFilter === 'ong' ? 'Apoio Gratuito & ONGs' : 'Locais Próximos'}
          </h3>
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => {
                setSelectedLocation(service);
                setActiveModal('location');
              }}
              className="flex justify-between items-center py-3 border-b border-border last:border-0 group cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2"
            >
              <div className="flex-1">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                  {service.name}
                  {service.type === 'ONG' && <HeartHandshake size={14} className="text-primary" />}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-muted-foreground" /> {service.address}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {service.dist} • {service.type}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs font-bold text-warning">
                  <span className="text-foreground">{service.rating}</span> <Star size={10} fill="currentColor" />
                </div>
                {service.free && (
                  <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded font-bold">
                    Gratuito
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {mapFilter === 'all' && (
          <>
            <div className="flex justify-between items-center mb-4 pt-4 border-t border-border">
              <h2 className="text-xl font-bold">Agenda Inclusiva 2025</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">Oficial</span>
            </div>
            <div className="space-y-3 mb-6">
              {eventsAgenda.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedEvent(evt);
                    setActiveModal('event');
                  }}
                  className="flex gap-4 p-3 rounded-xl border border-border bg-card items-center hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="bg-muted p-2 rounded-lg text-center min-w-[50px]">
                    <span className="block text-xs font-bold text-muted-foreground">{evt.month}</span>
                    <span className="block text-2xl font-bold text-primary">{evt.day}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{evt.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {evt.loc} • {evt.dist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreMap;
