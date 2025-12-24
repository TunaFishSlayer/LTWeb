import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Tab close detection
let isPageRefresh = false;

// Handle tab close events
const handleTabClose = (event) => {
  // Check if this is a page refresh (F5) vs actual tab close
  if (event.type === 'beforeunload') {
    // For page refresh, the page will reload, so don't clear auth data
    // Only clear on actual tab close (when navigation type is not reload)
    if (performance.getEntriesByType && performance.getEntriesByType('navigation').length > 0) {
      const navigationType = performance.getEntriesByType('navigation')[0].type;
      if (navigationType === 'reload') {
        isPageRefresh = true;
        return;
      }
    }
    
    // Alternative check for older browsers
    if (window.performance && window.performance.getEntriesByType) {
      const navigationType = window.performance.getEntriesByType('navigation')[0].type;
      if (navigationType === 'reload') {
        isPageRefresh = true;
        return;
      }
    }
  }
  
  // Only clear auth data if this is not a page refresh
  if (!isPageRefresh) {
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('token');
    // Preserve cart data across sessions
  }
};

// Set up event listeners for tab close detection
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', handleTabClose);
  window.addEventListener('unload', handleTabClose);
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user, token) => {
        // Save token to localStorage
        if (token) {
          localStorage.setItem('token', token);
        }
        // Set user from backend API response
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      signup: (user, token) => {
        // Save token to localStorage
        if (token) {
          localStorage.setItem('token', token);
        }
        // Set user from backend API response
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear auth data but preserve cart
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
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
