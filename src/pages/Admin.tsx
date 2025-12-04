import { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, Calendar, MessageSquare, ShoppingBag, ChevronLeft, Shield, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminCharts from '@/components/AdminCharts';

interface Stats {
  totalUsers: number;
  activeToday: number;
  totalLogs: number;
  totalPosts: number;
  totalItems: number;
  totalEvents: number;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  profiles?: { display_name: string | null };
}

interface UserData {
  id: string;
  display_name: string | null;
  created_at: string;
  email?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeToday: 0,
    totalLogs: 0,
    totalPosts: 0,
    totalItems: 0,
    totalEvents: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'charts'>('overview');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error || !data) {
      toast.error('Acesso negado. Você não é um administrador.');
      navigate('/app');
      return;
    }

    setIsAdmin(true);
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    try {
      // Load stats
      const [
        { count: usersCount },
        { count: logsCount },
        { count: postsCount },
        { count: itemsCount },
        { count: eventsCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('logs').select('*', { count: 'exact', head: true }),
        supabase.from('social_feed').select('*', { count: 'exact', head: true }),
        supabase.from('marketplace_items').select('*', { count: 'exact', head: true }),
        supabase.from('calendar_events').select('*', { count: 'exact', head: true }),
      ]);

      // Get active users today
      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('activity_logs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalUsers: usersCount || 0,
        activeToday: activeCount || 0,
        totalLogs: logsCount || 0,
        totalPosts: postsCount || 0,
        totalItems: itemsCount || 0,
        totalEvents: eventsCount || 0,
      });

      // Load users list
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      setUsers(usersData || []);

      // Load recent activities
      const { data: activitiesData } = await supabase
        .from('activity_logs')
        .select('id, user_id, activity_type, description, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: 'Total de Usuários', value: stats.totalUsers, icon: Users, color: 'bg-primary' },
    { label: 'Ativos Hoje', value: stats.activeToday, icon: Activity, color: 'bg-success' },
    { label: 'Logs Registrados', value: stats.totalLogs, icon: TrendingUp, color: 'bg-warning' },
    { label: 'Posts na Comunidade', value: stats.totalPosts, icon: MessageSquare, color: 'bg-accent' },
    { label: 'Itens no Mercado', value: stats.totalItems, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Eventos Agendados', value: stats.totalEvents, icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/app')}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="text-primary" size={24} /> Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie toda a plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['overview', 'charts', 'users', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab === 'overview' ? '📊 Visão Geral' : tab === 'charts' ? '📈 Gráficos' : tab === 'users' ? '👥 Usuários' : '📋 Atividades'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-2xl border border-border shadow-sm"
              >
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className="text-white" size={20} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Insights */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-5 rounded-2xl border border-primary/20">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Insights Rápidos
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li>• {stats.activeToday} usuários ativos hoje</li>
              <li>• {stats.totalLogs} registros de atividades</li>
              <li>• {stats.totalPosts} compartilhamentos na comunidade</li>
              <li>• {stats.totalItems} produtos no marketplace</li>
            </ul>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && <AdminCharts />}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-bold text-foreground">Usuários Cadastrados ({users.length})</h3>
            </div>
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {user.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.display_name || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Eye size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-bold text-foreground">Atividades Recentes</h3>
            </div>
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {activity.activity_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{activity.description || 'Atividade registrada'}</p>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma atividade registrada ainda
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
