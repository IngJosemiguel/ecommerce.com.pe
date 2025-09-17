const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Get various statistics for dashboard
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
      FROM users
    `);

    const [productStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock_quantity <= 10 AND stock_quantity > 0 THEN 1 END) as low_stock
      FROM products
    `);

    const [orderStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as orders_30d,
        SUM(CASE WHEN status IN ('delivered', 'shipped', 'processing') THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status IN ('delivered', 'shipped', 'processing') THEN total_amount ELSE 0 END) as revenue_30d
      FROM orders
    `);

    const [recentOrders] = await db.execute(`
      SELECT 
        o.id, o.order_number, o.status, o.total_amount, o.created_at,
        u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const [topProducts] = await db.execute(`
      SELECT 
        p.id, p.name, p.price, p.stock_quantity,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('delivered', 'shipped', 'processing') OR o.status IS NULL
      GROUP BY p.id, p.name, p.price, p.stock_quantity
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    const [monthlyRevenue] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE status IN ('delivered', 'shipped', 'processing')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      users: userStats[0],
      products: productStats[0],
      orders: orderStats[0],
      recent_orders: recentOrders,
      top_products: topProducts,
      monthly_revenue: monthlyRevenue
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin only
router.get('/users', [
  authenticateToken,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('role').optional().isIn(['customer', 'admin']).withMessage('Rol inválido'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Búsqueda debe tener entre 1 y 100 caracteres')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { role, search } = req.query;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (role) {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    const totalUsers = countResult[0].total;

    // Get users
    const [users] = await db.execute(`
      SELECT 
        id, first_name, last_name, email, role, is_active, 
        created_at, updated_at, last_login
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get order counts for each user
    const userIds = users.map(user => user.id);
    let orderCounts = {};
    
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const [orderCountsResult] = await db.execute(`
        SELECT 
          user_id,
          COUNT(*) as order_count,
          SUM(total_amount) as total_spent
        FROM orders 
        WHERE user_id IN (${placeholders})
        GROUP BY user_id
      `, userIds);
      
      orderCountsResult.forEach(row => {
        orderCounts[row.user_id] = {
          order_count: row.order_count,
          total_spent: row.total_spent
        };
      });
    }

    // Format users with additional info
    const formattedUsers = users.map(user => ({
      ...user,
      order_count: orderCounts[user.id]?.order_count || 0,
      total_spent: orderCounts[user.id]?.total_spent || 0
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalUsers / limit),
        total_users: totalUsers,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los usuarios'
    });
  }
});

