import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Theme state
  theme: typeof window !== 'undefined' ? (localStorage.getItem('arsenal_theme') || 'light') : 'light',
  
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('arsenal_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arsenal_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  // Auth Session
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('brightloop_user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brightloop_user');
      localStorage.removeItem('arsenal_refresh_token');
    }
    set({ user: null, isAuthenticated: false });
  },

  // Cart
  cart: [],
  addToCart: (item) => {
    const existing = get().cart.find((c) => c.id === item.id);
    if (existing) {
      set({
        cart: get().cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
    } else {
      set({ cart: [...get().cart, { ...item, quantity: 1 }] });
    }
  },
  removeFromCart: (itemId) => {
    set({ cart: get().cart.filter((c) => c.id !== itemId) });
  },
  clearCart: () => set({ cart: [] }),
}));
