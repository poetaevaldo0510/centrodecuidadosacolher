import { Award, Crown, Medal, Shield } from 'lucide-react';

export interface AffiliateLevel {
  name: string;
  minEarnings: number;
  maxEarnings: number;
  commissionRate: number; // Percentage (e.g., 0.05 = 5%)
  icon: typeof Award;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export const AFFILIATE_LEVELS: AffiliateLevel[] = [
  {
    name: 'Bronze',
    minEarnings: 0,
    maxEarnings: 99.99,
    commissionRate: 0.05, // 5%
    icon: Shield,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-amber-800',
  },
  {
    name: 'Prata',
    minEarnings: 100,
    maxEarnings: 499.99,
    commissionRate: 0.06, // 6%
    icon: Medal,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    gradientFrom: 'from-slate-400',
    gradientTo: 'to-slate-600',
  },
  {
    name: 'Ouro',
    minEarnings: 500,
    maxEarnings: 1999.99,
    commissionRate: 0.07, // 7%
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-amber-500',
  },
  {
    name: 'Diamante',
    minEarnings: 2000,
    maxEarnings: Infinity,
    commissionRate: 0.08, // 8%
    icon: Award,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-400',
    gradientFrom: 'from-cyan-400',
    gradientTo: 'to-blue-500',
  },
];

export function getAffiliateLevel(totalEarnings: number): AffiliateLevel {
  for (let i = AFFILIATE_LEVELS.length - 1; i >= 0; i--) {
    if (totalEarnings >= AFFILIATE_LEVELS[i].minEarnings) {
      return AFFILIATE_LEVELS[i];
    }
  }
  return AFFILIATE_LEVELS[0];
}

export function getNextLevel(currentLevel: AffiliateLevel): AffiliateLevel | null {
  const currentIndex = AFFILIATE_LEVELS.findIndex(l => l.name === currentLevel.name);
  if (currentIndex < AFFILIATE_LEVELS.length - 1) {
    return AFFILIATE_LEVELS[currentIndex + 1];
  }
  return null;
}

export function getLevelProgress(totalEarnings: number, level: AffiliateLevel, nextLevel: AffiliateLevel | null): number {
  if (!nextLevel) return 100;
  
  const levelRange = nextLevel.minEarnings - level.minEarnings;
  const progress = totalEarnings - level.minEarnings;
  
  return Math.min(100, Math.max(0, (progress / levelRange) * 100));
}

export function getEarningsToNextLevel(totalEarnings: number, nextLevel: AffiliateLevel | null): number {
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.minEarnings - totalEarnings);
}