// @route   PUT /api/admin/users/:userId/status
// @desc    Update user status (activate/deactivate)
// @access  Admin only
router.put('/users/:userId/status', [
  authenticateToken,
  requireAdmin,
  body('is_active')
    .isBoolean()
    .withMessage('Estado debe ser verdadero o falso')
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

    const userId = req.params.userId;
    const { is_active } = req.body;

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const user = users[0];

    // Prevent deactivating yourself
    if (user.id === req.user.id && !is_active) {
      return res.status(400).json({
        error: 'Acción no permitida',
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Update user status
    await db.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, userId]
    );

    res.json({
      message: `Usuario ${is_active ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        is_active: is_active
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el estado del usuario'
    });
  }
});

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:userId/role', [
  authenticateToken,
  requireAdmin,
  body('role')
    .isIn(['customer', 'admin'])
    .withMessage('Rol debe ser customer o admin')
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

    const userId = req.params.userId;
    const { role } = req.body;

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const user = users[0];

    // Prevent changing your own role from admin to customer
    if (user.id === req.user.id && user.role === 'admin' && role === 'customer') {
      return res.status(400).json({
        error: 'Acción no permitida',
        message: 'No puedes cambiar tu propio rol de administrador'
      });
    }

    // Update user role
    await db.execute(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, userId]
    );

    res.json({
      message: `Rol de usuario actualizado a ${role}`,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        old_role: user.role,
        new_role: role
      }
    });

  } catch (error) {
    console.error('Error al actualizar rol del usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el rol del usuario'
    });
  }
});

// @route   GET /api/admin/products/low-stock
// @desc    Get products with low stock
// @access  Admin only
router.get('/products/low-stock', [
  authenticateToken,
  requireAdmin,
  query('threshold').optional().isInt({ min: 0, max: 100 }).withMessage('Umbral debe estar entre 0 y 100')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: errors.array()
      });
    }

    const threshold = parseInt(req.query.threshold) || 10;

    const [products] = await db.execute(`
      SELECT 
        p.id, p.name, p.sku, p.price, p.stock_quantity, p.is_active,
        c.name as category_name,
        COUNT(oi.id) as recent_sales
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE p.stock_quantity <= ? AND p.is_active = true
      GROUP BY p.id, p.name, p.sku, p.price, p.stock_quantity, p.is_active, c.name
      ORDER BY p.stock_quantity ASC, recent_sales DESC
    `, [threshold]);

    res.json({
      low_stock_products: products,
      threshold: threshold,
      count: products.length
    });

  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los productos con stock bajo'
    });
  }
});

// @route   GET /api/admin/orders/recent
// @desc    Get recent orders with details
// @access  Admin only
router.get('/orders/recent', [
  authenticateToken,
  requireAdmin,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Estado inválido')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 20;
    const { status } = req.query;

    let whereClause = '';
    const queryParams = [];

    if (status) {
      whereClause = 'WHERE o.status = ?';
      queryParams.push(status);
    }

    const [orders] = await db.execute(`
      SELECT 
        o.id, o.order_number, o.status, o.total_amount, o.created_at, o.updated_at,
        u.first_name, u.last_name, u.email,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, o.updated_at,
               u.first_name, u.last_name, u.email
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [...queryParams, limit]);

    res.json({
      recent_orders: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error al obtener órdenes recientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las órdenes recientes'
    });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics
// @access  Admin only
router.get('/analytics/sales', [
  authenticateToken,
  requireAdmin,
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Período inválido'),
  query('group_by').optional().isIn(['day', 'week', 'month']).withMessage('Agrupación inválida')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: errors.array()
      });
    }

    const period = req.query.period || '30d';
    const groupBy = req.query.group_by || 'day';

    // Determine date range
    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      case '1y':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
    }

    // Determine grouping
    let dateFormat = '';
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    const [salesData] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status IN ('delivered', 'shipped', 'processing')
        AND created_at >= ${dateFilter}
      GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
      ORDER BY period ASC
    `);

    // Get top selling products for the period
    const [topProducts] = await db.execute(`
      SELECT 
        p.id, p.name, p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status IN ('delivered', 'shipped', 'processing')
        AND o.created_at >= ${dateFilter}
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Calculate totals
    const totals = salesData.reduce((acc, row) => {
      acc.total_orders += row.order_count;
      acc.total_revenue += parseFloat(row.revenue);
      return acc;
    }, { total_orders: 0, total_revenue: 0 });

    res.json({
      period: period,
      group_by: groupBy,
      sales_data: salesData,
      top_products: topProducts,
      summary: {
        ...totals,
        avg_order_value: totals.total_orders > 0 ? totals.total_revenue / totals.total_orders : 0
      }
    });

  } catch (error) {
    console.error('Error al obtener analíticas de ventas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las analíticas de ventas'
    });
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Admin only
router.post('/categories', [
  authenticateToken,
  requireAdmin,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre de categoría requerido (1-100 caracteres)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Estado debe ser verdadero o falso')
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

    const { name, description = '', is_active = true } = req.body;

    // Check if category name already exists
    const [existingCategory] = await db.execute(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({
        error: 'Categoría ya existe',
        message: 'Ya existe una categoría con este nombre'
      });
    }

    // Create category
    const [result] = await db.execute(
      'INSERT INTO categories (name, description, is_active) VALUES (?, ?, ?)',
      [name, description, is_active]
    );

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: {
        id: result.insertId,
        name: name,
        description: description,
        is_active: is_active
      }
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la categoría'
    });
  }
});

// @route   PUT /api/admin/categories/:categoryId
// @desc    Update category
// @access  Admin only
router.put('/categories/:categoryId', [
  authenticateToken,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre de categoría debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Estado debe ser verdadero o falso')
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

    const categoryId = req.params.categoryId;
    const { name, description, is_active } = req.body;

    // Check if category exists
    const [categories] = await db.execute(
      'SELECT id, name, description, is_active FROM categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada',
        message: 'La categoría especificada no existe'
      });
    }

    const category = categories[0];

    // Check if new name already exists (if name is being changed)
    if (name && name !== category.name) {
      const [existingCategory] = await db.execute(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, categoryId]
      );

      if (existingCategory.length > 0) {
        return res.status(409).json({
          error: 'Nombre ya existe',
          message: 'Ya existe otra categoría con este nombre'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Sin cambios',
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(categoryId);

    // Update category
    await db.execute(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated category
    const [updatedCategory] = await db.execute(
      'SELECT id, name, description, is_active, updated_at FROM categories WHERE id = ?',
      [categoryId]
    );

    res.json({
      message: 'Categoría actualizada exitosamente',
      category: updatedCategory[0]
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar la categoría'
    });
  }
});

// @route   DELETE /api/admin/categories/:categoryId
// @desc    Delete category (only if no products are associated)
// @access  Admin only
router.delete('/categories/:categoryId', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check if category exists
    const [categories] = await db.execute(
      'SELECT id, name FROM categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada',
        message: 'La categoría especificada no existe'
      });
    }

    const category = categories[0];

    // Check if category has associated products
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [categoryId]
    );

    if (products[0].count > 0) {
      return res.status(400).json({
        error: 'Categoría en uso',
        message: `No se puede eliminar la categoría porque tiene ${products[0].count} producto(s) asociado(s)`,
        suggestion: 'Primero mueve o elimina los productos de esta categoría'
      });
    }

    // Delete category
    await db.execute('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({
      message: 'Categoría eliminada exitosamente',
      category_name: category.name
    });

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar la categoría'
    });
  }
});

module.exports = router;