import Order from "../models/Order.js";
import Laptop from "../models/Laptop.js";
import mongoose from "mongoose";

class OrderService {
  static async createOrder(userId, orderData) {
    const { items, discountCode, finalAmount, discountInfo, shippingAddress } = orderData;
    
    console.log('OrderService received:', { items, discountCode, finalAmount, discountInfo }); // Debug log
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Process items and validate stock
      const orderItems = [];
      let totalPrice = 0;

      for (const item of items) {
        const { laptopId, quantity } = item;

        // Get laptop and check stock
        const laptop = await Laptop.findById(laptopId).session(session);
        
        if (!laptop) {
          throw new Error(`Laptop with ID ${laptopId} not found`);
        }

        if (laptop.stock < quantity) {
          throw new Error(
            `Insufficient stock for ${laptop.name}. Available: ${laptop.stock}, Requested: ${quantity}`
          );
        }

        // Calculate item total
        const itemTotal = laptop.price * quantity;
        orderItems.push({
          laptop: laptopId,
          quantity,
          price: laptop.price
        });

        totalPrice += itemTotal;

        // Decrease stock
        laptop.stock -= quantity;
        await laptop.save({ session });
      }

      // Use discount info from frontend if provided, otherwise calculate it
      let finalDiscountInfo = discountInfo;
      
      if (!finalDiscountInfo && discountCode) {
        // For backwards compatibility, calculate discount if not provided by frontend
        const estimatedTaxAndShipping = 50; // Rough estimate for tax + shipping
        const expectedFinalAmount = totalPrice + estimatedTaxAndShipping;
        
        console.log('Discount check:', { expectedFinalAmount, finalAmount }); // Debug log
        
        if (finalAmount && finalAmount < expectedFinalAmount) {
          const discountAmount = Math.max(0, expectedFinalAmount - finalAmount);
          finalDiscountInfo = {
            code: discountCode,
            amount: discountAmount,
            type: 'percentage', // Default to percentage, could be enhanced
            value: Math.round((discountAmount / (totalPrice + estimatedTaxAndShipping)) * 100 * 100) / 100 // Calculate percentage
          };
          
          console.log('Discount calculated:', finalDiscountInfo); // Debug log
        } else {
          console.log('No discount calculated - final amount is not less than expected'); // Debug log
        }
      } else {
        console.log('Using discount info from frontend:', finalDiscountInfo); // Debug log
      }

      // Create order with payment info
      const order = new Order({
        user: userId,
        items: orderItems,
        totalPrice: finalAmount || totalPrice, 
        status: 'pending',
        shippingAddress,
        paymentInfo: {
          method: 'cod', 
          amount: finalAmount || totalPrice, 
          paidAt: new Date()
        },
        discountInfo: finalDiscountInfo
      });

      await order.save({ session });
      await session.commitTransaction();

      // Populate order details before returning
      await order.populate([
        { path: 'user', select: 'name email phone address' },
        { path: 'items.laptop', select: 'name brand price image specs' }
      ]);

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getAllOrders(queryParams) {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId,
      sort = '-createdAt'
    } = queryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new Error("Invalid pagination parameters");
    }

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by user
    if (userId) {
      query.user = userId;
    }

    // Get total count
    const totalCount = await Order.countDocuments(query);

    // Sort options
    let sortObj = {};
    switch (sort) {
      case 'price-asc': sortObj = { totalPrice: 1 }; break;
      case 'price-desc': sortObj = { totalPrice: -1 }; break;
      case 'oldest': sortObj = { createdAt: 1 }; break;
      default: sortObj = { createdAt: -1 };
    }

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.laptop', 'name brand price image')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount
      }
    };
  }

  static async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone address')
      .populate('items.laptop', 'name brand price image specs');

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  static async getUserOrders(userId, queryParams = {}) {
    const { page = 1, limit = 10, status } = queryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const totalCount = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('items.laptop', 'name brand price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount
      }
    };
  }

  static async updateOrderStatus(orderId, newStatus) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      const oldStatus = order.status;

      // If cancelling, restore stock
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items) {
          await Laptop.findByIdAndUpdate(
            item.laptop,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }

      order.status = newStatus;
      await order.save({ session });

      await session.commitTransaction();

      await order.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'items.laptop', select: 'name brand price image' }
      ]);

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelOrder(orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status === 'shipped' || order.status === 'completed') {
        throw new Error("Cannot cancel order that has been shipped or completed");
      }

      // Restore stock if not already cancelled
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          await Laptop.findByIdAndUpdate(
            item.laptop,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }

      await Order.findByIdAndDelete(orderId).session(session);

      await session.commitTransaction();

      return orderId;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default OrderService;