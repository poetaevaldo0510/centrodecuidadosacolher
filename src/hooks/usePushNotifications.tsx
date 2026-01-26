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
      .channel('new-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          // Don't notify for messages sent by the current user
          if (payload.new.sender_id === userId) return;
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.sender_id)
            .single();

          const senderName = sender?.display_name || 'Alguém';
          
          // Check if message has product context
          const productMatch = payload.new.message?.match(/\[Sobre: (.+?)\]/);
          const productInfo = productMatch ? ` sobre "${productMatch[1]}"` : '';

          sendNotification('💬 Nova mensagem!', {
            body: `${senderName} enviou uma mensagem${productInfo}`,
            tag: `chat-message-${payload.new.id}`,
            requireInteraction: true,
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

    // Use edge function to check reminders periodically
    const checkReminders = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('push-notifications', {
          body: { action: 'check_reminders', userId }
        });

        if (error) {
          console.error('Error checking reminders:', error);
          return;
        }

        // Send notifications for upcoming events
        data?.notifications?.forEach((notification: any) => {
          if (notification.minutesUntil <= 30 && notification.minutesUntil > 0) {
            sendNotification(notification.title, {
              body: notification.body,
              tag: `reminder-${notification.id}`,
              requireInteraction: true,
            });
          }
        });
      } catch (err) {
        console.error('Error in reminder check:', err);
      }
    };

    // Check immediately
    checkReminders();

    // Check every 5 minutes
    const intervalId = setInterval(checkReminders, 5 * 60 * 1000);

    // Also subscribe to realtime changes for immediate reminders
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
            const event = payload.new as any;
            
            // Check if event needs a reminder
            if (event.remind_before_minutes > 0 && !event.completed) {
              const eventTime = new Date(event.start_time);
              const reminderTime = new Date(eventTime.getTime() - event.remind_before_minutes * 60000);
              const now = new Date();
              
              // If reminder time is in the future but close, schedule notification
              const timeDiff = reminderTime.getTime() - now.getTime();
              if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
                setTimeout(() => {
                  const typeLabels: Record<string, string> = {
                    medication: '💊 Medicação',
                    therapy: '🧩 Terapia',
                    appointment: '📅 Consulta'
                  };
                  sendNotification(`Lembrete: ${event.title}`, {
                    body: `Em ${event.remind_before_minutes} minutos - ${typeLabels[event.event_type] || '⏰ Evento'}`,
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
      clearInterval(intervalId);
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
