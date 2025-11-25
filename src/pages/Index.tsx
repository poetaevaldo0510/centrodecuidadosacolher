import { useState, useEffect } from 'react';
import { Home, Users, Map, ShoppingBag, User } from 'lucide-react';
import WelcomeScreen from '@/components/WelcomeScreen';
import RewardToast from '@/components/RewardToast';
import SmartHome from '@/components/SmartHome';
import CommunityHub from '@/components/CommunityHub';
import MarketHub from '@/components/MarketHub';
import ExploreMap from '@/components/ExploreMap';
import ProfileView from '@/components/ProfileView';
import ModalsContainer from '@/components/ModalsContainer';
import { useAppStore } from '@/lib/store';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const { activeModal } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'community', icon: Users, label: 'Tribo' },
    { id: 'explore', icon: Map, label: 'Explorar' },
    { id: 'market', icon: ShoppingBag, label: 'Mercado' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="h-screen bg-background flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-border">
      <WelcomeScreen show={showWelcome} />
      <RewardToast />
      <ModalsContainer />
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <SmartHome />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'explore' && <ExploreMap />}
        {activeTab === 'market' && <MarketHub />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border px-2 py-3 flex justify-around items-center shadow-xl z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Index;
