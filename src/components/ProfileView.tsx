import { useState, useEffect } from 'react';
import { User, CheckCircle, BookHeart, File, Lock, Smile, Sun, Moon, CloudRain, LogOut, Flame, Trophy, Shield, Users, BookOpen, Camera, Gift } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BackupManager from './BackupManager';
import BadgesDisplay from './BadgesDisplay';
import ProfessionalsManager from './ProfessionalsManager';
import ResourcesLibrary from './ResourcesLibrary';
import PhotoGallery from './PhotoGallery';
import RewardsStore from './RewardsStore';
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
      <div className="bg-gradient-to-br from-primary to-accent p-6 pb-8 rounded-b-[32px] shadow-lg text-center relative z-10 text-white">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-3 border-4 border-white/50 shadow-xl flex items-center justify-center text-3xl font-bold relative">
          {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User size={32} />}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-success border-3 border-white rounded-full flex items-center justify-center">
            <CheckCircle size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-0.5">{profile?.display_name || 'Usuário'}</h2>
        <p className="text-xs opacity-90 mb-4">{user?.email}</p>

        {/* Stats compactos */}
        <div className="flex justify-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
            <Trophy size={16} />
            <span className="font-bold">{points}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
            <Flame size={16} className="text-orange-300" />
            <span className="font-bold">{streak} dias</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-2">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-warning/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-warning hover:bg-warning transition-colors"
            >
              <Shield size={12} /> Admin
            </button>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-7 px-3 text-xs"
          >
            <LogOut size={12} className="mr-1" />
            Sair
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 h-auto p-1">
            <TabsTrigger value="geral" className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <User size={16} />
              Geral
            </TabsTrigger>
            <TabsTrigger value="recursos" className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <BookOpen size={16} />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="galeria" className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <Camera size={16} />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="loja" className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <Gift size={16} />
              Loja
            </TabsTrigger>
            <TabsTrigger value="profissionais" className="flex flex-col items-center gap-0.5 py-2 text-[10px]">
              <Users size={16} />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4 mt-0">
            {/* Push Notifications */}
            {isSupported && (
              <div className="bg-card p-3 rounded-xl shadow-sm border border-border">
                <h3 className="font-bold text-sm text-foreground mb-2">Notificações</h3>
                {permission === 'granted' ? (
                  <div className="bg-success/10 p-2 rounded-lg border border-success/20">
                    <p className="text-xs text-success font-bold">✓ Ativadas</p>
                  </div>
                ) : permission === 'denied' ? (
                  <div className="bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                    <p className="text-xs text-destructive font-bold">✗ Bloqueadas</p>
                  </div>
                ) : (
                  <button
                    onClick={requestPermission}
                    className="w-full bg-primary text-primary-foreground py-2 px-3 rounded-lg text-xs font-bold hover:bg-primary/90"
                  >
                    Ativar Notificações
                  </button>
                )}
              </div>
            )}

            <BackupManager />
            <BadgesDisplay />

            {/* Diário */}
            <div>
              <h3 className="font-bold text-sm text-foreground mb-2 ml-1 flex items-center gap-2">
                <BookHeart className="text-purple-600" size={16} /> Diário
              </h3>
              <button
                onClick={() => setActiveModal('journal')}
                className="w-full bg-purple-50 dark:bg-purple-900/20 border border-dashed border-purple-200 dark:border-purple-700 p-3 rounded-xl text-center text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
              >
                Escrever nova reflexão
              </button>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveModal('log')}
                className="bg-card p-3 rounded-xl border border-border hover:shadow-md transition text-left"
              >
                <File className="text-primary mb-1" size={18} />
                <p className="text-xs font-bold text-foreground">Registrar Log</p>
              </button>
              <button
                onClick={() => setActiveModal('report')}
                className="bg-card p-3 rounded-xl border border-border hover:shadow-md transition text-left"
              >
                <File className="text-accent mb-1" size={18} />
                <p className="text-xs font-bold text-foreground">Ver Relatórios</p>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="recursos" className="mt-0">
            <ResourcesLibrary />
          </TabsContent>

          <TabsContent value="galeria" className="mt-0">
            <PhotoGallery />
          </TabsContent>

          <TabsContent value="loja" className="mt-0">
            <RewardsStore />
          </TabsContent>

          <TabsContent value="profissionais" className="mt-0">
            <ProfessionalsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
