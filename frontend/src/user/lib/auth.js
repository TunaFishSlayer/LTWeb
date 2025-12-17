import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        if (email === 'demo@laptophub.com' && password === 'demo123') {
          const user = {
            id: '1',
            email: 'demo@laptophub.com',
            firstName: 'Demo',
            lastName: 'User'
          };
          set({ user, isAuthenticated: true });
          return true;
        }

        if (email && password) {
          const user = {
            id: Date.now().toString(),
            email,
            firstName: email.split('@')[0],
            lastName: 'User'
          };
          set({ user, isAuthenticated: true });
          return true;
        }

        return false;
      },

      signup: (email, password, firstName, lastName) => {
        // ✅ Giả lập đăng ký
        if (email && password && firstName && lastName) {
          const user = {
            id: Date.now().toString(),
            email,
            firstName,
            lastName
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage', // tên khóa lưu trong localStorage
      storage: createJSONStorage(() => localStorage)
    }
  )
);
