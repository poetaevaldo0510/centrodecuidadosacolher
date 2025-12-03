import { useState, useEffect } from 'react';
import { Trophy, Target, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_count: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  progress?: {
    current_count: number;
    completed: boolean;
  };
}

const WeeklyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    try {
      // Load active challenges
      const { data: challengesData, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) throw error;

      // Load user progress
      const { data: progressData } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user?.id);

      const progressMap = new Map(
        progressData?.map(p => [p.challenge_id, { current_count: p.current_count, completed: p.completed }])
      );

      setChallenges(
        (challengesData || []).map(c => ({
          ...c,
          progress: progressMap.get(c.id) || { current_count: 0, completed: false }
        }))
      );
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          current_count: 0
        });

      if (error) throw error;
      
      toast.success('Você entrou no desafio! 💪');
      loadChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Erro ao entrar no desafio');
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
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border space-y-4">
      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
        <Trophy className="text-warning" size={20} /> Desafios Semanais
      </h3>

      {challenges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="mx-auto mb-3 opacity-50" size={40} />
          <p>Nenhum desafio ativo no momento</p>
          <p className="text-sm">Volte em breve!</p>
        </div>
      ) : (
        challenges.map((challenge) => {
          const daysLeft = getDaysRemaining(challenge.end_date);
          const progress = challenge.progress;
          const isJoined = progress && (progress.current_count > 0 || progress.completed);
          const progressPercent = getProgressPercent(progress?.current_count || 0, challenge.target_count);

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                progress?.completed
                  ? 'bg-success/10 border-success/30'
                  : 'bg-gradient-to-br from-warning/5 to-accent/5 border-warning/20 hover:border-warning/40'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {progress?.completed ? (
                      <CheckCircle2 className="text-success" size={18} />
                    ) : (
                      <Target className="text-warning" size={18} />
                    )}
                    <h4 className="font-bold text-foreground">{challenge.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-bold">
                    +{challenge.bonus_points} pts
                  </span>
                </div>
              </div>

              {isJoined || progress?.completed ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-bold text-foreground">
                      {progress?.current_count || 0}/{challenge.target_count}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  {!progress?.completed && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {daysLeft} dias restantes
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="text-warning" /> Continue assim!
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-warning/20 text-warning py-2 rounded-xl font-bold text-sm hover:bg-warning/30 transition-colors"
                >
                  Participar do Desafio <ChevronRight size={16} />
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default WeeklyChallenges;
