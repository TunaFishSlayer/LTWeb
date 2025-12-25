import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = process.env.REACT_APP_API_URL;

export const useLaptopStore = create(
  persist(
    (set, get) => ({
      laptops: [],
      loading: false,
      error: null,
      lastFetched: null,
      brands: ["All", "Apple", "Dell", "ASUS", "HP", "Lenovo", "Microsoft", "Razer", "Acer", "LG", "MSI", "Samsung", "Google", "Huawei", "Xiaomi"],

      // Fetch all laptops from API
      fetchLaptops: async () => {
        const state = get();
        
        // Skip if fetched within last 10 minutes
        if (state.lastFetched && (Date.now() - state.lastFetched) < 10*60) {
          return state.laptops;
        }

        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/laptops`);
          const data = await response.json();
          
          if (data.success && data.data) {
            set({
              laptops: data.data,
              loading: false,
              lastFetched: Date.now()
            });
            return data.data;
          } else {
            throw new Error(data.message || 'Failed to fetch laptops');
          }
        } catch (error) {
          console.error('Error fetching laptops:', error);
          set({
            error: error.message || 'Failed to load laptops',
            loading: false
          });
          return [];
        }
      },

      // Get laptops by brand
      getLaptopsByBrand: (brand) => {
        const state = get();
        if (brand === 'All') {
          return state.laptops;
        }
        return state.laptops.filter(laptop => laptop.brand === brand);
      },

      // Get featured laptops
      getFeaturedLaptops: () => {
        const state = get();
        return state.laptops.filter(laptop => laptop.featured);
      },

      // Get laptop by ID
      getLaptopById: (id) => {
        const state = get();
        return state.laptops.find(laptop => laptop._id === id || laptop.id === id);
      },

      // Get in-stock laptops
      getInStockLaptops: () => {
        const state = get();
        return state.laptops.filter(laptop => {
          // Handle both inStock boolean (frontend) and stock number (backend)
          if (typeof laptop.inStock === 'boolean') {
            return laptop.inStock;
          }
          // Backend uses stock number > 0
          return laptop.stock > 0;
        });
      },

      // Search laptops
      searchLaptops: (query) => {
        const state = get();
        const searchTerm = query.toLowerCase();
        
        return state.laptops.filter(laptop => 
          laptop.name.toLowerCase().includes(searchTerm) ||
          laptop.brand.toLowerCase().includes(searchTerm) ||
          laptop.specs.processor.toLowerCase().includes(searchTerm) ||
          laptop.specs.ram.toLowerCase().includes(searchTerm) ||
          laptop.specs.storage.toLowerCase().includes(searchTerm) ||
          laptop.specs.display.toLowerCase().includes(searchTerm) ||
          laptop.specs.graphics.toLowerCase().includes(searchTerm) ||
          (laptop.rating && laptop.rating.toString().includes(searchTerm)) ||
          (laptop.reviews && laptop.reviews.toString().includes(searchTerm))
        );
      },

      // Filter laptops by price range
      filterByPriceRange: (minPrice, maxPrice) => {
        const state = get();
        return state.laptops.filter(laptop => 
          laptop.price >= minPrice && laptop.price <= maxPrice
        );
      },

      // Filter laptops by rating
      filterByRating: (minRating) => {
        const state = get();
        return state.laptops.filter(laptop => 
          laptop.rating >= minRating
        );
      },

      // Force refresh laptops
      refreshLaptops: async () => {
        set({ lastFetched: null });
        return await get().fetchLaptops();
      },

      // Clear laptops (for testing or logout)
      clearLaptops: () => {
        set({
          laptops: [],
          lastFetched: null,
          error: null
        });
      },

      // Add new laptop
      addLaptop: async (laptopData) => {
        try {
          const response = await fetch(`${API_BASE}/laptops`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(laptopData)
          });

          const data = await response.json();
          
          if (data.success && data.data) {
            const state = get();
            set({
              laptops: [...state.laptops, data.data]
            });
            return data.data;
          } else {
            throw new Error(data.message || 'Failed to add laptop');
          }
        } catch (error) {
          console.error('Error adding laptop:', error);
          throw error;
        }
      },

      // Update existing laptop
      updateLaptop: async (laptopId, updateData) => {
        try {
          const response = await fetch(`${API_BASE}/laptops/${laptopId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateData)
          });

          const data = await response.json();
          
          if (data.success && data.data) {
            const state = get();
            set({
              laptops: state.laptops.map(laptop => 
                (laptop._id === laptopId || laptop.id === laptopId) 
                  ? data.data 
                  : laptop
              )
            });
            return data.data;
          } else {
            throw new Error(data.message || 'Failed to update laptop');
          }
        } catch (error) {
          console.error('Error updating laptop:', error);
          throw error;
        }
      },

      // Delete laptop
      deleteLaptop: async (laptopId) => {
        try {
          const response = await fetch(`${API_BASE}/laptops/${laptopId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const data = await response.json();
          
          if (data.success) {
            const state = get();
            set({
              laptops: state.laptops.filter(laptop => 
                laptop._id !== laptopId && laptop.id !== laptopId
              )
            });
            return true;
          } else {
            throw new Error(data.message || 'Failed to delete laptop');
          }
        } catch (error) {
          console.error('Error deleting laptop:', error);
          throw error;
        }
      },

      // Update laptop stock
      updateStock: async (laptopId, quantity) => {
        try {
          const response = await fetch(`${API_BASE}/laptops/${laptopId}/stock`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ stock: quantity })
          });

          const data = await response.json();
          
          if (data.success && data.data) {
            const state = get();
            set({
              laptops: state.laptops.map(laptop => 
                (laptop._id === laptopId || laptop.id === laptopId) 
                  ? { ...laptop, stock: quantity }
                  : laptop
              )
            });
            return data.data;
          } else {
            throw new Error(data.message || 'Failed to update stock');
          }
        } catch (error) {
          console.error('Error updating stock:', error);
          throw error;
        }
      }
    }),
    {
      name: 'laptop-storage',
      partialize: (state) => ({
        lastFetched: state.lastFetched,
        error: state.error
      })
    }
  )
);
