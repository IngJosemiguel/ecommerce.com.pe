const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireCustomerOrAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const { handleError, handleValidationErrors, handleNotFound } = require('../utils/errorHandler');

// Helper function to check validation errors
const checkValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array()
    });
    return true;
  }
  return false;
};

// Helper function to verify product exists and is active
const verifyProductExists = async (product_id, includeStock = false) => {
  const fields = includeStock 
    ? 'id, name, price, stock_quantity'
    : 'id, name';
    
  const [products] = await db.execute(
    `SELECT ${fields} FROM products WHERE id = ? AND is_active = true`,
    [product_id]
  );

  if (products.length === 0) {
    return {
      error: true,
      response: {
        error: 'Producto no encontrado',
        message: 'El producto no existe o no está disponible'
      }
    };
  }
  
  return { error: false, product: products[0] };
};

const router = express.Router();

// @route   GET /api/users/cart
// @desc    Get user's shopping cart
// @access  Private
router.get('/cart', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const [cartItems] = await db.execute(`
      SELECT 
        ci.id, ci.quantity, ci.created_at, ci.updated_at,
        p.id as product_id, p.name, p.price, p.compare_price, p.stock_quantity,
        p.images, p.brand, p.weight,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ? AND p.is_active = true
      ORDER BY ci.created_at DESC
    `, [req.user.id]);

    // Calculate totals
    let subtotal = 0;
    const formattedItems = cartItems.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        item_total: itemTotal,
        in_stock: item.stock_quantity > 0,
        available_quantity: item.stock_quantity
      };
    });

    res.json({
      cart_items: formattedItems,
      summary: {
        item_count: formattedItems.length,
        total_quantity: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        estimated_tax: subtotal * 0.21, // 21% IVA
        estimated_total: subtotal * 1.21
      }
    });

  } catch (error) {
    handleError(error, res, 'Error al obtener carrito');
  }
});

// @route   POST /api/users/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/cart/add', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('ID de producto requerido'),
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe estar entre 1 y 99')
], async (req, res) => {
  try {
    // Check validation errors
    if (checkValidationErrors(req, res)) return;

    const { product_id, quantity } = req.body;

    // Verify product exists and get stock info
    const productCheck = await verifyProductExists(product_id, true);
    if (productCheck.error) {
      return res.status(404).json(productCheck.response);
    }

    const product = productCheck.product;

    // Check stock availability
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Stock insuficiente',
        message: `Solo hay ${product.stock_quantity} unidades disponibles de ${product.name}`
      });
    }

    // Check if item already exists in cart
    const [existingItem] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existingItem.length > 0) {
      // Update existing item
      const newQuantity = existingItem[0].quantity + quantity;
      
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({
          error: 'Stock insuficiente',
          message: `No puedes agregar más unidades. Stock disponible: ${product.stock_quantity}, cantidad en carrito: ${existingItem[0].quantity}`
        });
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItem[0].id]
      );

      res.json({
        message: 'Cantidad actualizada en el carrito',
        product_name: product.name,
        new_quantity: newQuantity
      });
    } else {
      // Add new item
      await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );

      res.status(201).json({
        message: 'Producto agregado al carrito',
        product_name: product.name,
        quantity: quantity
      });
    }

  } catch (error) {
    handleError(error, res, 'Error al agregar al carrito');
  }
});

