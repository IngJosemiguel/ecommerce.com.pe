const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { handleError, handleValidationErrors, handleNotFound } = require('../utils/errorHandler');

const router = express.Router();

// Helper function to check validation errors
const checkValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Datos del producto inválidos',
      details: errors.array()
    });
    return true;
  }
  return false;
};

// Helper function to check SKU uniqueness
const checkSkuUniqueness = async (sku, excludeId = null) => {
  if (!sku) return null;
  
  const query = excludeId 
    ? 'SELECT id FROM products WHERE sku = ? AND id != ?'
    : 'SELECT id FROM products WHERE sku = ?';
  const params = excludeId ? [sku, excludeId] : [sku];
  
  const [existingSku] = await db.execute(query, params);
  
  if (existingSku.length > 0) {
    return {
      error: 'SKU duplicado',
      message: excludeId 
        ? 'Ya existe otro producto con este SKU'
        : 'Ya existe un producto con este SKU'
    };
  }
  return null;
};

// Helper function to verify category exists
const verifyCategoryExists = async (category_id) => {
  if (!category_id) return null;
  
  const [categories] = await db.execute(
    'SELECT id FROM categories WHERE id = ? AND is_active = true',
    [category_id]
  );
  
  if (categories.length === 0) {
    return {
      error: 'Categoría inválida',
      message: 'La categoría especificada no existe'
    };
  }
  return null;
};

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('La descripción no puede exceder 5000 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('compare_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio de comparación debe ser un número positivo'),
  body('cost_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio de costo debe ser un número positivo'),
  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('La cantidad en stock debe ser un número entero positivo'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un ID válido'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El peso debe ser un número positivo'),
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El SKU no puede exceder 100 caracteres')
];

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
  query('category_id').optional().isInt({ min: 1 }).withMessage('La categoría debe ser un ID válido'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('El precio mínimo debe ser positivo'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('El precio máximo debe ser positivo'),
  query('sort_by').optional().isIn(['name', 'price', 'created_at', 'stock_quantity']).withMessage('Campo de ordenamiento inválido'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Orden debe ser asc o desc')
], optionalAuth, async (req, res) => {
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
      limit = 12,
      search = '',
      category_id,
      min_price,
      max_price,
      brand,
      sort_by = 'created_at',
      sort_order = 'desc',
      is_featured
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = ['p.is_active = true'];
    const params = [];

    // Build WHERE conditions
    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (min_price) {
      conditions.push('p.price >= ?');
      params.push(min_price);
    }

    if (max_price) {
      conditions.push('p.price <= ?');
      params.push(max_price);
    }

    if (brand) {
      conditions.push('p.brand = ?');
      params.push(brand);
    }

    if (is_featured === 'true') {
      conditions.push('p.is_featured = true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY p.${sort_by} ${sort_order.toUpperCase()}`;

    // Get products with category info
    const [products] = await db.execute(`
      SELECT 
        p.id, p.name, p.description, p.price, p.compare_price, 
        p.stock_quantity, p.brand, p.images, p.is_featured,
        p.seo_title, p.seo_description, p.created_at, p.updated_at,
        c.name as category_name, c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count for pagination
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON fields
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      in_stock: product.stock_quantity > 0
    }));

    res.json({
      products: formattedProducts,
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
    handleError(error, res, 'Error al obtener productos');
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await db.execute(`
      SELECT 
        p.*, 
        c.name as category_name, c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = true
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: 'El producto solicitado no existe o no está disponible'
      });
    }

    const product = products[0];

    // Parse JSON fields
    product.images = product.images ? JSON.parse(product.images) : [];
    product.tags = product.tags ? JSON.parse(product.tags) : [];
    product.in_stock = product.stock_quantity > 0;

    // Get related products (same category, excluding current product)
    const [relatedProducts] = await db.execute(`
      SELECT id, name, price, images, stock_quantity
      FROM products 
      WHERE category_id = ? AND id != ? AND is_active = true
      ORDER BY RAND()
      LIMIT 4
    `, [product.category_id, productId]);

    const formattedRelatedProducts = relatedProducts.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      in_stock: p.stock_quantity > 0
    }));

    res.json({
      product,
      related_products: formattedRelatedProducts
    });

  } catch (error) {
    handleError(error, res, 'Error al obtener producto');
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', [authenticateToken, requireAdmin, ...productValidation], async (req, res) => {
  try {
    // Check validation errors
    if (checkValidationErrors(req, res)) return;

    const {
      name, description, price, compare_price, cost_price, sku, barcode,
      stock_quantity, min_stock_level, weight, dimensions, category_id,
      brand, tags, images, is_featured, seo_title, seo_description
    } = req.body;

    // Check SKU uniqueness
    const skuError = await checkSkuUniqueness(sku);
    if (skuError) {
      return res.status(409).json(skuError);
    }

    // Verify category exists
    const categoryError = await verifyCategoryExists(category_id);
    if (categoryError) {
      return res.status(400).json(categoryError);
    }

    // Insert product
    const [result] = await db.execute(`
      INSERT INTO products (
        name, description, price, compare_price, cost_price, sku, barcode,
        stock_quantity, min_stock_level, weight, dimensions, category_id,
        brand, tags, images, is_featured, seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, description, price, compare_price || null, cost_price || null,
      sku || null, barcode || null, stock_quantity, min_stock_level || 5,
      weight || null, dimensions || null, category_id || null, brand || null,
      tags ? JSON.stringify(tags) : null, images ? JSON.stringify(images) : null,
      is_featured || false, seo_title || null, seo_description || null
    ]);

    // Get created product
    const [newProduct] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);

    const product = newProduct[0];
    product.images = product.images ? JSON.parse(product.images) : [];
    product.tags = product.tags ? JSON.parse(product.tags) : [];

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });

  } catch (error) {
    handleError(error, res, 'Error al crear producto');
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', [authenticateToken, requireAdmin, ...productValidation], async (req, res) => {
  try {
    // Check validation errors
    if (checkValidationErrors(req, res)) return;

    const productId = req.params.id;
    const {
      name, description, price, compare_price, cost_price, sku, barcode,
      stock_quantity, min_stock_level, weight, dimensions, category_id,
      brand, tags, images, is_active, is_featured, seo_title, seo_description
    } = req.body;

    // Check if product exists
    const [existingProduct] = await db.execute(
      'SELECT id, sku FROM products WHERE id = ?',
      [productId]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: 'El producto que intentas actualizar no existe'
      });
    }

    // Check SKU uniqueness if changed
    if (sku && sku !== existingProduct[0].sku) {
      const skuError = await checkSkuUniqueness(sku, productId);
      if (skuError) {
        return res.status(409).json(skuError);
      }
    }

    // Verify category exists
    const categoryError = await verifyCategoryExists(category_id);
    if (categoryError) {
      return res.status(400).json(categoryError);
    }

    // Update product
    await db.execute(`
      UPDATE products SET
        name = ?, description = ?, price = ?, compare_price = ?, cost_price = ?,
        sku = ?, barcode = ?, stock_quantity = ?, min_stock_level = ?,
        weight = ?, dimensions = ?, category_id = ?, brand = ?, tags = ?,
        images = ?, is_active = ?, is_featured = ?, seo_title = ?,
        seo_description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, description, price, compare_price || null, cost_price || null,
      sku || null, barcode || null, stock_quantity, min_stock_level || 5,
      weight || null, dimensions || null, category_id || null, brand || null,
      tags ? JSON.stringify(tags) : null, images ? JSON.stringify(images) : null,
      is_active !== undefined ? is_active : true, is_featured || false,
      seo_title || null, seo_description || null, productId
    ]);

    // Get updated product
    const [updatedProduct] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    const product = updatedProduct[0];
    product.images = product.images ? JSON.parse(product.images) : [];
    product.tags = product.tags ? JSON.parse(product.tags) : [];

    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });

  } catch (error) {
    handleError(error, res, 'Error al actualizar producto');
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const [existingProduct] = await db.execute(
      'SELECT id, name FROM products WHERE id = ?',
      [productId]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: 'El producto que intentas eliminar no existe'
      });
    }

    // Soft delete (set is_active to false)
    await db.execute(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [productId]
    );

    res.json({
      message: 'Producto eliminado exitosamente',
      product_name: existingProduct[0].name
    });

  } catch (error) {
    handleError(error, res, 'Error al eliminar producto');
  }
});

// @route   GET /api/products/categories/list
// @desc    Get all active categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({
      categories
    });

  } catch (error) {
    handleError(error, res, 'Error al obtener categorías');
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = req.query.limit || 8;

    const [products] = await db.execute(`
      SELECT 
        p.id, p.name, p.price, p.compare_price, p.images, 
        p.stock_quantity, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      in_stock: product.stock_quantity > 0
    }));

    res.json({
      featured_products: formattedProducts
    });

  } catch (error) {
    handleError(error, res, 'Error al obtener productos destacados');
  }
});

module.exports = router;