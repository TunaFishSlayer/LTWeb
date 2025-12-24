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
        cardNumber: String, 
        nameOnCard: String
      },
      paidAt: Date,
      amount: Number
    },

    discountInfo: {
      code: String,
      amount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number
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

// Add indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ totalPrice: 1 });
orderSchema.index({ totalPrice: -1 });
orderSchema.index({ 'paymentInfo.paidAt': -1 });

// Compound indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default Order;
