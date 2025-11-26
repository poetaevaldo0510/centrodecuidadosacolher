import { useState, useEffect } from 'react';
import { User, CheckCircle, BookHeart, Edit3, Info, Brain, File, Lock, Smile, Sun, Moon, CloudRain, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ProfileView = () => {
  const { setActiveModal, triggerReward } = useAppStore();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

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
      <div className="bg-card p-6 pb-8 rounded-b-[40px] shadow-sm text-center relative z-10">
        <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 border-4 border-card shadow-lg flex items-center justify-center text-3xl font-bold text-primary relative">
          {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User size={32} />}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-success border-4 border-card rounded-full flex items-center justify-center">
            <CheckCircle size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground">{profile?.display_name || 'Usuário'}</h2>
        <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
        
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Mãe Guardiã</span>
          <button
            onClick={() => setActiveModal('about')}
            className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-accent/20"
          >
            <Info size={12} /> Sobre o Acolher
          </button>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <LogOut size={14} className="mr-2" />
          Sair
        </Button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default ProfileView;
