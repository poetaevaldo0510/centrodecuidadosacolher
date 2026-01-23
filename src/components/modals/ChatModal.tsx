import { useState, useEffect, useRef } from 'react';
import { X, Send, ShoppingBag, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatModal = () => {
  const { setActiveModal, chatUser, chatProduct, setChatProduct } = useAppStore();
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string>('Vendedor');
  const [sellerAvatar, setSellerAvatar] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sending, sendMessage } = useRealtimeChat(chatUser);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    // Fetch seller profile info
    if (chatUser) {
      supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', chatUser)
        .single()
        .then(({ data }) => {
          if (data) {
            setSellerName(data.display_name || 'Vendedor');
            setSellerAvatar(data.avatar_url);
          }
        });
    }
  }, [chatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    setActiveModal(null);
    setChatProduct(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // If this is the first message and we have a product context, prepend product info
    let messageToSend = message;
    if (messages.length === 0 && chatProduct) {
      messageToSend = `[Sobre: ${chatProduct.title}] ${message}`;
    }

    await sendMessage(messageToSend);
    setMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl flex flex-col h-[85vh] sm:h-[600px] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {sellerAvatar ? (
                <img src={sellerAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{sellerName}</h3>
              <p className="text-xs text-muted-foreground">
                {chatProduct ? 'Negociação em andamento' : 'Chat'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Product Context Card */}
        {chatProduct && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 bg-card rounded-xl p-2.5 border border-border/50">
              <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {chatProduct.image_url ? (
                  <img 
                    src={chatProduct.image_url} 
                    alt={chatProduct.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {chatProduct.title}
                </p>
                {chatProduct.price && (
                  <p className="text-sm font-bold text-success">
                    R$ {chatProduct.price.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Send className="text-muted-foreground" size={24} />
              </div>
              <p className="font-medium text-foreground mb-1">Inicie a conversa</p>
              <p className="text-xs">
                {chatProduct 
                  ? `Tire suas dúvidas sobre "${chatProduct.title}"`
                  : 'Envie a primeira mensagem!'
                }
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_id === currentUserId;
              const showDate = idx === 0 || 
                formatDate(msg.created_at) !== formatDate(messages[idx - 1].created_at);
              
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs opacity-70 mb-1 font-medium">
                          {msg.profiles?.display_name || sellerName}
                        </p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={chatProduct ? "Faça uma oferta ou tire dúvidas..." : "Digite sua mensagem..."}
              disabled={sending}
              className="rounded-xl"
            />
            <Button 
              type="submit" 
              disabled={sending || !message.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
