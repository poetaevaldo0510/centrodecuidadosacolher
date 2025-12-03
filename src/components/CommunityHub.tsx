import { useState, useEffect } from 'react';
import { Users, MessageCircle, Search, Newspaper, UserPlus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import SocialFeed from './SocialFeed';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const CommunityHub = () => {
  const { setActiveModal, setChatUser } = useAppStore();
  const [suggestedMoms, setSuggestedMoms] = useState<Profile[]>([]);
  const [filteredMoms, setFilteredMoms] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'connect'>('feed');

  useEffect(() => {
    fetchSuggestedMoms();
  }, []);

  const fetchSuggestedMoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '');

      if (error) throw error;
      setSuggestedMoms(data || []);
      setFilteredMoms(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = suggestedMoms.filter((mom) =>
        mom.display_name?.toLowerCase().includes(query)
      );
      setFilteredMoms(filtered);
    } else {
      setFilteredMoms(suggestedMoms);
    }
  }, [searchQuery, suggestedMoms]);

  const handleStartChat = (userId: string) => {
    setChatUser(userId);
    setActiveModal('chat');
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-fade-in">
      {/* Tabs */}
      <div className="bg-card px-4 pt-12 pb-4 shadow-sm z-10 sticky top-0 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Users className="text-purple-600" /> Minha Tribo
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'feed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Newspaper size={16} /> Feed Social
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'connect'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <UserPlus size={16} /> Conectar
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <SocialFeed />
      ) : (
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* SOS Mãe Exausta */}
          <div
            onClick={() => setActiveModal('sos')}
            className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-blue-900/30 p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform border-2 border-pink-200 dark:border-pink-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">🆘</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">SOS Mãe Exausta</h3>
                <p className="text-xs text-muted-foreground">
                  Precisa de ajuda? Clique aqui para apoio imediato.
                </p>
              </div>
            </div>
          </div>

          {/* Mães Sugeridas */}
          <div>
            <h3 className="font-bold text-foreground mb-3 text-lg">Conecte-se com Mães</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Buscar mães..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredMoms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery
                    ? 'Nenhuma mãe encontrada com esse nome.'
                    : 'Nenhuma mãe disponível ainda.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMoms.map((mom) => (
                  <div
                    key={mom.id}
                    className="bg-card p-4 rounded-2xl shadow-sm border border-border flex gap-4 items-center hover:shadow-md transition-shadow"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-bold text-white text-lg">
                      {mom.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-base">
                        {mom.display_name || 'Usuária'}
                      </h4>
                      <p className="text-sm text-muted-foreground">Mãe da comunidade</p>
                    </div>
                    <button
                      onClick={() => handleStartChat(mom.id)}
                      className="bg-primary text-primary-foreground p-3 rounded-xl hover:scale-105 transition shadow-md"
                    >
                      <MessageCircle size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
