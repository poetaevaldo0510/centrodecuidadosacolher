import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatModal = () => {
  const { setActiveModal, chatUser } = useAppStore();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sending, sendMessage } = useRealtimeChat(chatUser);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(message);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 animate-slide-in-from-bottom">
      <div className="bg-card w-full max-w-md rounded-2xl flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div>
            <h3 className="font-bold text-lg text-foreground">Chat</h3>
            <p className="text-xs text-muted-foreground">Conversa com mãe da comunidade</p>
          </div>
          <button onClick={() => setActiveModal(null)}>
            <X />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma mensagem ainda.</p>
              <p className="text-xs mt-1">Envie a primeira mensagem!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs opacity-70 mb-1">
                        {msg.profiles?.display_name || 'Usuário'}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !message.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
