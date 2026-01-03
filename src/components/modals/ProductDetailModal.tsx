import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle, Heart, Share2, User, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    image_url: string | null;
    user_id: string;
    featured: boolean | null;
    profiles: {
      display_name: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
  onClose: () => void;
}

const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading: chatLoading, sending, sendMessage } = useRealtimeChat(product?.user_id || null);

  // Mock gallery - in real app, this would come from a product_images table
  const images = product?.image_url ? [product.image_url] : [];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!product) return null;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % Math.max(images.length, 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Confira: ${product.title} - R$ ${product.price?.toFixed(2)}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    if (!currentUserId) {
      toast.error('Faça login para enviar mensagens');
      return;
    }

    if (currentUserId === product.user_id) {
      toast.error('Você não pode enviar mensagem para si mesmo');
      return;
    }

    await sendMessage(messageInput);
    setMessageInput('');
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

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'bg-destructive/10 text-destructive' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            <MessageCircle size={16} />
            Chat com Vendedor
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="flex flex-col">
              {/* Image Gallery */}
              <div className="relative aspect-square bg-muted">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-lg"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full shadow-lg"
                        >
                          <ChevronRight size={20} />
                        </button>
                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex ? 'bg-primary' : 'bg-card/60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="w-20 h-20 bg-muted-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl">📦</span>
                      </div>
                      <p className="text-sm">Sem imagem</p>
                    </div>
                  </div>
                )}

                {product.featured && (
                  <span className="absolute top-4 left-4 bg-warning text-warning-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Destaque
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{product.title}</h2>
                  {product.price ? (
                    <p className="text-2xl font-bold text-success">
                      R$ {product.price.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-lg text-muted-foreground">Consultar preço</p>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {product.profiles?.avatar_url ? (
                      <img
                        src={product.profiles.avatar_url}
                        alt="Vendedor"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {product.profiles?.display_name || 'Vendedor'}
                    </p>
                    <p className="text-xs text-muted-foreground">Vendedor verificado</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="bg-success hover:bg-success/90 text-white rounded-xl"
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Contato
                  </Button>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat Tab
            <div className="flex flex-col h-full min-h-[400px]">
              {/* Seller Header in Chat */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {product.profiles?.avatar_url ? (
                      <img
                        src={product.profiles.avatar_url}
                        alt="Vendedor"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={18} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {product.profiles?.display_name || 'Vendedor'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sobre: {product.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="text-muted-foreground" size={28} />
                    </div>
                    <p className="text-foreground font-medium mb-1">Inicie uma conversa</p>
                    <p className="text-xs text-muted-foreground">
                      Tire suas dúvidas sobre o produto
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
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
                          <div
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted text-foreground rounded-bl-md'
                              }`}
                            >
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
                    })}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                    className="bg-primary hover:bg-primary/90 rounded-xl w-10 h-10"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
