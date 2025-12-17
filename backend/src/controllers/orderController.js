const mongoose = require('mongoose');
const Order = require('../models/Order');
const Laptop = require('../models/Laptop');

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cartItems = req.body.items;
    let totalPrice = 0;

    const orderItems = [];

    for (const item of cartItems) {
      const laptop = await Laptop.findById(item.laptopId).session(session);

      if (!laptop) {
        throw new Error('Laptop not found');
      }

      if (laptop.stock < item.quantity) {
        throw new Error(`Not enough stock for ${laptop.name}`);
      }

      // Reduce stock
      laptop.stock -= item.quantity;
      if (laptop.stock === 0) {
        laptop.inStock = false;
      }

      await laptop.save({ session });

      totalPrice += laptop.price * item.quantity;

      orderItems.push({
        laptop: laptop._id,
        quantity: item.quantity,
        price: laptop.price
      });
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          totalPrice
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
