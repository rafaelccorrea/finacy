import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Subscription } from '../types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
    hasActiveSubscription: boolean,
    subscription: Subscription | null,
  ) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasActiveSubscription: false,
      subscription: null,
      setAuth: (accessToken, refreshToken, user, hasActiveSubscription, subscription) => {
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true, hasActiveSubscription, subscription });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, hasActiveSubscription: false, subscription: null });
      },
    }),
    {
      name: 'finacy-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        hasActiveSubscription: state.hasActiveSubscription,
        subscription: state.subscription,
      }),
    },
  ),
);

// ─── Theme Store ──────────────────────────────────────────────────────────────
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    { name: 'finacy-theme' },
  ),
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
