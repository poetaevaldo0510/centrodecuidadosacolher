import { useState, useEffect } from 'react';
import { Home, MessageCircle, ShoppingBag, User, Calendar as CalendarIcon } from 'lucide-react';
import WelcomeScreen from '@/components/WelcomeScreen';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import RewardToast from '@/components/RewardToast';
import SmartHome from '@/components/SmartHome';
import CommunityHub from '@/components/CommunityHub';
import MarketHub from '@/components/MarketHub';
import ProfileView from '@/components/ProfileView';
import Calendar from '@/components/Calendar';
import ModalsContainer from '@/components/ModalsContainer';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { activeModal } = useAppStore();
  const { loading, user } = useAuth();
  const { requestPermission, subscribeToNewMessages, subscribeToMarketplaceActivity } = usePushNotifications();
  const unreadNotifications = useUnreadNotifications(user?.id);

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
    { id: 'calendar', icon: CalendarIcon, label: 'Agenda' },
    { id: 'community', icon: MessageCircle, label: 'Tribo' },
    { id: 'market', icon: ShoppingBag, label: 'Mercado' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="h-screen bg-background flex flex-col font-sans w-full max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-border">
      <WelcomeScreen show={showWelcome} />
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}
      <RewardToast />
      <ModalsContainer />
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'home' && <SmartHome onNavigate={setActiveTab} />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'market' && <MarketHub />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      {/* Bottom Navigation - Otimizada para mobile */}
      <nav className="bg-card border-t border-border px-1 py-2 flex justify-around items-center shadow-xl z-20 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'market' && unreadNotifications > 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1 relative ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground active:bg-muted'
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[8px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Index;
