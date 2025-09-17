const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Por favor, proporciona un token de autenticación válido'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token corresponde a un usuario que no existe'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente'
      });
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debes estar autenticado para acceder a esta ruta'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los administradores pueden acceder a esta funcionalidad'
    });
  }

  next();
};

// Check if user is customer or admin
const requireCustomerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debes estar autenticado para acceder a esta ruta'
    });
  }

  if (!['customer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tienes permisos para acceder a esta funcionalidad'
    });
  }

  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ? AND is_active = true',
      [decoded.userId]
    );

    req.user = user || null;
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a esta ruta'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership based on different scenarios
    let resourceUserId;
    
    if (req.params.userId) {
      resourceUserId = parseInt(req.params.userId);
    } else if (req.body[resourceUserIdField]) {
      resourceUserId = parseInt(req.body[resourceUserIdField]);
    } else if (req.query[resourceUserIdField]) {
      resourceUserId = parseInt(req.query[resourceUserIdField]);
    }

    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'ecommerce-api',
      audience: 'ecommerce-frontend'
    }
  );
};

// Verify token without middleware (utility function)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCustomerOrAdmin,
  optionalAuth,
  requireOwnershipOrAdmin,
  generateToken,
  verifyToken
};