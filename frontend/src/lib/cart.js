import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const CART_STORAGE_KEY = 'taplop_cart';
const API_BASE = process.env.REACT_APP_API_BASE || '/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isInitialized: false,
      cartId: null,

      // Initialize cart from localStorage or create new one
      initCart: async () => {
        if (get().isInitialized) return;
        
        try {
          const savedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            set({ 
              items: parsed.state?.items || [],
              cartId: parsed.state?.cartId,
              isInitialized: true 
            });
          } else {
            // Create new cart for logged in user
            await get().createCart();
          }
        } catch (error) {
          console.error('Failed to load cart from localStorage', error);
          set({ isInitialized: true });
        }
      },

      // Create new cart on backend
      createCart: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`${API_BASE}/carts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: 'current' }) // Backend will set actual userId
          });

          if (response.ok) {
            const data = await response.json();
            set({ 
              cartId: data._id || data.id,
              items: []
            });
          }
        } catch (error) {
          console.error('Failed to create cart:', error);
        }
      },

      // Load cart from backend
      loadCart: async () => {
        try {
          const token = localStorage.getItem('token');
          const cartId = get().cartId;
          
          if (!token || !cartId) return;

          const response = await fetch(`${API_BASE}/carts/${cartId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Transform backend cart items to frontend format
            const items = data.items?.map(item => ({
              laptop: {
                _id: item.laptop?._id || item.laptop?.id,
                id: item.laptop?.id,
                name: item.laptop?.name,
                price: item.price || item.laptop?.price
              },
              quantity: item.quantity
            })) || [];

            set({ items });
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      },

  addItem: async (laptop) => {
    try {
      const items = get().items;
      const laptopId = laptop._id || laptop.id;
      const existingItem = items.find(item => {
        const itemId = item.laptop._id || item.laptop.id;
        return itemId === laptopId;
      });

      if (existingItem) {
        const updatedItems = items.map(item => {
          const itemId = item.laptop._id || item.laptop.id;
          return itemId === laptopId
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
        set({ items: updatedItems });
      } else {
        const newItems = [...items, { laptop, quantity: 1 }];
        set({ items: newItems });
      }

      // Sync with backend
      await get().syncCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  },

  removeItem: async (laptopId) => {
    try {
      const newItems = get().items.filter(item => {
        const itemId = item.laptop._id || item.laptop.id;
        return itemId !== laptopId;
      });
      set({ items: newItems });

      // Sync with backend
      await get().syncCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  },

  updateQuantity: async (laptopId, quantity) => {
    try {
      if (quantity <= 0) {
        await get().removeItem(laptopId);
        return;
      }

      const newItems = get().items.map(item => {
        const itemId = item.laptop._id || item.laptop.id;
        return itemId === laptopId ? { ...item, quantity } : item;
      });
      set({ items: newItems });

      // Sync with backend
      await get().syncCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  },

  // Sync cart with backend
  syncCart: async () => {
    try {
      const token = localStorage.getItem('token');
      const cartId = get().cartId;
      const items = get().items;

      if (!token || !cartId) {
        console.warn('Cannot sync cart: missing token or cartId', { token: !!token, cartId });
        return;
      }

      // Transform items to backend format
      const backendItems = items.map(item => ({
        laptop: item.laptop._id || item.laptop.id,
        quantity: item.quantity,
        price: item.laptop.price
      }));

      console.log('Syncing cart:', { cartId, items: backendItems });

      const response = await fetch(`${API_BASE}/carts/${cartId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: backendItems })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cart synced successfully:', data);
      } else {
        console.error('Failed to sync cart:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
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
  
  // Clear cart from both state and localStorage
  clearCart: async () => {
    set({ items: [] });
    
    // Clear on backend
    try {
      const token = localStorage.getItem('token');
      const cartId = get().cartId;
      
      if (token && cartId) {
        await fetch(`${API_BASE}/carts/${cartId}/items`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Failed to clear cart on backend:', error);
    }
  }
}), 
{
  name: CART_STORAGE_KEY,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => {
    // Don't persist if cart has too many items to avoid quota errors
    if (state.items.length > 5) {
      return {
        cartId: state.cartId,
        itemCount: state.items.length
      };
    }
    
    return {
      items: state.items.map(item => ({
        laptop: {
          _id: item.laptop._id,
          id: item.laptop.id,
          name: item.laptop.name,
          price: item.laptop.price
        },
        quantity: item.quantity
      })),
      cartId: state.cartId
    };
  }
}));
