import { useState, useEffect } from 'react';
import { Users, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const CommunityHub = () => {
  const { setActiveModal, setChatUser } = useAppStore();
  const [suggestedMoms, setSuggestedMoms] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedMoms();
  }, []);

  const fetchSuggestedMoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .limit(5);

      if (error) throw error;
      setSuggestedMoms(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (userId: string) => {
    setChatUser(userId);
    setActiveModal('chat');
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-fade-in">
      <div className="bg-card px-6 pt-12 pb-6 shadow-sm z-10 sticky top-0">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="text-purple-600" /> Minha Tribo
        </h2>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        {/* SOS Mãe Exausta */}
        <div
          onClick={() => setActiveModal('sos')}
          className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform border-2 border-pink-200"
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
          <h3 className="font-bold text-foreground mb-3">Conecte-se com Mães</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : suggestedMoms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mãe disponível ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedMoms.map((mom) => (
                <div
                  key={mom.id}
                  className="bg-card p-4 rounded-2xl shadow-sm border border-border flex gap-4 items-center"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                    {mom.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">
                      {mom.display_name || 'Usuária'}
                    </h4>
                    <p className="text-xs text-muted-foreground">Mãe da comunidade</p>
                  </div>
                  <button
                    onClick={() => handleStartChat(mom.id)}
                    className="bg-primary text-primary-foreground p-3 rounded-xl hover:scale-105 transition"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
