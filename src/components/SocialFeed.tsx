import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Users, Sparkles, Plus, ChevronDown, ChevronUp, Search, Flag, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import FeedComments from './FeedComments';
import ReportContentModal from './modals/ReportContentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface FeedPost {
  id: string;
  anonymous_name: string;
  content: string;
  achievement_type: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  hasLiked?: boolean;
  showComments?: boolean;
}

const anonymousNames = [
  'Mãe Coragem', 'Pai Herói', 'Guerreira', 'Anjo Protetor', 'Luz do Dia',
  'Força Interior', 'Coração Forte', 'Alma Guerreira', 'Super Cuidador',
  'Estrela Guia', 'Raio de Sol', 'Borboleta', 'Flor do Campo'
];

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; postId: string }>({ isOpen: false, postId: '' });

  useEffect(() => {
    loadPosts();
  }, [user]);

  useEffect(() => {
    let filtered = [...posts];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(query) ||
        post.anonymous_name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    setFilteredPosts(filtered);
  }, [posts, searchQuery, sortBy]);

  const loadPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('social_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Check which posts the user has liked
      if (user && postsData) {
        const { data: likesData } = await supabase
          .from('feed_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);
        
        setPosts(postsData.map(post => ({
          ...post,
          hasLiked: likedPostIds.has(post.id)
        })));
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newContent.trim()) return;
    
    setPosting(true);
    try {
      const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
      
      const { error } = await supabase
        .from('social_feed')
        .insert({
          user_id: user.id,
          anonymous_name: randomName,
          content: newContent.trim(),
          achievement_type: 'share'
        });

      if (error) throw error;
      
      toast.success('Experiência compartilhada! 🎉');
      setNewContent('');
      setShowNewPost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao compartilhar');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, hasLiked: boolean) => {
    if (!user) return;
    
    try {
      if (hasLiked) {
        await supabase
          .from('feed_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('feed_likes')
          .insert({ post_id: postId, user_id: user.id });
      }
      
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-b-[40px] text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Comunidade</h1>
            <p className="text-sm opacity-90">Compartilhe suas experiências anonimamente</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowNewPost(true)}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
        >
          <Plus size={18} className="mr-2" />
          Compartilhar Experiência
        </Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Buscar publicações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'recent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Mais Recentes
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'popular'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Mais Populares
            </button>
          </div>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="bg-card p-5 rounded-2xl border border-border shadow-lg animate-scale-in">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="text-purple-500" size={18} />
              Nova Publicação Anônima
            </h3>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Compartilhe sua experiência, vitória ou dica com outras famílias..."
              className="min-h-[100px] mb-3"
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setShowNewPost(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={createPost}
                disabled={!newContent.trim() || posting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Send size={16} className="mr-2" />
                {posting ? 'Enviando...' : 'Compartilhar'}
              </Button>
            </div>
          </div>
        )}

        {/* Posts */}
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {post.anonymous_name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-sm">{post.anonymous_name}</p>
                <p className="text-xs text-muted-foreground">{getTimeAgo(post.created_at)}</p>
              </div>
              {post.achievement_type && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                  {post.achievement_type === 'share' ? '💬 Experiência' : '🏆 Conquista'}
                </span>
              )}
              {user && post.user_id !== user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setReportModal({ isOpen: true, postId: post.id })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Flag size={14} className="mr-2" />
                      Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <p className="text-sm text-foreground leading-relaxed mb-4">{post.content}</p>
            
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <button
                onClick={() => toggleLike(post.id, post.hasLiked || false)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  post.hasLiked 
                    ? 'text-pink-500 font-bold' 
                    : 'text-muted-foreground hover:text-pink-500'
                }`}
              >
                <Heart size={18} fill={post.hasLiked ? 'currentColor' : 'none'} />
                {post.likes_count > 0 && post.likes_count}
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle size={18} />
                {post.comments_count > 0 && post.comments_count}
                {post.showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            {/* Comments Section */}
            {post.showComments && (
              <FeedComments 
                postId={post.id} 
                onCommentAdded={loadPosts}
              />
            )}
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">
              {searchQuery ? 'Nenhuma publicação encontrada.' : 'Nenhuma publicação ainda.'}
            </p>
            {!searchQuery && <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar!</p>}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportContentModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, postId: '' })}
        contentId={reportModal.postId}
        contentType="post"
      />
    </div>
  );
};

export default SocialFeed;
