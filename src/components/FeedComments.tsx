import { useState, useEffect } from 'react';
import { Send, Trash2, Reply, AtSign, Flag, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ReportContentModal from './modals/ReportContentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Comment {
  id: string;
  anonymous_name: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  mentioned_user_id: string | null;
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
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; commentId: string }>({ isOpen: false, commentId: '' });

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
          content: newComment.trim(),
          parent_id: replyingTo?.id || null,
          mentioned_user_id: replyingTo?.user_id || null
        });

      if (error) throw error;
      
      setNewComment('');
      setReplyingTo(null);
      loadComments();
      onCommentAdded?.();
      toast.success(replyingTo ? 'Resposta adicionada!' : 'Comentário adicionado!');
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

  // Organize comments into threads
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const mentionedComment = comment.mentioned_user_id 
      ? comments.find(c => c.user_id === comment.mentioned_user_id)
      : null;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className="flex gap-2 items-start">
          <div className={`${isReply ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'} bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
            {comment.anonymous_name.charAt(0)}
          </div>
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`${isReply ? 'text-[10px]' : 'text-xs'} font-bold text-foreground`}>
                {comment.anonymous_name}
              </span>
              {mentionedComment && (
                <span className="text-[10px] text-primary flex items-center gap-0.5">
                  <AtSign size={10} />
                  {mentionedComment.anonymous_name}
                </span>
              )}
              <span className={`${isReply ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                {getTimeAgo(comment.created_at)}
              </span>
            </div>
            <p className={`${isReply ? 'text-xs' : 'text-sm'} text-foreground`}>{comment.content}</p>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={() => {
                  setReplyingTo(comment);
                  setNewComment('');
                }}
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                title="Responder"
              >
                <Reply size={14} />
              </button>
            )}
            {user && comment.user_id === user.id && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            {user && comment.user_id !== user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setReportModal({ isOpen: true, commentId: comment.id })}
                    className="text-destructive focus:text-destructive"
                  >
                    <Flag size={12} className="mr-2" />
                    Denunciar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {replies.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Carregando...</div>;
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      {/* Comments List */}
      {rootComments.map(comment => renderComment(comment))}

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg text-xs">
          <Reply size={12} className="text-primary" />
          <span className="text-muted-foreground">
            Respondendo a <span className="font-bold text-primary">{replyingTo.anonymous_name}</span>
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Comment */}
      {user && (
        <div className="flex gap-2 items-center">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? `Responder a ${replyingTo.anonymous_name}...` : "Escreva um comentário de apoio..."}
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

      {/* Report Modal */}
      <ReportContentModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, commentId: '' })}
        contentId={reportModal.commentId}
        contentType="comment"
      />
    </div>
  );
};

export default FeedComments;
