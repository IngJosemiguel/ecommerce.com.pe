const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireCustomerOrAdmin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for Stripe
// @access  Private
router.post('/create-payment-intent', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('amount')
    .isFloat({ min: 0.50 })
    .withMessage('El monto debe ser al menos 0.50'),
  body('currency')
    .optional()
    .isIn(['eur', 'usd', 'gbp'])
    .withMessage('Moneda no soportada'),
  body('order_items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  body('shipping_address')
    .isObject()
    .withMessage('Dirección de envío requerida'),
  body('billing_address')
    .optional()
    .isObject()
    .withMessage('Dirección de facturación debe ser un objeto')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de pago inválidos',
        details: errors.array()
      });
    }

    const {
      amount,
      currency = 'eur',
      order_items,
      shipping_address,
      billing_address,
      notes
    } = req.body;

    // Validate products and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of order_items) {
      const [products] = await db.execute(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = true',
        [item.product_id]
      );

      if (products.length === 0) {
        return res.status(400).json({
          error: 'Producto no encontrado',
          message: `El producto con ID ${item.product_id} no existe`
        });
      }

      const product = products[0];

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: 'Stock insuficiente',
          message: `No hay suficiente stock para ${product.name}. Disponible: ${product.stock_quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal
      });
    }

    // Verify amount matches calculated total (allow small floating point differences)
    if (Math.abs(calculatedTotal - amount) > 0.01) {
      return res.status(400).json({
        error: 'Monto incorrecto',
        message: `El monto enviado (${amount}) no coincide con el total calculado (${calculatedTotal})`
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order in database (pending status)
    const [orderResult] = await db.execute(`
      INSERT INTO orders (
        order_number, user_id, status, payment_status, subtotal, total_amount,
        currency, shipping_address, billing_address, notes
      ) VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      req.user.id,
      calculatedTotal,
      calculatedTotal,
      currency.toUpperCase(),
      JSON.stringify(shipping_address),
      JSON.stringify(billing_address || shipping_address),
      notes || null
    ]);

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of validatedItems) {
      await db.execute(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.total_price,
        JSON.stringify({ name: item.name, price: item.unit_price })
      ]);
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(calculatedTotal * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        order_id: orderId.toString(),
        order_number: orderNumber,
        user_id: req.user.id.toString()
      },
      automatic_payment_methods: {
        enabled: true
      },
      description: `Pedido ${orderNumber} - ${validatedItems.length} productos`
    });

    // Store payment transaction
    await db.execute(`
      INSERT INTO payment_transactions (order_id, transaction_id, payment_method, amount, currency, status)
      VALUES (?, ?, 'stripe', ?, ?, 'pending')
    `, [orderId, paymentIntent.id, calculatedTotal, currency.toUpperCase()]);

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      order_id: orderId,
      order_number: orderNumber,
      amount: calculatedTotal,
      currency: currency.toUpperCase()
    });

  } catch (error) {
    console.error('Error al crear payment intent:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Error de tarjeta',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el pago'
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update order status
// @access  Private
router.post('/confirm-payment', [
  authenticateToken,
  requireCustomerOrAdmin,
  body('payment_intent_id')
    .notEmpty()
    .withMessage('ID de payment intent requerido'),
  body('order_id')
    .isInt({ min: 1 })
    .withMessage('ID de orden requerido')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de confirmación inválidos',
        details: errors.array()
      });
    }

    const { payment_intent_id, order_id } = req.body;

    // Verify order belongs to user (unless admin)
    const [orders] = await db.execute(
      'SELECT id, user_id, order_number, status, payment_status, total_amount FROM orders WHERE id = ?',
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        message: 'La orden especificada no existe'
      });
    }

    const order = orders[0];

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para confirmar esta orden'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      await db.execute(`
        UPDATE orders SET 
          status = 'confirmed', 
          payment_status = 'paid',
          payment_method = 'stripe',
          payment_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [payment_intent_id, order_id]);

      // Update payment transaction
      await db.execute(`
        UPDATE payment_transactions SET 
          status = 'completed',
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE order_id = ? AND transaction_id = ?
      `, [JSON.stringify(paymentIntent), order_id, payment_intent_id]);

      // Update product stock
      const [orderItems] = await db.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [order_id]
      );

      for (const item of orderItems) {
        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Clear user's cart
      await db.execute(
        'DELETE FROM cart_items WHERE user_id = ?',
        [req.user.id]
      );

      res.json({
        message: 'Pago confirmado exitosamente',
        order_number: order.order_number,
        payment_status: 'paid',
        order_status: 'confirmed'
      });

    } else {
      // Payment failed or pending
      let status = 'failed';
      let orderStatus = 'cancelled';

      if (paymentIntent.status === 'processing') {
        status = 'pending';
        orderStatus = 'pending';
      }

      await db.execute(`
        UPDATE orders SET 
          status = ?,
          payment_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [orderStatus, status, order_id]);

      await db.execute(`
        UPDATE payment_transactions SET 
          status = ?,
          gateway_response = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE order_id = ? AND transaction_id = ?
      `, [status, JSON.stringify(paymentIntent), order_id, payment_intent_id]);

      res.status(400).json({
        error: 'Pago no completado',
        message: `El estado del pago es: ${paymentIntent.status}`,
        payment_status: status
      });
    }

  } catch (error) {
    console.error('Error al confirmar pago:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Solicitud inválida a Stripe',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo confirmar el pago'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;
        
        if (orderId) {
          await db.execute(`
            UPDATE orders SET 
              status = 'confirmed',
              payment_status = 'paid',
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [orderId]);

          await db.execute(`
            UPDATE payment_transactions SET 
              status = 'completed',
              gateway_response = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = ?
          `, [JSON.stringify(paymentIntent), paymentIntent.id]);

          console.log(`✅ Pago confirmado para orden ${orderId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.order_id;
        
        if (failedOrderId) {
          await db.execute(`
            UPDATE orders SET 
              status = 'cancelled',
              payment_status = 'failed',
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [failedOrderId]);

          await db.execute(`
            UPDATE payment_transactions SET 
              status = 'failed',
              gateway_response = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = ?
          `, [JSON.stringify(failedPayment), failedPayment.id]);

          console.log(`❌ Pago fallido para orden ${failedOrderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  res.json({
    payment_methods: [
      {
        id: 'stripe',
        name: 'Tarjeta de Crédito/Débito',
        description: 'Visa, Mastercard, American Express',
        enabled: true,
        fees: {
          percentage: 2.9,
          fixed: 0.30
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Paga con tu cuenta PayPal',
        enabled: false, // To be implemented
        fees: {
          percentage: 3.4,
          fixed: 0.35
        }
      }
    ],
    supported_currencies: ['EUR', 'USD', 'GBP'],
    minimum_amount: 0.50
  });
});

// @route   GET /api/payments/transaction/:id
// @desc    Get payment transaction details
// @access  Private
router.get('/transaction/:id', [authenticateToken, requireCustomerOrAdmin], async (req, res) => {
  try {
    const transactionId = req.params.id;

    const [transactions] = await db.execute(`
      SELECT 
        pt.*,
        o.order_number,
        o.user_id,
        u.email as user_email
      FROM payment_transactions pt
      JOIN orders o ON pt.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE pt.transaction_id = ?
    `, [transactionId]);

    if (transactions.length === 0) {
      return res.status(404).json({
        error: 'Transacción no encontrada',
        message: 'La transacción especificada no existe'
      });
    }

    const transaction = transactions[0];

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && transaction.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver esta transacción'
      });
    }

    // Parse gateway response if exists
    if (transaction.gateway_response) {
      transaction.gateway_response = JSON.parse(transaction.gateway_response);
    }

    res.json({
      transaction
    });

  } catch (error) {
    console.error('Error al obtener transacción:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la transacción'
    });
  }
});

module.exports = router;