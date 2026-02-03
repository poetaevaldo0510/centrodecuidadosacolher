import { useMemo } from 'react';
import { Target, Gift, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MonthlyGoal {
  id: string;
  name: string;
  targetAmount: number;
  reward: string;
  rewardPoints: number;
  icon: string;
}

const MONTHLY_GOALS: MonthlyGoal[] = [
  {
    id: 'starter',
    name: 'Primeira Comissão',
    targetAmount: 10,
    reward: 'Badge Iniciante',
    rewardPoints: 50,
    icon: '🌱',
  },
  {
    id: 'active',
    name: 'Afiliado Ativo',
    targetAmount: 50,
    reward: 'Badge Ativo + 100 pts',
    rewardPoints: 100,
    icon: '⚡',
  },
  {
    id: 'achiever',
    name: 'Meta Mensal',
    targetAmount: 150,
    reward: 'Badge Conquista + 200 pts',
    rewardPoints: 200,
    icon: '🎯',
  },
  {
    id: 'champion',
    name: 'Campeão do Mês',
    targetAmount: 300,
    reward: 'Badge Campeão + 500 pts',
    rewardPoints: 500,
    icon: '🏆',
  },
  {
    id: 'legend',
    name: 'Lenda',
    targetAmount: 500,
    reward: 'Badge Lendário + 1000 pts',
    rewardPoints: 1000,
    icon: '👑',
  },
];

interface AffiliateMonthlyGoalsProps {
  monthlyEarnings: number;
}

const AffiliateMonthlyGoals = ({ monthlyEarnings }: AffiliateMonthlyGoalsProps) => {
  const { completedGoals, nextGoal, totalRewardsEarned } = useMemo(() => {
    const completed = MONTHLY_GOALS.filter(goal => monthlyEarnings >= goal.targetAmount);
    const next = MONTHLY_GOALS.find(goal => monthlyEarnings < goal.targetAmount);
    const totalRewards = completed.reduce((sum, goal) => sum + goal.rewardPoints, 0);
    
    return {
      completedGoals: completed,
      nextGoal: next,
      totalRewardsEarned: totalRewards,
    };
  }, [monthlyEarnings]);

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-warning to-accent rounded-xl">
            <Target className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Metas do Mês</h3>
            <p className="text-xs text-muted-foreground capitalize">{currentMonth}</p>
          </div>
        </div>
        {totalRewardsEarned > 0 && (
          <Badge className="bg-success/10 text-success border-success/30 gap-1">
            <Sparkles size={12} />
            +{totalRewardsEarned} pts
          </Badge>
        )}
      </div>

      {/* Current Progress Summary */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Comissões este mês</span>
          <span className="text-sm font-bold text-primary">R$ {monthlyEarnings.toFixed(2)}</span>
        </div>
        {nextGoal && (
          <>
            <Progress 
              value={(monthlyEarnings / nextGoal.targetAmount) * 100} 
              className="h-2 bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Faltam <span className="font-semibold text-foreground">R$ {(nextGoal.targetAmount - monthlyEarnings).toFixed(2)}</span> para "{nextGoal.name}"
            </p>
          </>
        )}
        {!nextGoal && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Todas as metas concluídas! 🎉</span>
          </div>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {MONTHLY_GOALS.map((goal, index) => {
          const isCompleted = monthlyEarnings >= goal.targetAmount;
          const isNext = nextGoal?.id === goal.id;
          const isLocked = !isCompleted && !isNext;
          const progress = isCompleted ? 100 : isNext ? (monthlyEarnings / goal.targetAmount) * 100 : 0;

          return (
            <div
              key={goal.id}
              className={cn(
                "relative rounded-xl p-3 transition-all",
                isCompleted && "bg-success/10 border border-success/30",
                isNext && "bg-primary/5 border border-primary/30",
                isLocked && "bg-muted/30 opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                  isCompleted && "bg-success/20",
                  isNext && "bg-primary/20",
                  isLocked && "bg-muted"
                )}>
                  {isLocked ? <Lock size={16} className="text-muted-foreground" /> : goal.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium text-sm",
                      isCompleted && "text-success",
                      isNext && "text-foreground",
                      isLocked && "text-muted-foreground"
                    )}>
                      {goal.name}
                    </span>
                    {isCompleted && <CheckCircle2 size={14} className="text-success" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta: R$ {goal.targetAmount.toFixed(2)}
                  </p>
                  {isNext && (
                    <Progress value={progress} className="h-1.5 mt-1.5 bg-muted" />
                  )}
                </div>

                {/* Reward */}
                <div className="text-right">
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    isCompleted ? "text-success" : "text-muted-foreground"
                  )}>
                    <Gift size={12} />
                    <span>{goal.rewardPoints} pts</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1">
          <span>💡</span>
          <span>Compartilhe seus links para aumentar suas comissões e desbloquear mais recompensas!</span>
        </p>
      </div>
    </div>
  );
};

export default AffiliateMonthlyGoals;
