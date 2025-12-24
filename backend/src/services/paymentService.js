import CreditCard from "../models/CreditCard.js";

class PaymentService {
    static async processPayment(cardDetails, amount) {
        const { cardNumber, nameOnCard, expiryDate, cvv } = cardDetails;
        const card = await CreditCard.findOne({ cardNumber, nameOnCard, expiryDate, cvv });
        if (!card) {
            throw new Error("Credit card not found");
        }
        if (card.balance < amount) {
            throw new Error("Insufficient balance");
        }
        card.balance -= amount;
        await card.save()
        return {
            message: "Payment processed successfully",
            remainingBalance: card.balance
        };
    }

    static async addCreditCard(cardDetails) {
        const { cardNumber, nameOnCard, expiryDate, cvv, balance } = cardDetails;
        const existingCard = await CreditCard.findOne({ cardNumber });
        if (existingCard) {
            throw new Error("Credit card already exists");
        }
        const newCard = new CreditCard({ cardNumber, nameOnCard, expiryDate, cvv, balance });
        await newCard.save();
        return newCard;
    }

    static async getAllCreditCards() {
        const cards = await CreditCard.find();
        return cards;
    }

    static async addBalance(cardNumber, amount) {
        const card = await CreditCard.findOne({ cardNumber });
        if (!card) {
            throw new Error("Credit card not found");
        }
        card.balance += amount;
        await card.save();
        return {
            message: "Balance added successfully",
            newBalance: card.balance
        };
    }

    static async getBalance(cardNumber) {
        const card = await CreditCard.findOne({ cardNumber });
        if (!card) {
            throw new Error("Credit card not found");
        }
        return {
            balance: card.balance
        };
    }
}

export default PaymentService;