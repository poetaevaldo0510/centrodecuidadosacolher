import { X, Settings, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ACTION_LIBRARY } from '@/lib/data';

const SettingsModal = () => {
  const { userRoutine, setActiveModal, toggleRoutineAction } = useAppStore();

  // For now, default to morning - you could pass this as a prop
  const timeOfDay = 'morning';

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-2xl h-[70vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Settings className="text-muted-foreground" /> Personalizar Rotina
            </h3>
            <p className="text-xs text-muted-foreground">
              Rotina da <b>{timeOfDay === 'morning' ? 'Manhã' : timeOfDay === 'afternoon' ? 'Tarde' : 'Noite'}</b>
            </p>
          </div>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {Object.keys(ACTION_LIBRARY).map((key) => {
            const item = ACTION_LIBRARY[key as keyof typeof ACTION_LIBRARY];
            const isActive = userRoutine[timeOfDay as keyof typeof userRoutine]?.includes(key);
            const Icon = item.icon;
            return (
              <div
                key={key}
                onClick={() => toggleRoutineAction(timeOfDay, key)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isActive
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && <CheckCircle size={18} className="text-primary" />}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setActiveModal(null)}
          className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-bold"
        >
          Concluir
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
