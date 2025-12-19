import Order from "../models/Order.js";
import Laptop from "../models/Laptop.js";
import mongoose from "mongoose";

class OrderService {
  static async createOrder(userId, orderData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { items, shippingAddress } = orderData;
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const laptop = await Laptop.findById(item.laptopId).session(session);

        if (!laptop) {
          throw new Error(`Laptop not found: ${item.laptopId}`);
        }

        if (laptop.stock < item.quantity) {
          throw new Error(`Not enough stock for ${laptop.name}`);
        }

        // Reduce stock
        laptop.stock -= item.quantity;
        await laptop.save({ session });

        totalPrice += laptop.price * item.quantity;

        orderItems.push({
          laptop: laptop._id,
          quantity: item.quantity,
          price: laptop.price
        });
      }

      const order = await Order.create(
        [{
          user: userId,
          items: orderItems,
          totalPrice,
          shippingAddress,
          status: 'paid'
        }],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Populate laptop details for response
      const populatedOrder = await Order.findById(order[0]._id)
        .populate('items.laptop')
        .populate('user', 'email name');

      return populatedOrder;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getMyOrders(userId) {
    const orders = await Order.find({ user: userId })
      .populate('items.laptop')
      .sort({ createdAt: -1 });
    return orders;
  }

  static async getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.laptop')
      .populate('user', 'email name');
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  }
}

export default OrderService;

