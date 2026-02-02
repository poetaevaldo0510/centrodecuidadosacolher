import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, MousePointerClick, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  date: string;
  dateLabel: string;
  earnings: number;
  clicks: number;
  conversions: number;
}

interface AffiliatePerformanceChartProps {
  affiliateLinks: any[];
  affiliateSales: any[];
}

const AffiliatePerformanceChart = ({ affiliateLinks, affiliateSales }: AffiliatePerformanceChartProps) => {
  const [chartType, setChartType] = useState<'earnings' | 'activity'>('earnings');
  const [period, setPeriod] = useState<7 | 30>(7);

  const chartData = useMemo(() => {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, period - 1);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const dataByDay: Record<string, ChartData> = {};
    
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      dataByDay[dateKey] = {
        date: dateKey,
        dateLabel: format(day, 'dd/MM', { locale: ptBR }),
        earnings: 0,
        clicks: 0,
        conversions: 0,
      };
    });

    // Aggregate sales data
    affiliateSales.forEach(sale => {
      const saleDate = format(new Date(sale.created_at), 'yyyy-MM-dd');
      if (dataByDay[saleDate]) {
        dataByDay[saleDate].earnings += Number(sale.affiliate_commission);
        dataByDay[saleDate].conversions += 1;
      }
    });

    // For clicks, we'll estimate based on total clicks / period
    // In a real scenario, you'd have a clicks table with timestamps
    const totalClicks = affiliateLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
    const avgClicksPerDay = totalClicks / Math.max(period, 1);
    
    return Object.values(dataByDay).map(d => ({
      ...d,
      clicks: Math.round(avgClicksPerDay + (Math.random() - 0.5) * avgClicksPerDay * 0.5), // Simulated distribution
    }));
  }, [affiliateLinks, affiliateSales, period]);

  const totalEarnings = chartData.reduce((sum, d) => sum + d.earnings, 0);
  const totalClicks = chartData.reduce((sum, d) => sum + d.clicks, 0);
  const totalConversions = chartData.reduce((sum, d) => sum + d.conversions, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl">
            <BarChart3 className="text-primary-foreground" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Performance</h3>
            <p className="text-xs text-muted-foreground">Últimos {period} dias</p>
          </div>
        </div>
        
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setPeriod(7)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              period === 7 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              period === 30 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30d
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-success/10 rounded-xl p-3 text-center">
          <DollarSign className="mx-auto text-success mb-1" size={16} />
          <p className="text-lg font-bold text-success">R$ {totalEarnings.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Ganhos</p>
        </div>
        <div className="bg-info/10 rounded-xl p-3 text-center">
          <MousePointerClick className="mx-auto text-info mb-1" size={16} />
          <p className="text-lg font-bold text-info">{totalClicks}</p>
          <p className="text-[10px] text-muted-foreground">Cliques</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center">
          <TrendingUp className="mx-auto text-primary mb-1" size={16} />
          <p className="text-lg font-bold text-primary">{conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground">Conversão</p>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setChartType('earnings')}
          className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors ${
            chartType === 'earnings'
              ? 'bg-success/20 text-success border border-success/30'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          💰 Ganhos
        </button>
        <button
          onClick={() => setChartType('activity')}
          className={`flex-1 py-2 px-3 text-xs rounded-lg transition-colors ${
            chartType === 'activity'
              ? 'bg-info/20 text-info border border-info/30'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          📊 Atividade
        </button>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'earnings' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganhos']}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="clicks" name="Cliques" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" name="Conversões" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AffiliatePerformanceChart;
