import Discount from "../models/Discount.js";

class DiscountService {
  static async getAllDiscounts() {
    const discounts = await Discount.find()
      .populate('productIds', 'name brand image')
      .sort({ createdAt: -1 });
    return discounts;
  }

  static async getDiscountById(discountId) {
    const discount = await Discount.findById(discountId)
      .populate('productIds', 'name brand image');
    
    if (!discount) {
      throw new Error("Discount not found");
    }
    
    return discount;
  }

  static async createDiscount(discountData) {
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
    ).populate('productIds', 'name brand image');

    if (!discount) {
      throw new Error("Discount not found");
    }

    return discount;
  }

  static async deleteDiscount(discountId) {
    const discount = await Discount.findByIdAndDelete(discountId);
    
    if (!discount) {
      throw new Error("Discount not found");
    }
    
    return discount;
  }

  static async getActiveDiscounts() {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('productIds', 'name brand image');
    
    return discounts;
  }
}

export default DiscountService;

