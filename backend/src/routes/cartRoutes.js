// filepath: c:\Users\admin\Documents\LTWeb\backend\src\routes\cartRoutes.js
import express from 'express';
import CartController from '../controllers/cartController.js';

const router = express.Router();

// GET /carts
router.get('/', CartController.list);

// POST /carts
router.post('/', CartController.create);

// GET /carts/user/:userId
router.get('/user/:userId', CartController.getByUserId);

// GET /carts/:id
router.get('/:id', CartController.getById);

// PATCH /carts/:id
router.patch('/:id', CartController.update);

// DELETE /carts/:id
router.delete('/:id', CartController.remove);

// POST /carts/:id/items
router.post('/:id/items', CartController.addItem);

// PUT /carts/:id/items/:productId
router.put('/:id/items/:productId', CartController.setItemQuantity);

// DELETE /carts/:id/items/:productId
router.delete('/:id/items/:productId', CartController.removeItem);

// DELETE /carts/:id/items
router.delete('/:id/items', CartController.clear);

export default router;