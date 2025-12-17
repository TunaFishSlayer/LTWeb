import Laptop from "../models/Laptop.js";

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

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { 'specs.processor': { $regex: search, $options: 'i' } },
        { 'specs.ram': { $regex: search, $options: 'i' } },
        { 'specs.storage': { $regex: search, $options: 'i' } }
      ];
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

    // Fetch laptops
    const laptops = await Laptop.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

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

  // Bonus: Additional useful methods
  static async getFeaturedLaptops(limit = 6) {
    return await Laptop.find({ featured: true })
      .sort({ rating: -1 })
      .limit(limit);
  }

  static async getLaptopsByBrand(brand) {
    return await Laptop.find({ brand })
      .sort({ rating: -1 });
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