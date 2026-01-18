import { useState, useEffect } from 'react';
import { User, CheckCircle, BookHeart, Edit3, Info, Brain, File, Lock, Smile, Sun, Moon, CloudRain, LogOut, Award, Flame, Trophy, Shield, Users } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BackupManager from './BackupManager';
import BadgesDisplay from './BadgesDisplay';
import ProfessionalsManager from './ProfessionalsManager';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfileView = () => {
  const { setActiveModal, triggerReward, points, streak } = useAppStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    permission,
    isSupported,
    requestPermission,
    subscribeToNewMessages,
    subscribeToMarketplaceActivity,
  } = usePushNotifications();

  useEffect(() => {
    if (user) {
      loadProfile();
      checkAdminStatus();
    }

    // Subscribe to notifications if permission is granted
    if (permission === 'granted' && user) {
      const unsubMessages = subscribeToNewMessages(user.id);
      const unsubMarket = subscribeToMarketplaceActivity();
      return () => {
        unsubMessages();
        unsubMarket();
      };
    }
  }, [user, permission]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const getMoodIcon = (mood: string | null | undefined) => {
    if (mood === 'good') return <Smile size={14} className="text-success" />;
    if (mood === 'neutral') return <Sun size={14} className="text-warning" />;
    if (mood === 'tired') return <Moon size={14} className="text-blue-500" />;
    return <CloudRain size={14} className="text-destructive" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-slide-in-from-right">
      <div className="bg-gradient-to-br from-primary to-accent p-8 pb-10 rounded-b-[40px] shadow-lg text-center relative z-10 text-white">
        <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-4 border-4 border-white/50 shadow-xl flex items-center justify-center text-4xl font-bold relative">
          {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User size={40} />}
          <div className="absolute bottom-0 right-0 w-9 h-9 bg-success border-4 border-white rounded-full flex items-center justify-center">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">{profile?.display_name || 'Usuário'}</h2>
        <p className="text-sm opacity-90 mb-6">{user?.email}</p>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
            <Trophy className="mx-auto mb-1" size={20} />
            <p className="text-2xl font-bold">{points}</p>
            <p className="text-xs opacity-90">Pontos</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30">
            <Flame className="mx-auto mb-1 text-orange-300" size={20} />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs opacity-90">Dias</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border border-white/30">
            🏆 Mãe Guardiã
          </span>
          <button
            onClick={() => setActiveModal('about')}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Info size={14} /> Sobre
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-warning/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-warning hover:bg-warning transition-colors"
            >
              <Shield size={14} /> Admin
            </button>
          )}
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="mt-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
        >
          <LogOut size={14} className="mr-2" />
          Sair
        </Button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <User size={14} /> Geral
            </TabsTrigger>
            <TabsTrigger value="profissionais" className="flex items-center gap-2">
              <Users size={14} /> Profissionais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* Push Notifications */}
            {isSupported && (
              <div className="bg-card p-4 rounded-2xl shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-3">Notificações Push</h3>
                {permission === 'granted' ? (
                  <div className="bg-success/10 p-3 rounded-xl border border-success/20">
                    <p className="text-sm text-success font-bold">✓ Ativadas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Você receberá notificações sobre mensagens e novos produtos
                    </p>
                  </div>
                ) : permission === 'denied' ? (
                  <div className="bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                    <p className="text-sm text-destructive font-bold">✗ Bloqueadas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ative nas configurações do navegador
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={requestPermission}
                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-xl text-sm font-bold hover:bg-primary/90"
                  >
                    Ativar Notificações
                  </button>
                )}
              </div>
            )}

            {/* Backup Manager */}
            <BackupManager />

            {/* Badges Display */}
            <BadgesDisplay />

            {/* Diário */}
            <div>
              <h3 className="font-bold text-foreground mb-3 ml-1 flex items-center gap-2">
                <BookHeart className="text-purple-600" size={18} /> Meu Diário
              </h3>
              <button
                onClick={() => setActiveModal('journal')}
                className="w-full bg-purple-50 border border-dashed border-purple-200 p-4 rounded-xl text-center text-sm text-purple-600 hover:bg-purple-100 transition"
              >
                Escrever nova reflexão
              </button>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveModal('log')}
                className="bg-card p-4 rounded-xl border border-border hover:shadow-md transition text-left"
              >
                <File className="text-primary mb-2" size={20} />
                <p className="text-xs font-bold text-foreground">Registrar Log</p>
              </button>
              <button
                onClick={() => setActiveModal('report')}
                className="bg-card p-4 rounded-xl border border-border hover:shadow-md transition text-left"
              >
                <File className="text-accent mb-2" size={20} />
                <p className="text-xs font-bold text-foreground">Ver Relatórios</p>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="profissionais">
            <ProfessionalsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
