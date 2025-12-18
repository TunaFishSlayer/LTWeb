import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const CART_STORAGE_KEY = 'taplop_cart';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isInitialized: false,

  addItem: (laptop) => {
    const items = get().items;
    // Support both _id and id
    const laptopId = laptop._id || laptop.id;
    const existingItem = items.find(item => {
      const itemId = item.laptop._id || item.laptop.id;
      return itemId === laptopId;
    });

    if (existingItem) {
      set({
        items: items.map(item => {
          const itemId = item.laptop._id || item.laptop.id;
          return itemId === laptopId
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        })
      });
    } else {
      set({ items: [...items, { laptop, quantity: 1 }] });
    }
  },

  removeItem: (laptopId) => {
    set({ 
      items: get().items.filter(item => {
        const itemId = item.laptop._id || item.laptop.id;
        return itemId !== laptopId;
      })
    });
  },

  updateQuantity: (laptopId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(laptopId);
      return;
    }

    set({
      items: get().items.map(item => {
        const itemId = item.laptop._id || item.laptop.id;
        return itemId === laptopId ? { ...item, quantity } : item;
      })
    });
  },

  toggleCart: () => set({ isOpen: !get().isOpen }),

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.laptop.price * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  // Initialize cart from localStorage
  initCart: () => {
    if (get().isInitialized) return;
    
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        set({ 
          items: parsed.state?.items || [],
          isInitialized: true 
        });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      set({ isInitialized: true });
    }
  },
  
  // Clear cart from both state and localStorage
  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}), 
{
  name: CART_STORAGE_KEY,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    items: state.items,
    isOpen: state.isOpen
  })
}));
