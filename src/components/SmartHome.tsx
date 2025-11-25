import { useState } from 'react';
import { Coins, Sparkles, Zap, Settings, PlusCircle, BookHeart, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ACTION_LIBRARY } from '@/lib/data';

const SmartHome = () => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const {
    userName,
    childName,
    points,
    userRoutine,
    setActiveModal,
    setSelectedAction,
  } = useAppStore();

  const getHeaderStyle = () => {
    if (timeOfDay === 'morning') return 'bg-gradient-morning';
    if (timeOfDay === 'afternoon') return 'bg-gradient-afternoon';
    return 'bg-gradient-night';
  };

  const openLogModal = (actionKey: string) => {
    const actionData = ACTION_LIBRARY[actionKey as keyof typeof ACTION_LIBRARY];
    if (!actionData) return;
    setSelectedAction({ ...actionData, type: actionKey });
    setActiveModal('log');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className={`p-6 rounded-b-[40px] shadow-lg transition-all duration-500 relative overflow-hidden text-white ${getHeaderStyle()}`}>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-bold text-xl uppercase">
              {(userName || "M").charAt(0)}
            </div>
            <div>
              <p className="text-xs opacity-80">Olá, {userName || "Mãe"}</p>
              <h1 className="text-xl font-bold">Vamos cuidar?</h1>
            </div>
          </div>
          <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Coins className="text-warning fill-warning" size={14} />
            <span className="text-xs font-bold">{points}</span>
          </div>
        </div>

        <div className="relative z-10 bg-black/20 p-1 rounded-full w-max mx-auto backdrop-blur-md flex gap-1 mt-2 mb-4">
          <button
            onClick={() => setTimeOfDay('morning')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              timeOfDay === 'morning'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Manhã
          </button>
          <button
            onClick={() => setTimeOfDay('afternoon')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              timeOfDay === 'afternoon'
                ? 'bg-white text-warning font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Tarde
          </button>
          <button
            onClick={() => setTimeOfDay('night')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all ${
              timeOfDay === 'night'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Noite
          </button>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles size={16} className="text-warning" /> Dica:
          </p>
          <p className="text-xs opacity-90 mt-1">
            "Mantenha a rotina visual sempre à vista do {childName}."
          </p>
        </div>
      </div>

      <div className="px-5 -mt-2 space-y-6">
        {/* AI Insight */}
        <div
          className="bg-card p-4 rounded-2xl shadow-lg border-l-4 border-l-destructive border-y border-r border-border flex gap-3 items-start animate-pulse cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setActiveModal('report')}
        >
          <div className="bg-red-100 p-2 rounded-full text-destructive shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-destructive uppercase tracking-wide">
              Padrão Detectado
            </h3>
            <p className="text-sm text-card-foreground leading-relaxed mt-1">
              Atenção: Notamos um padrão. A agitação do {childName} aumenta 40min após tomar a medicação da manhã.
            </p>
            <p className="text-xs text-primary font-bold mt-2">Ver relatório →</p>
          </div>
        </div>

        {/* Journal Card */}
        <div
          className="bg-card p-1 rounded-2xl shadow-md border border-border cursor-pointer"
          onClick={() => setActiveModal('journal')}
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl flex justify-between items-center group hover:shadow-sm transition-all">
            <div>
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <BookHeart size={14} /> Diário Emocional
              </h3>
              <p className="text-sm font-bold text-foreground">Como você está se sentindo?</p>
            </div>
            <div className="bg-white p-2 rounded-full text-purple-400 group-hover:text-purple-600">
              <PlusCircle size={24} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="flex justify-between items-end mb-3 ml-1">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Zap size={16} className="text-primary" /> Ações para{' '}
              {timeOfDay === 'morning' ? 'a Manhã' : timeOfDay === 'afternoon' ? 'a Tarde' : 'a Noite'}
            </h3>
            <button
              onClick={() => setActiveModal('settings')}
              className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 flex items-center gap-1"
            >
              <Settings size={12} /> Personalizar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(userRoutine[timeOfDay] || []).map((actionKey, i) => {
              const action = ACTION_LIBRARY[actionKey as keyof typeof ACTION_LIBRARY];
              if (!action) return null;
              return (
                <button
                  key={i}
                  onClick={() => openLogModal(actionKey)}
                  className={`${action.color} border p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 bg-opacity-50 hover:bg-opacity-100 transition-all`}
                >
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <action.icon size={24} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">{action.label}</span>
                </button>
              );
            })}
            {(!userRoutine[timeOfDay] || userRoutine[timeOfDay].length === 0) && (
              <div className="col-span-2 text-center p-4 text-sm text-muted-foreground italic border border-dashed border-border rounded-2xl">
                Nenhuma ação configurada. Clique em personalizar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHome;
