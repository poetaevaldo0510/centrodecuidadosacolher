import { Settings, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ACTION_LIBRARY } from '@/lib/data';
import ModalBase from './ModalBase';

const SettingsModal = () => {
  const { userRoutine, setActiveModal, toggleRoutineAction } = useAppStore();

  const timeOfDay = 'morning';

  return (
    <ModalBase
      title="Personalizar Rotina"
      icon={<Settings className="text-muted-foreground" />}
    >
      <p className="text-xs text-muted-foreground mb-4">
        Rotina da <b>{timeOfDay === 'morning' ? 'Manhã' : timeOfDay === 'afternoon' ? 'Tarde' : 'Noite'}</b>
      </p>
      <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 mb-4">
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
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold"
      >
        Concluir
      </button>
    </ModalBase>
  );
};

export default SettingsModal;
