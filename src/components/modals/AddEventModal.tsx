import { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const AddEventModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const setActiveModal = useAppStore(state => state.setActiveModal);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'appointment' as 'appointment' | 'medication' | 'therapy' | 'other',
    start_time: '',
    end_time: '',
    location: '',
    remind_before_minutes: 30,
    recurrence: 'none',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.start_time || !user) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          event_type: formData.event_type,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          location: formData.location || null,
          remind_before_minutes: formData.remind_before_minutes,
          recurrence: formData.recurrence,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Evento adicionado com sucesso',
      });

      setActiveModal(null);
      window.location.reload(); // Refresh to show new event
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o evento',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Adicionar Evento</h3>
          <button onClick={() => setActiveModal(null)} className="p-1 bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Consulta com neurologista"
            />
          </div>

          {/* Event Type */}
          <div>
            <Label htmlFor="event_type">Tipo *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Consulta</SelectItem>
                <SelectItem value="medication">Medicação</SelectItem>
                <SelectItem value="therapy">Terapia</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Time */}
          <div>
            <Label htmlFor="start_time">Data e Hora de Início *</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>

          {/* End Time */}
          <div>
            <Label htmlFor="end_time">Data e Hora de Término</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Hospital São Lucas"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes adicionais..."
              rows={3}
            />
          </div>

          {/* Reminder */}
          <div>
            <Label htmlFor="remind_before_minutes">Lembrar com antecedência</Label>
            <Select
              value={formData.remind_before_minutes.toString()}
              onValueChange={(value) => setFormData({ ...formData, remind_before_minutes: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem lembrete</SelectItem>
                <SelectItem value="15">15 minutos antes</SelectItem>
                <SelectItem value="30">30 minutos antes</SelectItem>
                <SelectItem value="60">1 hora antes</SelectItem>
                <SelectItem value="1440">1 dia antes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence */}
          <div>
            <Label htmlFor="recurrence">Repetir</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não repetir</SelectItem>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="monthly">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Evento
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
