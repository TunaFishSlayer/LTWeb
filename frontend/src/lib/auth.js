import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => {
        // Set user from backend API response
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      signup: (user) => {
        // Set user from backend API response
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear cart when user logs out
        localStorage.removeItem('taplop_cart');
        localStorage.removeItem('token');
      },

      // Helper methods for role-based access
      isAdmin: () => {
        const { user } = useAuthStore.getState();
        return user?.role === 'admin';
      },

      hasRole: (role) => {
        const { user } = useAuthStore.getState();
        return user?.role === role;
      },

      hasPermission: (permission) => {
        const { user } = useAuthStore.getState();
        return user?.permissions?.includes(permission) || false;
      },

      canAccess: (feature) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        
        const permissions = {
          'admin_dashboard': ['manage_inventory', 'manage_discounts', 'add_products', 'view_analytics'],
          'user_dashboard': ['view_products', 'add_to_cart', 'checkout', 'view_orders'],
          'inventory_management': ['manage_inventory'],
          'discount_management': ['manage_discounts'],
          'add_products': ['add_products'],
          'sales_analytics': ['view_analytics']
        };
        
        return permissions[feature]?.some(p => user.permissions.includes(p)) || false;
      }
    }),
    {
      name: 'auth-storage', // tên khóa lưu trong localStorage
      storage: createJSONStorage(() => localStorage)
    }
  )
);
