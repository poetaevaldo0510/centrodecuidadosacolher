import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  };

  const subscribeToNewMessages = (userId: string) => {
    if (permission !== 'granted') return () => {};

    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.sender_id)
            .single();

          sendNotification('Nova mensagem!', {
            body: `${sender?.display_name || 'Alguém'} enviou uma mensagem para você`,
            tag: 'chat-message',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMarketplaceActivity = () => {
    if (permission !== 'granted') return () => {};

    const channel = supabase
      .channel('marketplace-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_items',
        },
        async (payload) => {
          const { data: seller } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.user_id)
            .single();

          sendNotification('Novo produto no mercado!', {
            body: `${seller?.display_name || 'Alguém'} adicionou: ${payload.new.title}`,
            tag: 'marketplace',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToCalendarReminders = (userId: string) => {
    if (permission !== 'granted') return () => {};

    const channel = supabase
      .channel('calendar-reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const event = payload.new;
            
            // Check if event needs a reminder
            if (event.remind_before_minutes > 0 && !event.completed) {
              const eventTime = new Date(event.start_time);
              const reminderTime = new Date(eventTime.getTime() - event.remind_before_minutes * 60000);
              const now = new Date();
              
              // If reminder time is in the future but close, schedule notification
              const timeDiff = reminderTime.getTime() - now.getTime();
              if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
                setTimeout(() => {
                  sendNotification(`Lembrete: ${event.title}`, {
                    body: `Em ${event.remind_before_minutes} minutos - ${event.event_type === 'medication' ? 'Medicação' : event.event_type === 'appointment' ? 'Consulta' : 'Terapia'}`,
                    tag: `reminder-${event.id}`,
                    requireInteraction: true,
                  });
                }, timeDiff);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    subscribeToNewMessages,
    subscribeToMarketplaceActivity,
    subscribeToCalendarReminders,
  };
};
