import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ProfessionalRatingProps {
  professionalId: string;
  professionalName: string;
  onClose?: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

const ProfessionalRating = ({ professionalId, professionalName, onClose }: ProfessionalRatingProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && professionalId) {
      loadExistingReview();
    }
  }, [user, professionalId]);

  const loadExistingReview = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_reviews')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setExistingReview(data);
        setRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (error) {
      console.error('Error loading review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        const { error } = await supabase
          .from('professional_reviews')
          .update({
            rating,
            comment: comment.trim() || null
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        toast.success('Avaliação atualizada!');
      } else {
        const { error } = await supabase
          .from('professional_reviews')
          .insert({
            professional_id: professionalId,
            user_id: user.id,
            rating,
            comment: comment.trim() || null
          });

        if (error) throw error;
        toast.success('Avaliação enviada!');
      }

      onClose?.();
    } catch (error: any) {
      console.error('Error saving review:', error);
      toast.error(error.message || 'Erro ao salvar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-2xl border border-border/50 space-y-4">
      <div className="text-center">
        <h3 className="font-bold text-foreground mb-1">
          {existingReview ? 'Atualizar Avaliação' : 'Avaliar Profissional'}
        </h3>
        <p className="text-sm text-muted-foreground">{professionalName}</p>
      </div>

      {/* Star Rating */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {rating === 1 && 'Ruim'}
          {rating === 2 && 'Regular'}
          {rating === 3 && 'Bom'}
          {rating === 4 && 'Muito Bom'}
          {rating === 5 && 'Excelente'}
        </p>
      )}

      {/* Comment */}
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deixe um comentário (opcional)..."
        rows={3}
        className="resize-none"
      />

      {/* Actions */}
      <div className="flex gap-2">
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="flex-1"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={16} className="mr-2" />
              {existingReview ? 'Atualizar' : 'Enviar'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalRating;