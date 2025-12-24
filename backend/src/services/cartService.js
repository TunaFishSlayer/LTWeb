import Cart from '../models/Cart.js';
import Laptop from '../models/Laptop.js';

class CartService {
        /**
     * Cart service: CRUD operations and common item helpers.
     * Assumes a Mongoose Cart model at ../models/Cart with shape:
     * {
     *   user: ObjectId,
     *   items: [{ laptop: ObjectId, quantity: Number, price?: Number }],
     *   ...timestamps
     * }
     */

    /**
     * Create a new cart.
     * @param {Object} data - Cart data { user, items?, ... }
     * @returns {Promise<Object>}
     */
    static async createCart(data) {
        if (!data || !data.user) throw new Error('User id required to create cart');
        const existing = await Cart.findOne({ user: data.user }).lean();
        if (existing) return existing;
        const cart = await Cart.create(data);
        return cart.toObject ? cart.toObject() : cart;
    }

    /**
     * Get a cart by id.
     * @param {string} id
     * @returns {Promise<Object>}
     */
    static async getCartById(id) {
        const cart = await Cart.findById(id);
        if (!cart) throw new Error('Cart not found');
        return cart;
    }

    /**
     * Get a cart by user id.
     * @param {string} userId
     * @returns {Promise<Object|null>}
     */
    static async getCartByUserId(userId) {
        return Cart.findOne({ user: userId });
    }

    /**
     * List carts with pagination.
     * @param {Object} options
     * @param {Object} options.filter
     * @param {number} options.page
     * @param {number} options.limit
     * @param {Object|string} options.sort
     * @returns {Promise<{data: Object[], page: number, limit: number, total: number}>}
     */
    static async listCarts({ filter = {}, page = 1, limit = 20, sort = '-createdAt' } = {}) {
        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
        const [data, total] = await Promise.all([
            Cart.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Cart.countDocuments(filter),
        ]);
        return { data, page: Math.max(1, page), limit: Math.max(1, limit), total };
    }

    /**
     * Update a cart by id.
     * @param {string} id
     * @param {Object} updates
     * @returns {Promise<Object>}
     */
    static async updateCart(id, updates) {
        // Never allow _id updates
        if ('_id' in updates) delete updates._id;

        const updated = await Cart.findByIdAndUpdate(id, updates, { new: true }).lean();
        if (!updated) throw new Error('Cart not found');
        return updated;
    }

    /**
     * Delete a cart by id.
     * @param {string} id
     * @returns {Promise<boolean>} - true if deleted
     */
    static async deleteCart(id) {
        const res = await Cart.findByIdAndDelete(id);
        return Boolean(res);
    }

    /**
     * Add an item to a cart (or increment quantity if it exists).
     * @param {string} cartId
     * @param {{ laptop: string, quantity: number, price?: number }} item
     * @returns {Promise<Object>}
     */
    static async addItem(cartId, item) {
        if (!item || !item.laptop || typeof item.quantity !== 'number') {
            throw new Error('Invalid item payload');
        }
        if (item.quantity === 0) return this.getCartById(cartId);

        // Check stock availability BEFORE modifying cart
        const laptop = await laptop.findById(item.laptop);
        if (!laptop) {
            throw new Error('laptop not found');
        }

        // Get current quantity in cart (if exists)
        const cart = await Cart.findById(cartId);
        const existingItem = cart?.items.find(i => i.laptop.toString() === item.laptop.toString());
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newTotalQuantity = currentQuantity + item.quantity;

        // Validate stock availability
        if (newTotalQuantity > laptop.stock) {
            throw new Error(`Insufficient stock. Available: ${laptop.stock}, Requested: ${newTotalQuantity}`);
        }
        if (newTotalQuantity < 0) {
            throw new Error('Quantity cannot be negative');
        }

        // Try increment if exists
        const incRes = await Cart.updateOne(
            { _id: cartId, 'items.laptop': item.laptop },
            { $inc: { 'items.$.quantity': item.quantity } }
        );

        // If no matched item, push a new item (only if quantity > 0)
        if (incRes.matchedCount === 0 && item.quantity > 0) {
            await Cart.updateOne({ _id: cartId }, { $push: { items: item } });
        }

        // Remove any items that may have dropped to <= 0
        await Cart.updateOne({ _id: cartId }, { $pull: { items: { quantity: { $lte: 0 } } } });

    return this.getCartById(cartId);
    }

    /**
     * Set exact quantity for an item. Removes item if quantity <= 0.
     * @param {string} cartId
     * @param {string} laptopId
     * @param {number} quantity
     * @returns {Promise<Object>}
     */
    static async setItemQuantity(cartId, laptopId, quantity) {
        if (quantity <= 0) {
            await Cart.updateOne({ _id: cartId }, { $pull: { items: { laptop: laptopId } } });
            return this.getCartById(cartId);
        }

        // Update existing item
        const upd = await Cart.updateOne(
            { _id: cartId, 'items.laptop': laptopId },
            { $set: { 'items.$.quantity': quantity } }
        );

        // If not exists, add it
        if (upd.matchedCount === 0) {
            await Cart.updateOne(
                { _id: cartId },
                { $push: { items: { laptop: laptopId, quantity } } }
            );
        }

        return this.getCartById(cartId);
    }

    /**
     * Remove an item from a cart.
     * @param {string} cartId
     * @param {string} laptopId
     * @returns {Promise<Object>}
     */
    static async removeItem(cartId, laptopId) {
        await Cart.updateOne({ _id: cartId }, { $pull: { items: { laptop: laptopId } } });
        return this.getCartById(cartId);
    }

    /**
     * Clear all items in a cart.
     * @param {string} cartId
     * @returns {Promise<Object>}
     */
    static async clearCart(cartId) {
        await Cart.updateOne({ _id: cartId }, { $set: { items: [] } });
        return this.getCartById(cartId);
    }
}


export default CartService;