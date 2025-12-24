import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        laptop: { type: mongoose.Schema.Types.ObjectId, ref: 'Laptop', required: true },
        quantity: { type: Number, required: true},
        price: Number
    }]
  });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;