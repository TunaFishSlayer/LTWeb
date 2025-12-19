import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    applicableTo: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all'
    },
    productIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laptop'
    }],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Index for active discounts
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Discount = mongoose.model('Discount', discountSchema);
export default Discount;

