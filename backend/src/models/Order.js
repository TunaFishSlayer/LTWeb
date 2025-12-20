// models/Order.js
import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    items: [
      {
        laptop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Laptop',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: Number
      }
    ],

    totalPrice: Number,

    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;