import { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ModalBase from './ModalBase';

const LogModal = () => {
  const [noteInput, setNoteInput] = useState("");
  const { selectedAction, setActiveModal, addLog, triggerReward } = useAppStore();

  if (!selectedAction) return null;

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      const { error } = await supabase.from('logs').insert({
        user_id: user.id,
        title: selectedAction.label,
        type: selectedAction.type,
        description: noteInput || null,
        date: new Date().toISOString(),
      });

      if (error) throw error;

      const newLog = {
        id: Date.now(),
        action: selectedAction.label,
        type: selectedAction.type,
        note: noteInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
      };
      addLog(newLog);
      
      triggerReward(`${selectedAction.label} registrado!`, 15);
      setActiveModal(null);
      setNoteInput("");
    } catch (error: any) {
      toast.error('Erro ao salvar registro');
    }
  };

  const Icon = selectedAction.icon;

  return (
    <ModalBase
      title={`Registrar ${selectedAction.label}`}
      icon={<Icon className="text-primary" />}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Horário</label>
          <div className="flex items-center gap-2 bg-muted p-3 rounded-xl border border-border mt-1">
            <Clock size={18} className="text-muted-foreground" />
            <span className="font-mono text-sm font-bold text-foreground">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Observações</label>
          <textarea
            autoFocus
            rows={3}
            className="w-full bg-muted border border-border rounded-xl p-3 mt-1 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Detalhes..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} /> Confirmar
        </button>
      </div>
    </ModalBase>
  );
};

export default LogModal;
