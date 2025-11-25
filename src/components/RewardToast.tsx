import { Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const RewardToast = () => {
  const { showReward } = useAppStore();

  if (!showReward) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-[70] flex items-center gap-3 animate-bounce-soft">
      <Heart className="text-accent fill-accent" size={24} />
      <div>
        <p className="font-bold text-sm text-warning">+{showReward.points} pts</p>
        <p className="text-xs">{showReward.message}</p>
      </div>
    </div>
  );
};

export default RewardToast;
