const express = require('express');
const { logger } = require('../middleware/logger');
const router = express.Router();

// POST /api/errors - Recibir reportes de errores del frontend
router.post('/', async (req, res) => {
  try {
    const { message, stack, componentStack, context } = req.body;
    
    // Log del error con contexto completo
    logger.error('Frontend Error Report', {
      message,
      stack,
      componentStack,
      context,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Respuesta exitosa
    res.status(200).json({ 
      success: true, 
      message: 'Error reported successfully',
      errorId: Date.now()
    });
    
  } catch (error) {
    logger.error('Error processing error report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process error report' 
    });
  }
});

module.exports = router;