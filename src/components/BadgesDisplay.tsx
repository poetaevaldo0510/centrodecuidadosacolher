import { useState, useEffect } from 'react';
import { Award, Lock, Sparkles, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  level: string;
  points_required: number;
  earned?: boolean;
  earned_at?: string;
}

const levelColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
};

const levelBgColors = {
  bronze: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  silver: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600',
  gold: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
};

const BadgesDisplay = () => {
  const { user } = useAuth();
  const { points } = useAppStore();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userLevel, setUserLevel] = useState<string>('bronze');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBadgesAndLevel();
    }
  }, [user, points]);

  const loadBadgesAndLevel = async () => {
    try {
      // Load all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      // Load user's earned badges
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user?.id);

      const earnedMap = new Map(
        earnedBadges?.map(eb => [eb.badge_id, eb.earned_at])
      );

      // Load user level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('level, total_points')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (levelData) {
        setUserLevel(levelData.level);
        
        // Update level based on points
        let newLevel = 'bronze';
        if (points >= 1000) newLevel = 'silver';
        if (points >= 3000) newLevel = 'gold';
        
        if (newLevel !== levelData.level) {
          await supabase
            .from('user_levels')
            .update({ level: newLevel, total_points: points })
            .eq('user_id', user?.id);
          setUserLevel(newLevel);
        }
      }

      setBadges(
        (allBadges || []).map(badge => ({
          ...badge,
          earned: earnedMap.has(badge.id),
          earned_at: earnedMap.get(badge.id),
        }))
      );

      // Check and award new badges
      for (const badge of allBadges || []) {
        if (!earnedMap.has(badge.id) && points >= badge.points_required) {
          await supabase
            .from('user_badges')
            .insert({ user_id: user?.id, badge_id: badge.id })
            .single();
        }
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    if (level === 'bronze') return '🥉 Bronze';
    if (level === 'silver') return '🥈 Prata';
    return '🥇 Ouro';
  };

  const getNextLevelPoints = () => {
    if (userLevel === 'bronze') return 1000;
    if (userLevel === 'silver') return 3000;
    return Infinity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const earnedCount = badges.filter(b => b.earned).length;
  const nextLevelPoints = getNextLevelPoints();
  const progressToNextLevel = nextLevelPoints === Infinity 
    ? 100 
    : Math.min((points / nextLevelPoints) * 100, 100);

  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border space-y-5">
      {/* Level Display */}
      <div className={`p-4 rounded-xl border-2 ${levelBgColors[userLevel as keyof typeof levelBgColors]}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${levelColors[userLevel as keyof typeof levelColors]} flex items-center justify-center text-white shadow-lg`}>
              <Medal size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu Nível</p>
              <p className="text-xl font-bold text-foreground">{getLevelLabel(userLevel)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{points}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </div>
        </div>
        
        {nextLevelPoints !== Infinity && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Próximo nível</span>
              <span>{points}/{nextLevelPoints} pts</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${levelColors[userLevel as keyof typeof levelColors]} transition-all duration-500`}
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
          <Award className="text-warning" size={20} /> 
          Conquistas
          <span className="ml-auto text-sm text-muted-foreground">
            {earnedCount}/{badges.length}
          </span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                badge.earned
                  ? `${levelBgColors[badge.level as keyof typeof levelBgColors]} shadow-sm`
                  : 'bg-muted/30 border-border opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-1">
                {badge.earned ? badge.icon : <Lock size={24} className="mx-auto text-muted-foreground" />}
              </div>
              <p className="text-xs font-bold text-foreground truncate">{badge.name}</p>
              <p className="text-[10px] text-muted-foreground">{badge.points_required} pts</p>
              
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesDisplay;
