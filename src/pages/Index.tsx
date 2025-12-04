import { useState, useEffect } from 'react';
import { Home, MessageCircle, Map, ShoppingBag, User, BookOpen, Camera, Calendar as CalendarIcon, Gift } from 'lucide-react';
import WelcomeScreen from '@/components/WelcomeScreen';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import RewardToast from '@/components/RewardToast';
import SmartHome from '@/components/SmartHome';
import CommunityHub from '@/components/CommunityHub';
import MarketHub from '@/components/MarketHub';
import ExploreMap from '@/components/ExploreMap';
import ProfileView from '@/components/ProfileView';
import ResourcesLibrary from '@/components/ResourcesLibrary';
import PhotoGallery from '@/components/PhotoGallery';
import Calendar from '@/components/Calendar';
import RewardsStore from '@/components/RewardsStore';
import ModalsContainer from '@/components/ModalsContainer';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { activeModal } = useAppStore();
  const { loading, user } = useAuth();
  const { requestPermission, subscribeToNewMessages, subscribeToMarketplaceActivity } = usePushNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Setup push notifications when user is logged in
  useEffect(() => {
    if (user) {
      // Request notification permission
      requestPermission();
      
      // Subscribe to real-time notifications
      const unsubscribeMessages = subscribeToNewMessages(user.id);
      const unsubscribeMarket = subscribeToMarketplaceActivity();

      return () => {
        unsubscribeMessages();
        unsubscribeMarket();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'resources', icon: BookOpen, label: 'Recursos' },
    { id: 'gallery', icon: Camera, label: 'Galeria' },
    { id: 'calendar', icon: CalendarIcon, label: 'Agenda' },
    { id: 'community', icon: MessageCircle, label: 'Tribo' },
    { id: 'rewards', icon: Gift, label: 'Loja' },
    { id: 'market', icon: ShoppingBag, label: 'Mercado' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="h-screen bg-background flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-border">
      <WelcomeScreen show={showWelcome} />
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}
      <RewardToast />
      <ModalsContainer />
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <SmartHome />}
        {activeTab === 'resources' && <ResourcesLibrary />}
        {activeTab === 'gallery' && <PhotoGallery />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'rewards' && <RewardsStore />}
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
