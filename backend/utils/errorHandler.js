// Utilidad para manejo consistente de errores

/**
 * Maneja errores de manera consistente en las rutas
 * @param {Error} error - El error capturado
 * @param {Response} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje personalizado para el error
 * @param {number} statusCode - Código de estado HTTP (por defecto 500)
 */
const handleError = (error, res, message = 'Error interno del servidor', statusCode = 500) => {
  console.error(`${message}:`, error);
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};

/**
 * Maneja errores de validación
 * @param {Array} errors - Array de errores de validación
 * @param {Response} res - Objeto de respuesta de Express
 */
const handleValidationErrors = (errors, res) => {
  return res.status(400).json({
    error: 'Errores de validación',
    details: errors.array()
  });
};

/**
 * Maneja errores de recurso no encontrado
 * @param {Response} res - Objeto de respuesta de Express
 * @param {string} resource - Nombre del recurso no encontrado
 */
const handleNotFound = (res, resource = 'Recurso') => {
  return res.status(404).json({
    error: `${resource} no encontrado`
  });
};

/**
 * Maneja errores de acceso no autorizado
 * @param {Response} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje personalizado
 */
const handleUnauthorized = (res, message = 'Acceso no autorizado') => {
  return res.status(403).json({
    error: message
  });
};

module.exports = {
  handleError,
  handleValidationErrors,
  handleNotFound,
  handleUnauthorized
};