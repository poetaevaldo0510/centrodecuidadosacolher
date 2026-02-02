import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface RankingEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_earnings: number;
  total_sales: number;
  rank: number;
}

const AffiliateRanking = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'all'>('month');

  useEffect(() => {
    loadRanking();
  }, [timeframe]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      // Get affiliate sales with time filter
      let query = supabase
        .from('affiliate_sales')
        .select('affiliate_id, affiliate_commission, sale_amount');

      if (timeframe === 'month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startOfMonth.toISOString());
      }

      const { data: salesData, error } = await query;
      if (error) throw error;

      // Aggregate by affiliate
      const affiliateStats: Record<string, { earnings: number; sales: number }> = {};
      (salesData || []).forEach((sale) => {
        if (!affiliateStats[sale.affiliate_id]) {
          affiliateStats[sale.affiliate_id] = { earnings: 0, sales: 0 };
        }
        affiliateStats[sale.affiliate_id].earnings += Number(sale.affiliate_commission);
        affiliateStats[sale.affiliate_id].sales += 1;
      });

      // Get user profiles
      const userIds = Object.keys(affiliateStats);
      if (userIds.length === 0) {
        setRanking([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      // Build ranking
      const rankingData: RankingEntry[] = userIds
        .map((userId, index) => {
          const profile = profiles?.find(p => p.id === userId);
          return {
            user_id: userId,
            display_name: profile?.display_name || 'Usuário Anônimo',
            avatar_url: profile?.avatar_url,
            total_earnings: affiliateStats[userId].earnings,
            total_sales: affiliateStats[userId].sales,
            rank: 0,
          };
        })
        .sort((a, b) => b.total_earnings - a.total_earnings)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setRanking(rankingData);
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={22} />;
      case 3:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <span className="text-muted-foreground font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-0';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
            <Trophy className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Ranking de Afiliados</h3>
            <p className="text-xs text-muted-foreground">Top 10 por comissões</p>
          </div>
        </div>
        
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timeframe === 'month' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timeframe === 'all' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-sm text-muted-foreground">Nenhum afiliado ainda</p>
          <p className="text-xs text-muted-foreground">Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-primary/5 to-transparent border border-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0 border-2 border-border">
                {entry.avatar_url ? (
                  <img 
                    src={entry.avatar_url} 
                    alt={entry.display_name || ''} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    {(entry.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {entry.display_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{entry.total_sales} vendas</span>
                </div>
              </div>
              
              <Badge className={getRankBadgeStyle(entry.rank)}>
                R$ {entry.total_earnings.toFixed(2)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffiliateRanking;
