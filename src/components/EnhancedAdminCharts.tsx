import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Heart,
  Star,
  Award
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartData {
  name: string;
  value: number;
}

interface DetailedData {
  name: string;
  users: number;
  posts: number;
  comments: number;
  sales: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--info))'];

const EnhancedAdminCharts = () => {
  const [engagementData, setEngagementData] = useState<ChartData[]>([]);
  const [activityByType, setActivityByType] = useState<ChartData[]>([]);
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [detailedData, setDetailedData] = useState<DetailedData[]>([]);
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [contentStats, setContentStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalReviews: 0,
    totalSales: 0,
    totalRevenue: 0,
    platformFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('engagement');

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all data in parallel
      const [
        { data: activities },
        { data: profiles },
        { data: posts },
        { data: comments },
        { data: likes },
        { data: reviews },
        { data: sales }
      ] = await Promise.all([
        supabase.from('activity_logs').select('activity_type, created_at').gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('profiles').select('created_at'),
        supabase.from('social_feed').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('feed_comments').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('feed_likes').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('product_reviews').select('created_at, rating').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('marketplace_sales').select('created_at, total_price, platform_fee, status')
      ]);

      // Process engagement by day
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const engagementByDay: { [key: string]: number } = {};
      const usersByDay: { [key: string]: number } = {};
      const postsByDay: { [key: string]: number } = {};
      const commentsByDay: { [key: string]: number } = {};
      const salesByDay: { [key: string]: number } = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        engagementByDay[dayName] = 0;
        usersByDay[dayName] = 0;
        postsByDay[dayName] = 0;
        commentsByDay[dayName] = 0;
        salesByDay[dayName] = 0;
      }

      activities?.forEach(activity => {
        const date = new Date(activity.created_at!);
        const dayName = dayNames[date.getDay()];
        if (engagementByDay[dayName] !== undefined) {
          engagementByDay[dayName]++;
        }
      });

      // Process user growth for last 7 days
      const recentProfiles = profiles?.filter(p => new Date(p.created_at) >= sevenDaysAgo) || [];
      recentProfiles.forEach(profile => {
        const date = new Date(profile.created_at);
        const dayName = dayNames[date.getDay()];
        if (usersByDay[dayName] !== undefined) {
          usersByDay[dayName]++;
        }
      });

      // Process posts
      posts?.forEach(post => {
        const date = new Date(post.created_at!);
        if (date >= sevenDaysAgo) {
          const dayName = dayNames[date.getDay()];
          if (postsByDay[dayName] !== undefined) {
            postsByDay[dayName]++;
          }
        }
      });

      // Process comments
      comments?.forEach(comment => {
        const date = new Date(comment.created_at!);
        if (date >= sevenDaysAgo) {
          const dayName = dayNames[date.getDay()];
          if (commentsByDay[dayName] !== undefined) {
            commentsByDay[dayName]++;
          }
        }
      });

      // Process sales
      sales?.forEach(sale => {
        const date = new Date(sale.created_at);
        if (date >= sevenDaysAgo) {
          const dayName = dayNames[date.getDay()];
          if (salesByDay[dayName] !== undefined) {
            salesByDay[dayName]++;
          }
        }
      });

      setEngagementData(
        Object.entries(engagementByDay).map(([name, value]) => ({ name, value }))
      );

      setUserGrowth(
        Object.entries(usersByDay).map(([name, value]) => ({ name, value }))
      );

      setSalesData(
        Object.entries(salesByDay).map(([name, value]) => ({ name, value }))
      );

      // Detailed combined data
      setDetailedData(
        Object.keys(engagementByDay).map(day => ({
          name: day,
          users: usersByDay[day] || 0,
          posts: postsByDay[day] || 0,
          comments: commentsByDay[day] || 0,
          sales: salesByDay[day] || 0
        }))
      );

      // Process activity by type
      const typeCount: { [key: string]: number } = {};
      activities?.forEach(activity => {
        const type = activity.activity_type;
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      setActivityByType(
        Object.entries(typeCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );

      // Calculate content stats
      const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total_price || 0), 0) || 0;
      const platformFees = sales?.reduce((sum, s) => sum + Number(s.platform_fee || 0), 0) || 0;

      setContentStats({
        totalPosts: posts?.length || 0,
        totalComments: comments?.length || 0,
        totalLikes: likes?.length || 0,
        totalReviews: reviews?.length || 0,
        totalSales: sales?.length || 0,
        totalRevenue,
        platformFees
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="text-primary" size={16} />
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{contentStats.totalPosts}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="text-info" size={16} />
            <span className="text-xs text-muted-foreground">Comentários</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{contentStats.totalComments}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-destructive" size={16} />
            <span className="text-xs text-muted-foreground">Curtidas</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{contentStats.totalLikes}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-warning" size={16} />
            <span className="text-xs text-muted-foreground">Avaliações</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{contentStats.totalReviews}</span>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="bg-gradient-to-br from-success/10 to-card p-4 rounded-2xl border border-success/30">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="text-success" size={18} /> Métricas do Marketplace
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{contentStats.totalSales}</p>
            <p className="text-xs text-muted-foreground">Vendas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">R$ {contentStats.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Faturamento</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">R$ {contentStats.platformFees.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Taxa (10%)</p>
          </div>
        </div>
      </div>

      {/* Tabs for Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
          <TabsTrigger value="combined">Combinado</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="mt-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={18} /> Engajamento (Últimos 7 dias)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="text-success" size={18} /> Novos Usuários
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="text-warning" size={18} /> Atividades por Tipo
            </h3>
            {activityByType.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {activityByType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {activityByType.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-muted-foreground">({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhuma atividade registrada
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="combined" className="mt-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="text-primary" size={18} /> Visão Combinada
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detailedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--success))" strokeWidth={2} name="Usuários" />
                  <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" strokeWidth={2} name="Posts" />
                  <Line type="monotone" dataKey="comments" stroke="hsl(var(--info))" strokeWidth={2} name="Comentários" />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--warning))" strokeWidth={2} name="Vendas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sales Chart */}
      <div className="bg-card p-4 rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <ShoppingCart className="text-success" size={18} /> Vendas (Últimos 7 dias)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminCharts;
