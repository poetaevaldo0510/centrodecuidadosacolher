import { useState, useEffect } from 'react';
import { Coins, Sparkles, Zap, Settings, PlusCircle, BookHeart, AlertTriangle, Flame, Target } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ACTION_LIBRARY } from '@/lib/data';
import WeatherWidget from './WeatherWidget';

const SmartHome = () => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const {
    userName,
    childName,
    points,
    streak,
    dailyGoal,
    completedToday,
    userRoutine,
    setActiveModal,
    setSelectedAction,
    incrementCompletedToday,
    checkStreak,
    triggerReward,
  } = useAppStore();

  useEffect(() => {
    checkStreak();
  }, []);

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
    
    // Reward points and increment counter
    incrementCompletedToday();
    triggerReward('Ação registrada!', 10);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className={`p-6 pb-8 rounded-b-[40px] shadow-lg transition-all duration-500 relative overflow-hidden text-white ${getHeaderStyle()}`}>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-bold text-2xl uppercase shadow-lg">
              {(userName || "M").charAt(0)}
            </div>
            <div>
              <p className="text-sm opacity-90">Olá, {userName || "Mãe"} 👋</p>
              <h1 className="text-2xl font-bold">Vamos cuidar?</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
              <Coins className="text-warning fill-warning" size={16} />
              <span className="text-sm font-bold">{points}</span>
            </div>
            <div className="bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
              <Flame className="text-orange-400" size={16} />
              <span className="text-sm font-bold">{streak} dias</span>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="relative z-10 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Target size={16} className="text-warning" /> Meta Diária
            </p>
            <span className="text-sm font-bold">{completedToday}/{dailyGoal}</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-warning h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((completedToday / dailyGoal) * 100, 100)}%` }}
            />
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

      <div className="px-4 space-y-4">
        {/* Weather Widget */}
        <WeatherWidget />
        {/* AI Insight */}
        <div
          className="bg-card p-5 rounded-2xl shadow-lg border-l-4 border-l-destructive border-y border-r border-border flex gap-4 items-start cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
          onClick={() => setActiveModal('report')}
        >
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl text-destructive shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-destructive uppercase tracking-wide mb-1">
              🔍 Padrão Detectado
            </h3>
            <p className="text-sm text-card-foreground leading-relaxed">
              Atenção: A agitação do {childName} aumenta 40min após tomar a medicação da manhã.
            </p>
            <p className="text-xs text-primary font-bold mt-3 flex items-center gap-1">
              Ver relatório completo →
            </p>
          </div>
        </div>

        {/* Journal Card */}
        <div
          className="bg-card p-1 rounded-2xl shadow-md border border-border cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => setActiveModal('journal')}
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl flex justify-between items-center group">
            <div>
              <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <BookHeart size={18} /> Diário Emocional
              </h3>
              <p className="text-base font-bold text-foreground">Como você está se sentindo hoje?</p>
            </div>
            <div className="bg-white dark:bg-purple-900/50 p-3 rounded-full text-purple-400 group-hover:text-purple-600 transition-colors">
              <PlusCircle size={28} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap size={20} className="text-primary" /> 
              {timeOfDay === 'morning' ? '🌅 Manhã' : timeOfDay === 'afternoon' ? '☀️ Tarde' : '🌙 Noite'}
            </h3>
            <button
              onClick={() => setActiveModal('settings')}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl border border-primary/20 flex items-center gap-1 hover:bg-primary/20 transition-colors"
            >
              <Settings size={14} /> Editar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(userRoutine[timeOfDay] || []).map((actionKey, i) => {
              const action = ACTION_LIBRARY[actionKey as keyof typeof ACTION_LIBRARY];
              if (!action) return null;
              return (
                <button
                  key={i}
                  onClick={() => openLogModal(actionKey)}
                  className={`${action.color} border-2 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md active:scale-95 hover:shadow-xl transition-all hover:scale-105`}
                >
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                    <action.icon size={28} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-white">{action.label}</span>
                </button>
              );
            })}
            {(!userRoutine[timeOfDay] || userRoutine[timeOfDay].length === 0) && (
              <div className="col-span-2 text-center p-6 text-sm text-muted-foreground italic border-2 border-dashed border-border rounded-2xl bg-muted/30">
                Nenhuma ação configurada. Clique em Editar para personalizar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHome;
