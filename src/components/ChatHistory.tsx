import { useState, useEffect } from 'react';
import { MessageCircle, User, ChevronRight, ShoppingBag, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  productTitle?: string;
  productImage?: string;
}

const ChatHistory = () => {
  const { openMarketplaceChat } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Get all messages where the user is sender or receiver
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, {
        messages: typeof messages;
        partnerId: string;
      }>();

      messages?.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, { messages: [], partnerId });
        }
        conversationMap.get(partnerId)!.messages.push(msg);
      });

      // Build conversation list with partner profiles
      const conversationList: Conversation[] = [];

      for (const [partnerId, data] of conversationMap.entries()) {
        // Fetch partner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', partnerId)
          .single();

        // Check for product context in first message
        const lastMessage = data.messages[0];
        let productTitle: string | undefined;
        let productImage: string | undefined;

        // Extract product info from message if present
        const productMatch = lastMessage.message.match(/\[Sobre: (.+?)\]/);
        if (productMatch) {
          productTitle = productMatch[1];
        }

        // Count unread messages
        const unreadCount = data.messages.filter(
          (m) => m.receiver_id === user.id && !m.read
        ).length;

        conversationList.push({
          id: partnerId,
          partnerId,
          partnerName: profile?.display_name || 'Usuário',
          partnerAvatar: profile?.avatar_url || null,
          lastMessage: lastMessage.message.replace(/\[Sobre: .+?\]\s*/, ''),
          lastMessageTime: lastMessage.created_at,
          unreadCount,
          productTitle,
          productImage,
        });
      }

      // Sort by last message time
      conversationList.sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conversation: Conversation) => {
    openMarketplaceChat(conversation.partnerId, conversation.productTitle ? {
      id: '',
      title: conversation.productTitle,
      price: null,
      image_url: conversation.productImage || null
    } : null as any);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="text-muted-foreground" size={32} />
        </div>
        <h3 className="font-bold text-foreground mb-2">Nenhuma conversa</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Suas conversas com vendedores e compradores do marketplace aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => handleOpenChat(conversation)}
          className="w-full bg-card border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {conversation.partnerAvatar ? (
                <img
                  src={conversation.partnerAvatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-primary" />
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold text-foreground truncate">
                {conversation.partnerName}
              </span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                <Clock size={10} />
                {formatTime(conversation.lastMessageTime)}
              </span>
            </div>
            
            {conversation.productTitle && (
              <div className="flex items-center gap-1 text-[10px] text-primary mb-0.5">
                <ShoppingBag size={10} />
                <span className="truncate">{conversation.productTitle}</span>
              </div>
            )}
            
            <p className={`text-xs truncate ${
              conversation.unreadCount > 0 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground'
            }`}>
              {conversation.lastMessage}
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
        </button>
      ))}
    </div>
  );
};

export default ChatHistory;
