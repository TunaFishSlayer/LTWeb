import mongoose from "mongoose";
import PaymentService from "../services/paymentService.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        autoIndex: true
    });
    console.log("MongoDB connected for seeding");

    const cards = [
        {
            cardNumber: "4111111111111111",
            nameOnCard: "John Doe",
            expiryDate: "12/26",
            cvv: "123",
            balance: 500,
        },
        {
            cardNumber: "5555555555554444",
            nameOnCard: "Jane Smith",
            expiryDate: "11/27",
            cvv: "456",
            balance: 3000,
        },
        {
            cardNumber: "378282246310005",
            nameOnCard: "Alice Johnson",
            expiryDate: "09/28",
            cvv: "789",
            balance: 10000,
        },
        {
            cardNumber: "6011111111111117",
            nameOnCard: "Bob Lee",
            expiryDate: "03/29",
            cvv: "321",
            balance: 1500,
        },
    ];

    for (const card of cards) {
        try {
            await PaymentService.addCreditCard(card);
            console.log(`Seeded: ${card.cardNumber}`);
        } catch (err) {
            if (err.message.includes("already exists")) {
                console.log(`Exists: ${card.cardNumber}`);
            } else {
                console.error(`Error seeding ${card.cardNumber}: ${err.message}`);
            }
        }
    }

    const all = await PaymentService.getAllCreditCards();
    console.log(`Total cards in DB: ${all.length}`);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});