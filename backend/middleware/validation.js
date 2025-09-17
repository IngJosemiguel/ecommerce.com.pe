const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('./logger');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors
    });
  }
  
  next();
};

// Validaciones comunes
const commonValidations = {
  // Validación de email
  email: () => body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),

  // Validación de contraseña
  password: (isOptional = false) => {
    const validation = body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
    
    return isOptional ? validation.optional() : validation;
  },

  // Validación de nombre
  name: (fieldName = 'name') => body(fieldName)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`${fieldName} debe tener entre 2 y 100 caracteres`)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage(`${fieldName} solo puede contener letras y espacios`),

  // Validación de teléfono
  phone: (isOptional = true) => {
    const validation = body('phone')
      .isMobilePhone('any')
      .withMessage('Debe ser un número de teléfono válido');
    
    return isOptional ? validation.optional() : validation;
  },

  // Validación de precio
  price: () => body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .toFloat(),

  // Validación de stock
  stock: () => body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
    .toInt(),

  // Validación de ID
  id: (paramName = 'id') => param(paramName)
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
    .toInt(),

  // Validación de paginación
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero positivo')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100')
      .toInt()
  ],

  // Validación de fecha
  date: (fieldName) => body(fieldName)
    .isISO8601()
    .withMessage(`${fieldName} debe ser una fecha válida en formato ISO8601`)
    .toDate(),

  // Validación de URL
  url: (fieldName, isOptional = true) => {
    const validation = body(fieldName)
      .isURL()
      .withMessage(`${fieldName} debe ser una URL válida`);
    
    return isOptional ? validation.optional() : validation;
  },

  // Validación de enum
  enum: (fieldName, allowedValues) => body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} debe ser uno de: ${allowedValues.join(', ')}`),

  // Validación de array
  array: (fieldName, minLength = 0, maxLength = 100) => body(fieldName)
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} debe ser un array con ${minLength}-${maxLength} elementos`),

  // Validación de texto
  text: (fieldName, minLength = 1, maxLength = 1000) => body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} debe tener entre ${minLength} y ${maxLength} caracteres`),

  // Validación de boolean
  boolean: (fieldName) => body(fieldName)
    .isBoolean()
    .withMessage(`${fieldName} debe ser verdadero o falso`)
    .toBoolean()
};

// Esquemas de validación específicos
const validationSchemas = {
  // Validación de registro
  register: [
    commonValidations.name('name'),
    commonValidations.email(),
    commonValidations.password(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
    commonValidations.phone(),
    handleValidationErrors
  ],

  // Validación de login
  login: [
    commonValidations.email(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    handleValidationErrors
  ],

  // Validación de producto
  product: [
    commonValidations.text('name', 3, 100),
    commonValidations.text('description', 10, 1000),
    commonValidations.price(),
    commonValidations.stock(),
    body('category')
      .notEmpty()
      .withMessage('La categoría es requerida')
      .isLength({ max: 50 })
      .withMessage('La categoría no puede exceder 50 caracteres'),
    body('images')
      .optional()
      .isArray()
      .withMessage('Las imágenes deben ser un array'),
    handleValidationErrors
  ],

  // Validación de actualización de producto
  updateProduct: [
    commonValidations.id(),
    commonValidations.text('name', 3, 100).optional(),
    commonValidations.text('description', 10, 1000).optional(),
    commonValidations.price().optional(),
    commonValidations.stock().optional(),
    body('category')
      .optional()
      .isLength({ max: 50 })
      .withMessage('La categoría no puede exceder 50 caracteres'),
    handleValidationErrors
  ],

  // Validación de pedido
  order: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Debe incluir al menos un producto'),
    body('items.*.productId')
      .isInt({ min: 1 })
      .withMessage('ID de producto inválido'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('La cantidad debe ser un número positivo'),
    body('shippingAddress')
      .notEmpty()
      .withMessage('La dirección de envío es requerida'),
    body('paymentMethod')
      .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
      .withMessage('Método de pago inválido'),
    handleValidationErrors
  ],

  // Validación de actualización de perfil
  updateProfile: [
    commonValidations.name('name').optional(),
    commonValidations.phone().optional(),
    body('address')
      .optional()
      .isLength({ max: 255 })
      .withMessage('La dirección no puede exceder 255 caracteres'),
    handleValidationErrors
  ],

  // Validación de cambio de contraseña
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    commonValidations.password().custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),
    handleValidationErrors
  ],

  // Validación de búsqueda
  search: [
    query('q')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    query('category')
      .optional()
      .isLength({ max: 50 })
      .withMessage('La categoría no puede exceder 50 caracteres'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio mínimo debe ser un número positivo')
      .toFloat(),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('El precio máximo debe ser un número positivo')
      .toFloat(),
    ...commonValidations.pagination(),
    handleValidationErrors
  ],

  // Validación de ID en parámetros
  validateId: [
    commonValidations.id(),
    handleValidationErrors
  ]
};

// Middleware personalizado para validaciones específicas
const customValidation = (validationFn) => {
  return (req, res, next) => {
    try {
      const isValid = validationFn(req.body, req.params, req.query);
      if (isValid !== true) {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: isValid
        });
      }
      next();
    } catch (error) {
      logger.error('Custom validation error', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl
      });
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        error: error.message
      });
    }
  };
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validationSchemas,
  customValidation
};