import { useState, useEffect } from 'react';
import { Gift, Coins, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useAppStore } from '@/lib/store';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  points_cost: number;
  reward_type: string;
}

interface Purchase {
  reward_id: string;
}

const RewardsStore = () => {
  const { user } = useAuth();
  const { points } = useAppStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [rewardsRes, purchasesRes, levelRes] = await Promise.all([
        supabase.from('rewards_store').select('*').eq('is_active', true),
        supabase.from('reward_purchases').select('reward_id').eq('user_id', user!.id),
        supabase.from('user_levels').select('total_points').eq('user_id', user!.id).single()
      ]);

      setRewards(rewardsRes.data || []);
      setPurchases(purchasesRes.data || []);
      setUserPoints(levelRes.data?.total_points || points);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseReward = async (reward: Reward) => {
    if (!user) return;
    if (userPoints < reward.points_cost) {
      toast.error('Pontos insuficientes!');
      return;
    }

    setPurchasing(reward.id);
    try {
      // Insert purchase record
      const { error: purchaseError } = await supabase
        .from('reward_purchases')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_cost
        });

      if (purchaseError) throw purchaseError;

      // Update user points
      const newPoints = userPoints - reward.points_cost;
      const { error: updateError } = await supabase
        .from('user_levels')
        .update({ total_points: newPoints })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setUserPoints(newPoints);
      setPurchases([...purchases, { reward_id: reward.id }]);
      
      toast.success(`🎉 Você resgatou "${reward.name}"!`);
    } catch (error) {
      console.error('Error purchasing reward:', error);
      toast.error('Erro ao resgatar recompensa');
    } finally {
      setPurchasing(null);
    }
  };

  const hasPurchased = (rewardId: string) => {
    return purchases.some(p => p.reward_id === rewardId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-b-[40px] text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Gift size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Loja de Recompensas</h1>
            <p className="text-sm opacity-90">Troque seus pontos por prêmios exclusivos</p>
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-300" size={24} />
            <span className="text-lg font-bold">Seus pontos</span>
          </div>
          <span className="text-3xl font-bold">{userPoints}</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {rewards.map((reward) => {
            const owned = hasPurchased(reward.id);
            const canAfford = userPoints >= reward.points_cost;
            
            return (
              <div
                key={reward.id}
                className={`bg-card p-4 rounded-2xl border shadow-sm transition-all ${
                  owned 
                    ? 'border-success/50 bg-success/5' 
                    : canAfford 
                      ? 'border-border hover:border-primary hover:shadow-md' 
                      : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-4xl p-3 rounded-xl ${
                    owned ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    {reward.icon || '🎁'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      {reward.name}
                      {owned && <Check className="text-success" size={16} />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Coins className="text-warning" size={14} />
                      <span className="text-sm font-bold text-warning">{reward.points_cost} pontos</span>
                    </div>
                  </div>
                  {owned ? (
                    <div className="bg-success/10 text-success px-3 py-2 rounded-xl text-sm font-bold">
                      Resgatado
                    </div>
                  ) : (
                    <Button
                      onClick={() => purchaseReward(reward)}
                      disabled={!canAfford || purchasing === reward.id}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <ShoppingBag size={14} className="mr-1" />
                      {purchasing === reward.id ? '...' : 'Resgatar'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">Nenhuma recompensa disponível no momento.</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
          <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="text-primary" size={16} /> Como ganhar pontos?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Registre atividades diárias (+10 pts)</li>
            <li>• Complete desafios semanais (+bônus)</li>
            <li>• Mantenha sua sequência de dias (+5 pts/dia)</li>
            <li>• Compartilhe na comunidade (+15 pts)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RewardsStore;
