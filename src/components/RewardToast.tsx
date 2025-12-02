import { Sparkles, Trophy } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const RewardToast = () => {
  const { showReward } = useAppStore();

  if (!showReward) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-warning to-accent text-white px-8 py-4 rounded-2xl shadow-2xl z-[70] flex items-center gap-4 animate-bounce border-2 border-white/50 backdrop-blur-sm">
      <div className="bg-white/20 p-3 rounded-xl">
        <Trophy className="text-white" size={28} />
      </div>
      <div>
        <p className="font-bold text-lg flex items-center gap-2">
          <Sparkles size={16} /> +{showReward.points} pts
        </p>
        <p className="text-sm opacity-90">{showReward.message}</p>
      </div>
    </div>
  );
};

export default RewardToast;
