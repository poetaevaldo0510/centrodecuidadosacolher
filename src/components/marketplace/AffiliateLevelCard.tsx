import { Progress } from '@/components/ui/progress';
import { 
  getAffiliateLevel, 
  getNextLevel, 
  getLevelProgress, 
  getEarningsToNextLevel,
  AFFILIATE_LEVELS 
} from '@/lib/affiliateLevels';
import { cn } from '@/lib/utils';

interface AffiliateLevelCardProps {
  totalEarnings: number;
  compact?: boolean;
}

const AffiliateLevelCard = ({ totalEarnings, compact = false }: AffiliateLevelCardProps) => {
  const currentLevel = getAffiliateLevel(totalEarnings);
  const nextLevel = getNextLevel(currentLevel);
  const progress = getLevelProgress(totalEarnings, currentLevel, nextLevel);
  const earningsToNext = getEarningsToNextLevel(totalEarnings, nextLevel);
  
  const LevelIcon = currentLevel.icon;

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold",
        currentLevel.bgColor,
        currentLevel.color
      )}>
        <LevelIcon size={12} />
        <span>{currentLevel.name}</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Level Header */}
      <div className={cn(
        "p-4 bg-gradient-to-r",
        currentLevel.gradientFrom,
        currentLevel.gradientTo
      )}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <LevelIcon className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-medium">Seu Nível</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Afiliado {currentLevel.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 space-y-4">
        {/* All Levels */}
        <div className="flex items-center justify-between gap-1">
          {AFFILIATE_LEVELS.map((level, index) => {
            const isActive = level.name === currentLevel.name;
            const isPassed = totalEarnings >= level.minEarnings;
            const Icon = level.icon;
            
            return (
              <div 
                key={level.name}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all",
                  isActive && "bg-muted"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isPassed 
                    ? `bg-gradient-to-br ${level.gradientFrom} ${level.gradientTo}`
                    : "bg-muted"
                )}>
                  <Icon 
                    size={16} 
                    className={isPassed ? "text-white" : "text-muted-foreground"} 
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {level.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Próximo: <span className="font-semibold text-foreground">{nextLevel.name}</span>
              </span>
              <span className={cn("font-bold", currentLevel.color)}>
                {progress.toFixed(0)}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-2 bg-muted"
            />
            
            <p className="text-xs text-muted-foreground text-center">
              Faltam <span className="font-semibold text-foreground">R$ {earningsToNext.toFixed(2)}</span> para o nível {nextLevel.name}
            </p>
          </div>
        )}

        {/* Max Level Reached */}
        {!nextLevel && (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-foreground">
              🎉 Parabéns! Você alcançou o nível máximo!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Continue divulgando e aumentando seus ganhos
            </p>
          </div>
        )}

        {/* Earnings Display */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Total acumulado</span>
          <span className="font-bold text-foreground">
            R$ {totalEarnings.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLevelCard;
