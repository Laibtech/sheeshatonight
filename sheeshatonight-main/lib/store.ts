import { create } from 'zustand';

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
export type ViewScreen = 'AUTH' | 'CUSTOMER_DASHBOARD' | 'VENDOR_PORTAL' | 'ADMIN_PANEL';

export interface AuthState {
  isLoggedIn: boolean;
  userRole: UserRole;
  currentScreen: ViewScreen;
  userEmail: string;
  userName: string;
  region: string;
  
  // Actions
  setLoggedIn: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setCurrentScreen: (screen: ViewScreen) => void;
  setUserData: (data: { email: string; name: string }) => void;
  setRegion: (region: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

import { clearAllClientAuth } from './session';

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userRole: 'CUSTOMER',
  currentScreen: 'AUTH',
  userEmail: '',
  userName: '',
  region: 'Dubai, UAE',
  
  setLoggedIn: (value) => set({ isLoggedIn: value }),
  setUserRole: (role) => set({ userRole: role }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setUserData: (data) => set({ userEmail: data.email, userName: data.name }),
  setRegion: (region) => set({ region }),
  
  switchRole: (role) => {
    set({ 
      userRole: role,
      currentScreen: role === 'CUSTOMER' ? 'CUSTOMER_DASHBOARD' : role === 'VENDOR' ? 'VENDOR_PORTAL' : 'ADMIN_PANEL'
    });
  },
  
  logout: () => {
    clearAllClientAuth();
    set({
      isLoggedIn: false,
      userRole: 'CUSTOMER',
      currentScreen: 'AUTH',
      userEmail: '',
      userName: '',
    });
  },
}));
