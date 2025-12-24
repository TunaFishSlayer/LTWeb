import CartService from '../services/cartService.js';

const sendNotFoundOrNext = (err, res, next) => {
    if (err && err.message === 'Cart not found') {
        return res.status(404).json({ message: err.message });
    }
    return next(err);
};
class CartController {
    // POST /carts
    static async create(req, res, next) {
        try {
            const cart = await CartService.createCart(req.body);
            res.status(201).json(cart);
        } catch (err) {
            next(err);
        }
    };

    // GET /carts/:id
    static async getById(req, res, next) {
        try {
            const cart = await CartService.getCartById(req.params.id);
            res.json(cart);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };

    // GET /carts/user/:userId
    static async getByUserId(req, res, next) {
        try {
            const cart = await CartService.getCartByUserId(req.params.userId);
            if (!cart) return res.status(404).json({ message: 'Cart not found' });
            res.json(cart);
        } catch (err) {
            next(err);
        }
    };

    // GET /carts
    static async list(req, res, next) {
        try {
            const { page, limit, sort, ...filter } = req.query || {};
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.max(1, parseInt(limit, 10) || 20);
            const result = await CartService.listCarts({
                filter,
                page: pageNum,
                limit: limitNum,
                sort: sort || '-createdAt',
            });
            res.json(result);
        } catch (err) {
            next(err);
        }
    };

    // PATCH /carts/:id
    static async update(req, res, next) {
        try {
            const updated = await CartService.updateCart(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };

    // DELETE /carts/:id
    static async remove(req, res, next) {
        try {
            const ok = await CartService.deleteCart(req.params.id);
            if (!ok) return res.status(404).json({ message: 'Cart not found' });
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };

    // POST /carts/:id/items
    static async addItem(req, res, next) {
        try {
            const cart = await CartService.addItem(req.params.id, req.body);
            res.json(cart);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };

    // PUT /carts/:id/items/:productId
    static async setItemQuantity(req, res, next) {
        try {
            const quantity = Number(req.body?.quantity);
            if (!Number.isFinite(quantity)) {
                return res.status(400).json({ message: 'Invalid quantity' });
            }
            const cart = await CartService.setItemQuantity(
                req.params.id,
                req.params.productId,
                quantity
            );
            res.json(cart);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };

    // DELETE /carts/:id/items/:productId
    static async removeItem(req, res, next) {
        try {
            const cart = await CartService.removeItem(req.params.id, req.params.productId);
            res.json(cart);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };

    // DELETE /carts/:id/items
    static async clear(req, res, next) {
        try {
            const cart = await CartService.clearCart(req.params.id);
            res.json(cart);
        } catch (err) {
            sendNotFoundOrNext(err, res, next);
        }
    };
};

export default CartController;