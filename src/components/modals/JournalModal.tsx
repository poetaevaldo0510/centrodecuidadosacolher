import { useState } from 'react';
import { X, BookHeart, Smile, Sun, Moon, CloudRain } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const JournalModal = () => {
  const [noteInput, setNoteInput] = useState("");
  const [journalMood, setJournalMood] = useState('neutral');
  const { setActiveModal, addLog, triggerReward } = useAppStore();

  const handleSave = () => {
    const newLog = {
      id: Date.now(),
      action: "Diário da Mãe",
      type: "mom_journal",
      note: noteInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      mood: journalMood,
    };
    addLog(newLog);
    triggerReward("Desabafo guardado. 💜", 20);
    setActiveModal(null);
    setNoteInput("");
  };

  const moods = [
    { id: 'good', icon: Smile, color: 'bg-green-100 text-green-600' },
    { id: 'neutral', icon: Sun, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'tired', icon: Moon, color: 'bg-blue-100 text-blue-600' },
    { id: 'bad', icon: CloudRain, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-primary/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom border-t-4 border-purple-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-purple-700 flex items-center gap-2">
            <BookHeart className="text-purple-500" /> Diário da Mãe
          </h3>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-between mb-6 bg-muted p-3 rounded-xl">
          {moods.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setJournalMood(m.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  journalMood === m.id ? 'opacity-100 scale-110' : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.color}`}>
                  <Icon size={24} />
                </div>
              </button>
            );
          })}
        </div>
        <textarea
          autoFocus
          rows={4}
          className="w-full bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
          placeholder="Desabafe aqui... (Privado)"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default JournalModal;
