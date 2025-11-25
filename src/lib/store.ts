import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db, isDemo } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface Log {
  id: number;
  action: string;
  type: string;
  note: string;
  time: string;
  date: string;
  mood?: string | null;
}

export interface MarketItem {
  id: number;
  title: string;
  price: string;
  author: string;
  category: string;
  sales: number;
  imageColor: string;
}

export interface UserRoutine {
  morning: string[];
  afternoon: string[];
  night: string[];
}

interface AppState {
  // User data
  userName: string;
  userCep: string;
  childName: string;
  childDiagnosis: string;
  childCID: string;
  childBirthDate: string;
  childMeds: string;
  
  // App data
  points: number;
  logs: Log[];
  marketplaceItems: MarketItem[];
  userRoutine: UserRoutine;
  userId: string | null;
  isOnline: boolean;
  
  // UI state
  activeModal: string | null;
  showReward: { message: string; points: number } | null;
  selectedLocation: any | null;
  selectedEvent: any | null;
  selectedAction: any | null;
  chatUser: any | null;
  
  // Actions
  setUserData: (data: Partial<AppState>) => void;
  addPoints: (pts: number) => void;
  triggerReward: (message: string, pts: number) => void;
  addLog: (log: Log) => void;
  addMarketItem: (item: MarketItem) => void;
  setActiveModal: (modal: string | null) => void;
  toggleRoutineAction: (timeOfDay: string, actionKey: string) => void;
  setSelectedLocation: (location: any) => void;
  setSelectedEvent: (event: any) => void;
  setSelectedAction: (action: any) => void;
  setChatUser: (user: any) => void;
  setUserId: (id: string | null) => void;
  setIsOnline: (online: boolean) => void;
  syncToFirebase: () => Promise<void>;
  loadFromFirebase: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      userName: "",
      userCep: "",
      childName: "Lucas",
      childDiagnosis: "Síndrome de Down",
      childCID: "Q90",
      childBirthDate: "2018-05-20",
      childMeds: "Risperidona 1mg, Melatonina",
      points: 1350,
      logs: [],
      marketplaceItems: [
        { id: 1, title: "Kit Rotina Visual", price: "R$ 45,00", author: "Mãe Joana", category: "Material", sales: 42, imageColor: "bg-orange-100" },
        { id: 2, title: "Mordedor Sensorial", price: "R$ 28,50", author: "Mãe Carla", category: "Sensorial", sales: 128, imageColor: "bg-purple-100" },
      ],
      userRoutine: {
        morning: ['meds', 'mood', 'food', 'school'],
        afternoon: ['therapy', 'play', 'food', 'crisis'],
        night: ['bath', 'sleep', 'meds']
      },
      activeModal: null,
      showReward: null,
      selectedLocation: null,
      selectedEvent: null,
      selectedAction: null,
      chatUser: null,
      userId: null,
      isOnline: navigator.onLine,

      // Actions
      setUserData: (data) => set(data),
      
      addPoints: (pts) => set((state) => ({ points: state.points + pts })),
      
      triggerReward: (message, pts) => set((state) => {
        setTimeout(() => set({ showReward: null }), 3000);
        return { 
          points: state.points + pts,
          showReward: { message, points: pts }
        };
      }),
      
      addLog: (log) => set((state) => ({
        logs: [log, ...state.logs]
      })),
      
      addMarketItem: (item) => set((state) => ({
        marketplaceItems: [item, ...state.marketplaceItems]
      })),
      
      setActiveModal: (modal) => set({ activeModal: modal }),
      
      toggleRoutineAction: (timeOfDay, actionKey) => set((state) => {
        const list = state.userRoutine[timeOfDay as keyof UserRoutine] || [];
        return {
          userRoutine: {
            ...state.userRoutine,
            [timeOfDay]: list.includes(actionKey)
              ? list.filter(k => k !== actionKey)
              : [...list, actionKey]
          }
        };
      }),
      
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setSelectedAction: (action) => set({ selectedAction: action }),
      setChatUser: (user) => set({ chatUser: user }),
      setUserId: (id) => set({ userId: id }),
      setIsOnline: (online) => set({ isOnline: online }),
      
      syncToFirebase: async () => {
        if (isDemo || !auth?.currentUser || !db) return;
        
        const state = useAppStore.getState();
        const userId = state.userId || auth.currentUser.uid;
        
        try {
          await setDoc(doc(db, 'users', userId), {
            userName: state.userName,
            userCep: state.userCep,
            childName: state.childName,
            childDiagnosis: state.childDiagnosis,
            childCID: state.childCID,
            childBirthDate: state.childBirthDate,
            childMeds: state.childMeds,
            points: state.points,
            logs: state.logs,
            marketplaceItems: state.marketplaceItems,
            userRoutine: state.userRoutine,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Erro ao sincronizar com Firebase:', error);
        }
      },
      
      loadFromFirebase: async () => {
        if (isDemo || !auth?.currentUser || !db) return;
        
        const userId = auth.currentUser.uid;
        
        try {
          const docRef = doc(db, 'users', userId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            set({
              userName: data.userName || "",
              userCep: data.userCep || "",
              childName: data.childName || "Lucas",
              childDiagnosis: data.childDiagnosis || "",
              childCID: data.childCID || "",
              childBirthDate: data.childBirthDate || "",
              childMeds: data.childMeds || "",
              points: data.points || 0,
              logs: data.logs || [],
              marketplaceItems: data.marketplaceItems || [],
              userRoutine: data.userRoutine || {
                morning: ['meds', 'mood', 'food', 'school'],
                afternoon: ['therapy', 'play', 'food', 'crisis'],
                night: ['bath', 'sleep', 'meds']
              },
              userId
            });
          }
        } catch (error) {
          console.error('Erro ao carregar do Firebase:', error);
        }
      },
    }),
    {
      name: 'acolher-storage',
    }
  )
);

// Initialize Firebase Auth
if (!isDemo && auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAppStore.getState().setUserId(user.uid);
      await useAppStore.getState().loadFromFirebase();
    } else {
      // Sign in anonymously if not logged in
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Erro ao fazer login anônimo:', error);
      }
    }
  });
}

// Online/Offline detection
window.addEventListener('online', () => useAppStore.getState().setIsOnline(true));
window.addEventListener('offline', () => useAppStore.getState().setIsOnline(false));
