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
    },

    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'cod', 'other'],
      default: 'cod'
    },

    paymentInfo: {
      method: {
        type: String,
        enum: ['card', 'cod', 'other']
      },
      details: {
        cardNumber: String, // Last 4 digits only
        nameOnCard: String
      },
      paidAt: Date,
      amount: Number
    },

    refundInfo: {
      refundedAt: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
      }
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
