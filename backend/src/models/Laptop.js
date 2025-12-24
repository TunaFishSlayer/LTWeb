import mongoose from "mongoose";

const laptopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },

  specs: {
    processor: { type: String, required: true },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    graphics: { type: String, required: true },
    display: { type: String, required: true }
  },

  stock: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },

  featured: { type: Boolean, default: false }
}, 
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

laptopSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

laptopSchema.index({ 
  name: 'text', 
  brand: 'text',
  'specs.processor': 'text',
  'specs.ram': 'text',
  'specs.storage': 'text'
});

// Additional indexes for better performance
laptopSchema.index({ brand: 1 });
laptopSchema.index({ price: 1 });
laptopSchema.index({ price: -1 });
laptopSchema.index({ featured: 1 });
laptopSchema.index({ rating: -1 });
laptopSchema.index({ createdAt: -1 });
laptopSchema.index({ stock: 1 });
laptopSchema.index({ 'specs.processor': 1 });
laptopSchema.index({ 'specs.ram': 1 });
laptopSchema.index({ 'specs.storage': 1 });

// Compound indexes for common queries
laptopSchema.index({ brand: 1, price: 1 });
laptopSchema.index({ featured: 1, rating: -1 });
laptopSchema.index({ stock: 1, featured: 1 });

const Laptop = mongoose.model('Laptop', laptopSchema);

export default Laptop;