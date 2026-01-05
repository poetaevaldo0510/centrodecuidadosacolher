import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Heart, Share2, User, Send, ArrowLeft, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { toast } from 'sonner';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductReview {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

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
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'reviews'>('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading: chatLoading, sending, sendMessage } = useRealtimeChat(product?.user_id || null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (product?.id) {
      fetchProductImages();
      fetchReviews();
      if (currentUserId) {
        checkFavoriteStatus();
      }
    }
  }, [product?.id, currentUserId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchProductImages = async () => {
    if (!product?.id) return;
    
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order', { ascending: true });
    
    if (data && data.length > 0) {
      setProductImages(data);
    } else if (product.image_url) {
      setProductImages([{ id: 'main', image_url: product.image_url, display_order: 0 }]);
    }
  };

  const fetchReviews = async () => {
    if (!product?.id) return;
    setReviewsLoading(true);
    
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Fetch profiles for each review
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', review.user_id)
            .single();
          return { ...review, profiles: profileData };
        })
      );
      
      setReviews(reviewsWithProfiles);
      
      // Check if current user has a review
      if (currentUserId) {
        const existing = reviewsWithProfiles.find(r => r.user_id === currentUserId);
        if (existing) {
          setUserReview(existing);
          setNewRating(existing.rating);
          setNewComment(existing.comment || '');
        }
      }
    }
    setReviewsLoading(false);
  };

  const checkFavoriteStatus = async () => {
    if (!product?.id || !currentUserId) return;
    
    const { data } = await supabase
      .from('product_favorites')
      .select('id')
      .eq('product_id', product.id)
      .eq('user_id', currentUserId)
      .maybeSingle();
    
    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!currentUserId) {
      toast.error('Faça login para favoritar');
      return;
    }
    if (!product?.id) return;
    
    setFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        await supabase
          .from('product_favorites')
          .delete()
          .eq('product_id', product.id)
          .eq('user_id', currentUserId);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await supabase
          .from('product_favorites')
          .insert({ product_id: product.id, user_id: currentUserId });
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos!');
      }
    } catch {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const submitReview = async () => {
    if (!currentUserId) {
      toast.error('Faça login para avaliar');
      return;
    }
    if (!product?.id) return;
    
    if (currentUserId === product.user_id) {
      toast.error('Você não pode avaliar seu próprio produto');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({ rating: newRating, comment: newComment || null })
          .eq('id', userReview.id);
        
        if (error) throw error;
        toast.success('Avaliação atualizada!');
      } else {
        // Create new review
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            product_id: product.id,
            user_id: currentUserId,
            rating: newRating,
            comment: newComment || null,
          });
        
        if (error) throw error;
        
        // Send notification to seller
        if (product.user_id !== currentUserId) {
          await supabase.from('notifications').insert({
            user_id: product.user_id,
            type: 'review',
            title: 'Nova avaliação!',
            message: `Seu produto "${product.title}" recebeu uma avaliação de ${newRating} estrelas`,
            data: { product_id: product.id, rating: newRating }
          });
        }
        
        toast.success('Avaliação enviada!');
      }
      
      fetchReviews();
    } catch {
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async () => {
    if (!userReview) return;
    
    try {
      await supabase
        .from('product_reviews')
        .delete()
        .eq('id', userReview.id);
      
      setUserReview(null);
      setNewRating(5);
      setNewComment('');
      toast.success('Avaliação removida');
      fetchReviews();
    } catch {
      toast.error('Erro ao remover avaliação');
    }
  };

  if (!product) return null;

  const images = productImages.length > 0 
    ? productImages.map(img => img.image_url) 
    : product.image_url ? [product.image_url] : [];

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

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

  const renderStars = (rating: number, interactive: boolean = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={interactive ? 24 : 14}
              className={star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'}
            />
          </button>
        ))}
      </div>
    );
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
              onClick={toggleFavorite}
              disabled={favoriteLoading}
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
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'reviews'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Star size={14} />
            Avaliações ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'chat'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            <MessageCircle size={14} />
            Chat
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
                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-xl">
                        {images.slice(0, 5).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-colors ${
                              idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {images.length > 5 && (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{images.length - 5}
                          </div>
                        )}
                      </div>
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
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-foreground">{product.title}</h2>
                  </div>
                  {/* Rating summary */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(Math.round(averageRating))}
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''})
                      </span>
                    </div>
                  )}
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
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {product.profiles?.avatar_url ? (
                      <img
                        src={product.profiles.avatar_url}
                        alt="Vendedor"
                        className="w-full h-full object-cover"
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
          ) : activeTab === 'reviews' ? (
            // Reviews Tab
            <div className="p-4 space-y-4">
              {/* Review Form */}
              {currentUserId && currentUserId !== product.user_id && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">
                    {userReview ? 'Editar sua avaliação' : 'Deixe sua avaliação'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Nota:</span>
                    {renderStars(newRating, true, setNewRating)}
                    <span className="text-sm font-medium text-foreground ml-2">{newRating}/5</span>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva seu comentário (opcional)..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={submitReview}
                      disabled={submittingReview}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                    >
                      {submittingReview ? 'Enviando...' : userReview ? 'Atualizar' : 'Enviar'}
                    </Button>
                    {userReview && (
                      <Button
                        variant="outline"
                        onClick={deleteReview}
                        className="rounded-xl text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="text-muted-foreground" size={28} />
                  </div>
                  <p className="text-foreground font-medium mb-1">Sem avaliações</p>
                  <p className="text-xs text-muted-foreground">
                    Seja o primeiro a avaliar este produto!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {review.profiles?.avatar_url ? (
                            <img
                              src={review.profiles.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground text-sm truncate">
                              {review.profiles?.display_name || 'Usuário'}
                              {review.user_id === currentUserId && (
                                <span className="text-xs text-primary ml-2">(você)</span>
                              )}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <div className="mt-1">
                            {renderStars(review.rating)}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Chat Tab
            <div className="flex flex-col h-full min-h-[400px]">
              {/* Seller Header in Chat */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {product.profiles?.avatar_url ? (
                      <img
                        src={product.profiles.avatar_url}
                        alt="Vendedor"
                        className="w-full h-full object-cover"
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