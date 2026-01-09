import { useState } from 'react';
import { BookHeart, Smile, Sun, Moon, CloudRain } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ModalBase from './ModalBase';

const JournalModal = () => {
  const [noteInput, setNoteInput] = useState("");
  const [journalMood, setJournalMood] = useState('neutral');
  const { addLog, triggerReward, setActiveModal } = useAppStore();

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
    { id: 'good', icon: Smile, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'neutral', icon: Sun, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { id: 'tired', icon: Moon, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'bad', icon: CloudRain, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ];

  return (
    <ModalBase
      title="Diário da Mãe"
      icon={<BookHeart className="text-purple-500" />}
      variant="purple"
    >
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
        className="w-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
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
    </ModalBase>
  );
};

export default JournalModal;
