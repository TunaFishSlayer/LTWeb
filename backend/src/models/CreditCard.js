import mongoose from "mongoose";

const creditCardSchema = new mongoose.Schema({
    cardNumber: { type: String, required: true },
    nameOnCard: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
    balance: { type: Number, required: true, default: 1000000 }
});

const CreditCard = mongoose.model('CreditCard', creditCardSchema);
export default CreditCard;