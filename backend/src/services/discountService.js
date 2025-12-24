import Discount from "../models/Discount.js";

// Simple cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class DiscountService {
  // Cache invalidation helper
  static invalidateCache(pattern = null) {
    if (pattern) {
      // Invalidate specific cache keys
      for (const [key] of cache.entries()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      cache.clear();
    }
  }
  static async getAllDiscounts() {
    const cacheKey = 'all_discounts';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for all discounts');
      return cached.data;
    }
    
    const discounts = await Discount.find()
      .populate('productIds', 'name brand image')
      .sort({ createdAt: -1 })
      .lean();
    
    // Cache the result
    cache.set(cacheKey, {
      data: discounts,
      timestamp: Date.now()
    });
    
    return discounts;
  }

  static async getDiscountById(discountId) {
    const cacheKey = `discount_${discountId}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for discount:', discountId);
      return cached.data;
    }
    
    const discount = await Discount.findById(discountId)
      .populate('productIds', 'name brand image')
      .lean();
    
    if (!discount) {
      throw new Error("Discount not found");
    }
    
    // Cache the result
    cache.set(cacheKey, {
      data: discount,
      timestamp: Date.now()
    });
    
    return discount;
  }

  static async createDiscount(discountData) {
    // Clear cache when creating new discount
    DiscountService.invalidateCache();
    
    // Validate dates
    if (new Date(discountData.startDate) >= new Date(discountData.endDate)) {
      throw new Error("End date must be after start date");
    }

    // Validate value based on type
    if (discountData.type === 'percentage' && discountData.value > 100) {
      throw new Error("Percentage discount cannot exceed 100%");
    }

    const discount = await Discount.create(discountData);
    return discount;
  }

  static async updateDiscount(discountId, updateData) {
    // Clear cache when updating discount
    DiscountService.invalidateCache(`discount_${discountId}`);
    
    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new Error("End date must be after start date");
      }
    }

    // Validate value if provided
    if (updateData.type === 'percentage' && updateData.value > 100) {
      throw new Error("Percentage discount cannot exceed 100%");
    }

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      updateData,
      { new: true, runValidators: true }
    ).populate('productIds', 'name brand image')
    .lean();

    if (!discount) {
      throw new Error("Discount not found");
    }

    return discount;
  }

  static async deleteDiscount(discountId) {
    // Clear cache when deleting discount
    DiscountService.invalidateCache(`discount_${discountId}`);
    
    const discount = await Discount.findByIdAndDelete(discountId);
    
    if (!discount) {
      throw new Error("Discount not found");
    }
    
    return discount;
  }

  static async getActiveDiscounts() {
    const cacheKey = 'active_discounts';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for active discounts');
      return cached.data;
    }
    
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('productIds', 'name brand image')
    .lean();
    
    // Cache the result
    cache.set(cacheKey, {
      data: discounts,
      timestamp: Date.now()
    });
    
    return discounts;
  }
}

export default DiscountService;

