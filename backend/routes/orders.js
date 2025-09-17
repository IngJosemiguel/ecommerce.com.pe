const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireCustomerOrAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const { VALID_PAYMENT_STATUSES } = require('../constants');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get orders (all for admin, user's orders for customers)
// @access  Private
router.get('/', [
  authenticateToken,
  requireCustomerOrAdmin,
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Estado inválido'),
  query('payment_status').optional().isIn(VALID_PAYMENT_STATUSES).withMessage('Estado de pago inválido')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parámetros de consulta inválidos',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      search,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      conditions.push('o.user_id = ?');
      params.push(req.user.id);
    }

    // Build WHERE conditions
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (payment_status) {
      conditions.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (search) {
      conditions.push('(o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (start_date) {
      conditions.push('DATE(o.created_at) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(o.created_at) <= ?');
      params.push(end_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get orders with user info
    const [orders] = await db.execute(`
      SELECT 
        o.id, o.order_number, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.tax_amount, o.shipping_amount, o.discount_amount, o.total_amount,
        o.currency, o.tracking_number, o.notes, o.created_at, o.updated_at,
        o.shipped_at, o.delivered_at,
        u.id as user_id, u.email, u.first_name, u.last_name,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count for pagination
    const [countResult] = await db.execute(`
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format orders
    const formattedOrders = orders.map(order => ({
      ...order,
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
      billing_address: order.billing_address ? JSON.parse(order.billing_address) : null
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las órdenes'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get order with user info
    const [orders] = await db.execute(`
      SELECT 
        o.*,
        u.id as user_id, u.email, u.first_name, u.last_name, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        message: 'La orden solicitada no existe'
      });
    }

    const order = orders[0];

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver esta orden'
      });
    }

    // Get order items with product info
    const [orderItems] = await db.execute(`
      SELECT 
        oi.*,
        p.name as product_name, p.images as product_images, p.sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `, [orderId]);

    // Get payment transactions
    const [transactions] = await db.execute(`
      SELECT id, transaction_id, payment_method, amount, currency, status, created_at
      FROM payment_transactions
      WHERE order_id = ?
      ORDER BY created_at DESC
    `, [orderId]);

    // Format data
    order.shipping_address = order.shipping_address ? JSON.parse(order.shipping_address) : null;
    order.billing_address = order.billing_address ? JSON.parse(order.billing_address) : null;
    
    order.items = orderItems.map(item => ({
      ...item,
      product_snapshot: item.product_snapshot ? JSON.parse(item.product_snapshot) : null,
      product_images: item.product_images ? JSON.parse(item.product_images) : []
    }));

    order.transactions = transactions;

    res.json({
      order
    });

  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la orden'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Estado de orden inválido'),
  body('tracking_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de seguimiento no puede exceder 100 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
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

    const orderId = req.params.id;
    const { status, tracking_number, notes } = req.body;

    // Check if order exists
    const [existingOrder] = await db.execute(
      'SELECT id, status as current_status, order_number FROM orders WHERE id = ?',
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        message: 'La orden que intentas actualizar no existe'
      });
    }

    const order = existingOrder[0];

    // Prepare update fields
    const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const updateValues = [status];

    // Add timestamp fields based on status
    if (status === 'shipped' && order.current_status !== 'shipped') {
      updateFields.push('shipped_at = CURRENT_TIMESTAMP');
    }
    
    if (status === 'delivered' && order.current_status !== 'delivered') {
      updateFields.push('delivered_at = CURRENT_TIMESTAMP');
    }

    // Add optional fields
    if (tracking_number !== undefined) {
      updateFields.push('tracking_number = ?');
      updateValues.push(tracking_number);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    updateValues.push(orderId);

    // Update order
    await db.execute(`
      UPDATE orders SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // If order is cancelled, restore product stock
    if (status === 'cancelled' && !['cancelled', 'refunded'].includes(order.current_status)) {
      const [orderItems] = await db.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );

      for (const item of orderItems) {
        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    res.json({
      message: 'Estado de orden actualizado exitosamente',
      order_number: order.order_number,
      new_status: status
    });

  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el estado de la orden'
    });
  }
});

// @route   PUT /api/orders/:id/payment-status
// @desc    Update order payment status
// @access  Private (Admin only)
router.put('/:id/payment-status', [
  authenticateToken,
  requireAdmin,
  body('payment_status')
    .isIn(VALID_PAYMENT_STATUSES)
    .withMessage('Estado de pago inválido')
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

    const orderId = req.params.id;
    const { payment_status } = req.body;

    // Check if order exists
    const [existingOrder] = await db.execute(
      'SELECT id, order_number FROM orders WHERE id = ?',
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        message: 'La orden que intentas actualizar no existe'
      });
    }

    // Update payment status
    await db.execute(
      'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [payment_status, orderId]
    );

    res.json({
      message: 'Estado de pago actualizado exitosamente',
      order_number: existingOrder[0].order_number,
      new_payment_status: payment_status
    });

  } catch (error) {
    console.error('Error al actualizar estado de pago:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el estado de pago'
    });
  }
});

// @route   GET /api/orders/stats/dashboard
// @desc    Get order statistics for dashboard
// @access  Private (Admin only)
router.get('/stats/dashboard', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // Total orders
    const [totalOrders] = await db.execute(
      'SELECT COUNT(*) as total FROM orders'
    );

    // Orders in period
    const [periodOrders] = await db.execute(
      'SELECT COUNT(*) as total FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      [parseInt(period)]
    );

    // Revenue in period
    const [periodRevenue] = await db.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders 
      WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [parseInt(period)]);

    // Orders by status
    const [ordersByStatus] = await db.execute(`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY status
    `, [parseInt(period)]);

    // Orders by payment status
    const [ordersByPaymentStatus] = await db.execute(`
      SELECT payment_status, COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY payment_status
    `, [parseInt(period)]);

    // Daily orders (last 7 days)
    const [dailyOrders] = await db.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Top customers (by order count)
    const [topCustomers] = await db.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.id
      ORDER BY order_count DESC, total_spent DESC
      LIMIT 5
    `, [parseInt(period)]);

    res.json({
      summary: {
        total_orders: totalOrders[0].total,
        period_orders: periodOrders[0].total,
        period_revenue: parseFloat(periodRevenue[0].total),
        period_days: parseInt(period)
      },
      orders_by_status: ordersByStatus,
      orders_by_payment_status: ordersByPaymentStatus,
      daily_stats: dailyOrders,
      top_customers: topCustomers
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order (admin only, for cleanup)
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if order exists
    const [existingOrder] = await db.execute(
      'SELECT id, order_number, status FROM orders WHERE id = ?',
      [orderId]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        message: 'La orden que intentas eliminar no existe'
      });
    }

    const order = existingOrder[0];

    // Only allow deletion of cancelled or failed orders
    if (!['cancelled', 'failed'].includes(order.status)) {
      return res.status(400).json({
        error: 'No se puede eliminar',
        message: 'Solo se pueden eliminar órdenes canceladas o fallidas'
      });
    }

    // Delete order (cascade will handle order_items and payment_transactions)
    await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);

    res.json({
      message: 'Orden eliminada exitosamente',
      order_number: order.order_number
    });

  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar la orden'
    });
  }
});

module.exports = router;