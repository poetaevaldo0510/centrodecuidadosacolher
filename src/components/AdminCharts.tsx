import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Activity, Calendar } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const AdminCharts = () => {
  const [engagementData, setEngagementData] = useState<ChartData[]>([]);
  const [activityByType, setActivityByType] = useState<ChartData[]>([]);
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      // Get activity logs for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activities } = await supabase
        .from('activity_logs')
        .select('activity_type, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Process engagement by day
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const engagementByDay: { [key: string]: number } = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        engagementByDay[dayName] = 0;
      }

      activities?.forEach(activity => {
        const date = new Date(activity.created_at!);
        const dayName = dayNames[date.getDay()];
        if (engagementByDay[dayName] !== undefined) {
          engagementByDay[dayName]++;
        }
      });

      setEngagementData(
        Object.entries(engagementByDay).map(([name, value]) => ({ name, value }))
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

      // Get user growth (last 7 days)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const growthByDay: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        growthByDay[dayName] = 0;
      }

      profiles?.forEach(profile => {
        const date = new Date(profile.created_at);
        const dayName = dayNames[date.getDay()];
        if (growthByDay[dayName] !== undefined) {
          growthByDay[dayName]++;
        }
      });

      setUserGrowth(
        Object.entries(growthByDay).map(([name, value]) => ({ name, value }))
      );

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
      {/* Engagement Over Time */}
      <div className="bg-card p-4 rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="text-primary" size={18} /> Engajamento (Últimos 7 dias)
        </h3>
        <div className="h-48">
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

      {/* User Growth */}
      <div className="bg-card p-4 rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="text-success" size={18} /> Novos Usuários
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth}>
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity by Type */}
      <div className="bg-card p-4 rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="text-warning" size={18} /> Atividades por Tipo
        </h3>
        {activityByType.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
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
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Nenhuma atividade registrada
          </div>
        )}
        {activityByType.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {activityByType.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
