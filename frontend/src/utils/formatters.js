// Utilidades de formateo para la aplicación

// Función auxiliar para capitalizar texto
const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Formateo de moneda
export const formatCurrency = (amount, currency = 'COP', locale = 'es-CO') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

// Formateo de fechas
export const formatDate = (date, options = {}) => {
  const {
    locale = 'es-CO',
    dateStyle = 'medium',
    timeStyle = undefined,
    timeZone = 'America/Bogota',
  } = options;

  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const formatOptions = {
    timeZone,
    ...(dateStyle && { dateStyle }),
    ...(timeStyle && { timeStyle }),
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

// Formateo de fecha y hora
export const formatDateTime = (date, options = {}) => {
  return formatDate(date, {
    dateStyle: 'short',
    timeStyle: 'short',
    ...options,
  });
};

// Formateo de texto a título (Primera Letra Mayúscula)
export const formatTitle = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Formateo de texto truncado
export const formatTruncate = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
};

// Formateo de estados de pedidos
export const formatOrderStatus = status => {
  const statusMap = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return statusMap[status] || capitalize(status);
};

// Formateo de estados de pago
export const formatPaymentStatus = status => {
  const statusMap = {
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return statusMap[status] || capitalize(status);
};

// Formateo de roles de usuario
export const formatUserRole = role => {
  const roleMap = {
    admin: 'Administrador',
    user: 'Usuario',
    moderator: 'Moderador',
    customer: 'Cliente',
  };

  return roleMap[role] || capitalize(role);
};

// Formateo de direcciones
export const formatAddress = address => {
  if (!address) return '';

  const parts = [];

  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);

  return parts.join(', ');
};

// Formateo de nombres completos
export const formatFullName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
};

// Formateo de iniciales
export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// Formateo de SKU o códigos de producto
export const formatSKU = sku => {
  if (!sku) return '';
  return sku.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// Formateo de calificaciones
export const formatRating = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) return 'Sin calificar';
  return `${Number(rating).toFixed(1)}/${maxRating}`;
};

// Formateo de inventario/stock
export const formatStock = stock => {
  if (stock === null || stock === undefined) return 'No disponible';
  if (stock === 0) return 'Agotado';
  if (stock < 10) return `Quedan ${stock}`;
  return 'En stock';
};
