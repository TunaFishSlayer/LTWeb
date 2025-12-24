import Laptop from "../models/Laptop.js";

// Simple cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class LaptopService {
  static async getAllLaptops(queryParams) {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      brand, 
      minPrice, 
      maxPrice, 
      featured, 
      sort = '-createdAt',
      inStock
    } = queryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new Error("Invalid pagination parameters");
    }

    let query = {};

    // Search filter - optimized for performance
    if (search) {
      // Use text search with proper indexing
      query.$text = {
        $search: search,
        $caseSensitive: false,
        $diacriticSensitive: false
      };
    }

    // Brand filter
    if (brand) {
      query.brand = { $in: brand.split(',').map(b => b.trim()) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured filter
    if (featured) query.featured = featured === 'true';

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // Generate cache key
    const cacheKey = JSON.stringify({ page, limit, search, brand, minPrice, maxPrice, featured, sort, inStock });
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for:', cacheKey);
      return cached.data;
    }
    
    // Get total count for pagination
    const totalCount = await Laptop.countDocuments(query);

    // Sort options
    let sortObj = {};
    switch (sort) {
      case 'price-asc': sortObj = { price: 1 }; break;
      case 'price-desc': sortObj = { price: -1 }; break;
      case 'rating': sortObj = { rating: -1 }; break;
      case 'name-asc': sortObj = { name: 1 }; break;
      case 'name-desc': sortObj = { name: -1 }; break;
      default: sortObj = { createdAt: -1 };
    }

    // Fetch laptops with optimized field selection
    const laptops = await Laptop.find(query)
      .select('name brand price originalPrice image specs rating reviews stock featured createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for faster queries

    // Cache the result
    cache.set(cacheKey, {
      data: { laptops, pagination: { currentPage: pageNum, totalPages: Math.ceil(totalCount / limitNum), totalItems: totalCount } },
      timestamp: Date.now()
    });

    return {
      laptops,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount
      }
    };
  }

  static async getLaptopById(laptopId) {
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      throw new Error("Laptop not found");
    }
    return laptop;
  }

  static async createLaptop(laptopData) {
    const laptop = await Laptop.create(laptopData);
    return laptop;
  }

  static async updateLaptop(laptopId, updateData) {
    const laptop = await Laptop.findByIdAndUpdate(
      laptopId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!laptop) {
      throw new Error("Laptop not found");
    }

    return laptop;
  }

  static async deleteLaptop(laptopId) {
    const laptop = await Laptop.findByIdAndDelete(laptopId);
    if (!laptop) {
      throw new Error("Laptop not found");
    }
    return laptop;
  }

  static async getFeaturedLaptops(limit = 6) {
    return await Laptop.find({ featured: true })
      .sort({ rating: -1 })
      .limit(limit);
  }

  static async updateStock(laptopId, quantity) {
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      throw new Error("Laptop not found");
    }

    laptop.stock = quantity;
    await laptop.save();
    return laptop;
  }
}

export default LaptopService;