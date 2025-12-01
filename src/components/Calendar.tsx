import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Bell, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar as CalendarUI } from './ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { format, isSameDay, startOfDay, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'appointment' | 'medication' | 'therapy' | 'other';
  start_time: string;
  end_time: string | null;
  location: string | null;
  remind_before_minutes: number;
  completed: boolean;
  recurrence: string | null;
}

const CalendarComponent = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const setActiveModal = useAppStore(state => state.setActiveModal);
  const { subscribeToCalendarReminders } = usePushNotifications();

  useEffect(() => {
    if (user) {
      fetchEvents();
      setupEventReminders();
      
      // Subscribe to calendar reminders via push notifications
      const unsubscribe = subscribeToCalendarReminders(user.id);
      return () => unsubscribe();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as CalendarEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupEventReminders = () => {
    const checkReminders = async () => {
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        const eventTime = new Date(event.start_time);
        const reminderTime = new Date(eventTime.getTime() - event.remind_before_minutes * 60000);
        return !event.completed && isAfter(eventTime, now) && isBefore(reminderTime, now);
      });

      upcomingEvents.forEach(event => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Lembrete: ${event.title}`, {
            body: `Em ${event.remind_before_minutes} minutos`,
            icon: '/favicon.ico',
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  };

  const handleAddEvent = () => {
    setActiveModal('addEvent');
  };

  const toggleEventComplete = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ completed: !currentStatus })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(e => 
        e.id === eventId ? { ...e, completed: !currentStatus } : e
      ));

      toast({
        title: 'Sucesso',
        description: !currentStatus ? 'Evento marcado como concluído' : 'Evento reaberto',
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o evento',
        variant: 'destructive',
      });
    }
  };

  const selectedDayEvents = events.filter(event =>
    isSameDay(new Date(event.start_time), selectedDate)
  );

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'medication': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'therapy': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment': return 'Consulta';
      case 'medication': return 'Medicação';
      case 'therapy': return 'Terapia';
      default: return 'Outro';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Calendário</h1>
            <p className="text-muted-foreground">Organize compromissos e medicações</p>
          </div>
          <Button onClick={handleAddEvent} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardContent className="p-4">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum evento neste dia</p>
                  </div>
                ) : (
                  selectedDayEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={`p-4 ${event.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {getEventTypeLabel(event.event_type)}
                            </Badge>
                            {event.completed && (
                              <Badge variant="outline">Concluído</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground">
                            {event.title}
                          </h3>
                        </div>
                        <input
                          type="checkbox"
                          checked={event.completed}
                          onChange={() => toggleEventComplete(event.id, event.completed)}
                          className="w-5 h-5 rounded border-border"
                        />
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.start_time), 'HH:mm')}
                          {event.end_time && ` - ${format(new Date(event.end_time), 'HH:mm')}`}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}

                        {event.remind_before_minutes > 0 && (
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Lembrete {event.remind_before_minutes} min antes
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