// @route   PUT /api/users/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/:itemId', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe estar entre 1 y 99')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const itemId = req.params.itemId;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const [cartItems] = await db.execute(`
      SELECT ci.id, ci.product_id, p.name, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ? AND p.is_active = true
    `, [itemId, req.user.id]);

    if (cartItems.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado en el carrito',
        message: 'El producto no existe en tu carrito o no está disponible'
      });
    }

    const cartItem = cartItems[0];

    // Check stock availability
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Stock insuficiente',
        message: `Solo hay ${cartItem.stock_quantity} unidades disponibles de ${cartItem.name}`
      });
    }

    // Update quantity
    await db.execute(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, itemId]
    );

    res.json({
      message: 'Cantidad actualizada exitosamente',
      product_name: cartItem.name,
      new_quantity: quantity
    });

  } catch (error) {
    handleError(error, res, 'Error al actualizar carrito');
  }
});

// @route   DELETE /api/users/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Check if cart item exists and belongs to user
    const [cartItems] = await db.execute(`
      SELECT ci.id, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ?
    `, [itemId, req.user.id]);

    if (cartItems.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado en el carrito',
        message: 'El producto no existe en tu carrito'
      });
    }

    // Remove item
    await db.execute('DELETE FROM cart_items WHERE id = ?', [itemId]);

    res.json({
      message: 'Producto eliminado del carrito',
      product_name: cartItems[0].name
    });

  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el producto del carrito'
    });
  }
});

// @route   DELETE /api/users/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/cart', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    // Get count before deletion
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );

    const itemCount = countResult[0].count;

    if (itemCount === 0) {
      return res.status(400).json({
        error: 'Carrito vacío',
        message: 'Tu carrito ya está vacío'
      });
    }

    // Clear cart
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    res.json({
      message: 'Carrito vaciado exitosamente',
      items_removed: itemCount
    });

  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo vaciar el carrito'
    });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const [wishlistItems] = await db.execute(`
      SELECT 
        wi.id, wi.created_at,
        p.id as product_id, p.name, p.price, p.compare_price, p.stock_quantity,
        p.images, p.brand,
        c.name as category_name
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE wi.user_id = ? AND p.is_active = true
      ORDER BY wi.created_at DESC
    `, [req.user.id]);

    const formattedItems = wishlistItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
      in_stock: item.stock_quantity > 0
    }));

    res.json({
      wishlist_items: formattedItems,
      item_count: formattedItems.length
    });

  } catch (error) {
    console.error('Error al obtener wishlist:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la lista de deseos'
    });
  }
});

// @route   POST /api/users/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post('/wishlist/add', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('ID de producto requerido')
], async (req, res) => {
  try {
    // Check validation errors
    if (checkValidationErrors(req, res)) return;

    const { product_id } = req.body;

    // Verify product exists
    const productCheck = await verifyProductExists(product_id);
    if (productCheck.error) {
      return res.status(404).json(productCheck.response);
    }

    const product = productCheck.product;

    // Check if item already exists in wishlist
    const [existingItem] = await db.execute(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existingItem.length > 0) {
      return res.status(409).json({
        error: 'Producto ya en la lista',
        message: 'Este producto ya está en tu lista de deseos'
      });
    }

    // Add to wishlist
    await db.execute(
      'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );

    res.status(201).json({
      message: 'Producto agregado a la lista de deseos',
      product_name: product.name
    });

  } catch (error) {
    console.error('Error al agregar a wishlist:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo agregar el producto a la lista de deseos'
    });
  }
});

// @route   DELETE /api/users/wishlist/:itemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/wishlist/:itemId', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Check if wishlist item exists and belongs to user
    const [wishlistItems] = await db.execute(`
      SELECT wi.id, p.name
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.id = ? AND wi.user_id = ?
    `, [itemId, req.user.id]);

    if (wishlistItems.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado en la lista',
        message: 'El producto no existe en tu lista de deseos'
      });
    }

    // Remove item
    await db.execute('DELETE FROM wishlist_items WHERE id = ?', [itemId]);

    res.json({
      message: 'Producto eliminado de la lista de deseos',
      product_name: wishlistItems[0].name
    });

  } catch (error) {
    console.error('Error al eliminar de wishlist:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el producto de la lista de deseos'
    });
  }
});

// @route   POST /api/users/wishlist/:itemId/move-to-cart
// @desc    Move item from wishlist to cart
// @access  Private
router.post('/wishlist/:itemId/move-to-cart', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('La cantidad debe estar entre 1 y 99')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const itemId = req.params.itemId;
    const { quantity = 1 } = req.body;

    // Check if wishlist item exists and belongs to user
    const [wishlistItems] = await db.execute(`
      SELECT wi.id, wi.product_id, p.name, p.stock_quantity
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.id = ? AND wi.user_id = ? AND p.is_active = true
    `, [itemId, req.user.id]);

    if (wishlistItems.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: 'El producto no existe en tu lista de deseos o no está disponible'
      });
    }

    const wishlistItem = wishlistItems[0];

    // Check stock availability
    if (wishlistItem.stock_quantity < quantity) {
      return res.status(400).json({
        error: 'Stock insuficiente',
        message: `Solo hay ${wishlistItem.stock_quantity} unidades disponibles de ${wishlistItem.name}`
      });
    }

    // Check if item already exists in cart
    const [existingCartItem] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, wishlistItem.product_id]
    );

    if (existingCartItem.length > 0) {
      // Update existing cart item
      const newQuantity = existingCartItem[0].quantity + quantity;
      
      if (newQuantity > wishlistItem.stock_quantity) {
        return res.status(400).json({
          error: 'Stock insuficiente',
          message: `No puedes agregar más unidades. Stock disponible: ${wishlistItem.stock_quantity}, cantidad en carrito: ${existingCartItem[0].quantity}`
        });
      }

      await db.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingCartItem[0].id]
      );
    } else {
      // Add new cart item
      await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, wishlistItem.product_id, quantity]
      );
    }

    // Remove from wishlist
    await db.execute('DELETE FROM wishlist_items WHERE id = ?', [itemId]);

    res.json({
      message: 'Producto movido al carrito exitosamente',
      product_name: wishlistItem.name,
      quantity: quantity
    });

  } catch (error) {
    console.error('Error al mover a carrito:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo mover el producto al carrito'
    });
  }
});

// @route   GET /api/users/profile/addresses
// @desc    Get user's saved addresses
// @access  Private
router.get('/profile/addresses', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    // For now, we'll return addresses from recent orders
    // In a full implementation, you'd have a separate addresses table
    const [addresses] = await db.execute(`
      SELECT DISTINCT
        shipping_address,
        billing_address,
        created_at
      FROM orders
      WHERE user_id = ? AND (shipping_address IS NOT NULL OR billing_address IS NOT NULL)
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.user.id]);

    const formattedAddresses = [];
    const seenAddresses = new Set();

    addresses.forEach(order => {
      if (order.shipping_address) {
        const addr = JSON.parse(order.shipping_address);
        const key = JSON.stringify(addr);
        if (!seenAddresses.has(key)) {
          seenAddresses.add(key);
          formattedAddresses.push({
            type: 'shipping',
            ...addr,
            last_used: order.created_at
          });
        }
      }
      
      if (order.billing_address) {
        const addr = JSON.parse(order.billing_address);
        const key = JSON.stringify(addr);
        if (!seenAddresses.has(key)) {
          seenAddresses.add(key);
          formattedAddresses.push({
            type: 'billing',
            ...addr,
            last_used: order.created_at
          });
        }
      }
    });

    res.json({
      addresses: formattedAddresses
    });

  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las direcciones'
    });
  }
});

module.exports = router;