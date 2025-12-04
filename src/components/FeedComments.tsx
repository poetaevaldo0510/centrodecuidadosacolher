import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Comment {
  id: string;
  anonymous_name: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface FeedCommentsProps {
  postId: string;
  onCommentAdded?: () => void;
}

const anonymousNames = [
  'Amigo Anônimo', 'Apoiador', 'Companheiro', 'Ouvinte', 'Aliado',
  'Coração Bondoso', 'Mente Positiva', 'Luz Gentil', 'Alma Solidária'
];

const FeedComments = ({ postId, onCommentAdded }: FeedCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setPosting(true);
    try {
      const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
      
      const { error } = await supabase
        .from('feed_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          anonymous_name: randomName,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
      loadComments();
      onCommentAdded?.();
      toast.success('Comentário adicionado!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao comentar');
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('feed_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {/* Comments List */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 items-start">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {comment.anonymous_name.charAt(0)}
          </div>
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-foreground">{comment.anonymous_name}</span>
              <span className="text-xs text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground">{comment.content}</p>
          </div>
          {user && comment.user_id === user.id && (
            <button
              onClick={() => deleteComment(comment.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      {/* Add Comment */}
      {user && (
        <div className="flex gap-2 items-center">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário de apoio..."
            className="flex-1 text-sm h-9"
            maxLength={300}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
          />
          <Button
            onClick={addComment}
            disabled={!newComment.trim() || posting}
            size="sm"
            className="h-9 px-3"
          >
            <Send size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedComments;
