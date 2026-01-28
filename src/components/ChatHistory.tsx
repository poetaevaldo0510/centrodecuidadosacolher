import { useState, useEffect, useMemo } from 'react';
import { MessageCircle, User, ChevronRight, ShoppingBag, Clock, Trash2, MoreVertical, Search, X, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow, format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete || !currentUserId) return;
    
    setDeleting(true);
    try {
      // Delete all messages in this conversation where user is sender or receiver
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conversationToDelete.partnerId}),and(sender_id.eq.${conversationToDelete.partnerId},receiver_id.eq.${currentUserId})`);

      if (error) throw error;

      toast.success('Conversa excluída com sucesso');
      setConversations(prev => prev.filter(c => c.id !== conversationToDelete.id));
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast.error('Erro ao excluir conversa');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
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

  // Filter conversations based on search and date filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Search by name or product
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower) {
        const matchesName = conv.partnerName.toLowerCase().includes(searchLower);
        const matchesProduct = conv.productTitle?.toLowerCase().includes(searchLower);
        const matchesMessage = conv.lastMessage.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesProduct && !matchesMessage) {
          return false;
        }
      }

      // Filter by date range
      const messageDate = new Date(conv.lastMessageTime);
      if (dateFrom && isBefore(messageDate, startOfDay(dateFrom))) {
        return false;
      }
      if (dateTo && isAfter(messageDate, endOfDay(dateTo))) {
        return false;
      }

      return true;
    });
  }, [conversations, searchQuery, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchQuery || dateFrom || dateTo;

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
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, produto ou mensagem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters Toggle */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter size={14} />
              Filtros de data
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              )}
            </span>
            <ChevronRight size={14} className={cn("transition-transform", filtersOpen && "rotate-90")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal">
                  <Calendar size={14} className="mr-2" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal">
                  <Calendar size={14} className="mr-2" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive">
                <X size={14} className="mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Count */}
      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground">
          {filteredConversations.length} de {conversations.length} conversas
        </p>
      )}

      {/* Empty filtered state */}
      {filteredConversations.length === 0 && hasActiveFilters && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="text-muted-foreground" size={24} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Nenhum resultado</h3>
          <p className="text-xs text-muted-foreground">
            Tente ajustar os filtros de busca
          </p>
          <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
            Limpar filtros
          </Button>
        </div>
      )}
      {/* Conversations List */}
      <div className="space-y-2">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="w-full bg-card border border-border rounded-xl p-3 hover:bg-muted/50 transition-colors text-left flex items-center gap-3 group"
          >
            {/* Clickable area */}
            <button
              onClick={() => handleOpenChat(conversation)}
              className="flex items-center gap-3 flex-1 min-w-0"
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
              <div className="flex-1 min-w-0 text-left">
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
            </button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={16} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={(e) => handleDeleteClick(e as any, conversation)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={14} className="mr-2" />
                  Excluir conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Arrow */}
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir toda a conversa com{' '}
              <strong>{conversationToDelete?.partnerName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatHistory;
