import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = process.env.REACT_APP_API_URL;

export const useDiscountStore = create(
  persist(
    (set, get) => ({
      discounts: [],
      loading: false,
      error: null,
      lastFetched: null,

      // Fetch all active discounts
      fetchDiscounts: async () => {
        const state = get();
        
        // Skip if fetched within last 5 minutes
        if (state.lastFetched && (Date.now() - state.lastFetched) < 5 * 60 * 1000) {
          return state.discounts;
        }

        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/discounts/active`);
          const data = await response.json();
          
          if (data.success && data.data) {
            set({
              discounts: data.data,
              loading: false,
              lastFetched: Date.now()
            });
            return data.data;
          }
        } catch (error) {
          console.error('Error fetching discounts:', error);
          set({ error: error.message, loading: false });
        }
        
        return [];
      },

      // Get applicable discount for a specific laptop
      getDiscountForLaptop: (laptopId) => {
        const state = get();
        const laptopIdStr = String(laptopId);
        
        // Find applicable discounts for this laptop
        const applicableDiscounts = state.discounts.filter(d => {
          if (d.applicableTo === 'all') {
            return true;
          } else if (d.applicableTo === 'specific') {
            const productIds = d.productIds?.map(p => String(p._id || p.id || p)) || [];
            return productIds.includes(laptopIdStr);
          }
          return false;
        });
        
        // Get the latest discount (most recently created/updated)
        if (applicableDiscounts.length > 0) {
          return applicableDiscounts.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA; // Sort descending (newest first)
          })[0];
        }
        
        // Return 0 discount if no discount found
        return {
          percentage: 0,
          amount: 0,
          code: '',
          name: 'No Discount',
          description: 'No discount available',
          type: 'percentage'
        };
      },

      // Force refresh discounts
      refreshDiscounts: async () => {
        set({ lastFetched: null });
        return await get().fetchDiscounts();
      },

      // Clear discounts (for testing or logout)
      clearDiscounts: () => {
        set({
          discounts: [],
          lastFetched: null,
          error: null
        });
      }
    }),
    {
      name: 'discount-storage',
      partialize: (state) => ({
        discounts: state.discounts,
        lastFetched: state.lastFetched
      })
    }
  )
);
