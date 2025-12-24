import PaymentService from "../services/paymentService.js";

const mapErrorToStatus = (message) => {
    switch (message) {
        case "Credit card not found":
            return 404;
        case "Insufficient balance":
            return 400;
        case "Credit card already exists":
            return 409;
        default:
            return 500;
    }
};

export async function processPayment(req, res) {
    try {
        const { cardDetails, amount } = req.body;
        if (
            !cardDetails ||
            !cardDetails.cardNumber ||
            !cardDetails.nameOnCard ||
            !cardDetails.expiryDate ||
            !cardDetails.cvv ||
            typeof amount !== "number"
        ) {
            return res.status(400).json({ error: "Invalid request payload" });
        }

        const result = await PaymentService.processPayment(cardDetails, amount);
        res.status(200).json(result);
    } catch (err) {
        res.status(mapErrorToStatus(err.message)).json({ error: err.message });
    }
}

export async function addCreditCard(req, res) {
    try {
        const { cardNumber, nameOnCard, expiryDate, cvv, balance } = req.body;
        if (
            !cardNumber ||
            !nameOnCard ||
            !expiryDate ||
            !cvv ||
            typeof balance !== "number"
        ) {
            return res.status(400).json({ error: "Invalid request payload" });
        }

        const card = await PaymentService.addCreditCard({
            cardNumber,
            nameOnCard,
            expiryDate,
            cvv,
            balance,
        });

        res.status(201).json(card);
    } catch (err) {
        res.status(mapErrorToStatus(err.message)).json({ error: err.message });
    }
}

export async function getCreditCards(_req, res) {
    try {
        const cards = await PaymentService.getAllCreditCards();
        res.status(200).json(cards);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch credit cards" });
    }
}

export async function addBalance(req, res) {
    try {
        const { cardNumber } = req.params;
        const { amount } = req.body;

        if (!cardNumber || typeof amount !== "number") {
            return res.status(400).json({ error: "Invalid request payload" });
        }

        const result = await PaymentService.addBalance(cardNumber, amount);
        res.status(200).json(result);
    } catch (err) {
        res.status(mapErrorToStatus(err.message)).json({ error: err.message });
    }
}

export async function getBalance(req, res) {
    try {
        const { cardNumber } = req.params;
        if (!cardNumber) {
            return res.status(400).json({ error: "Card number is required" });
        }
        const result = await PaymentService.getBalance(cardNumber);
        res.status(200).json(result);
    } catch (err) {
        res.status(mapErrorToStatus(err.message)).json({ error: err.message });
    }
}
