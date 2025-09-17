// Constantes globales de la aplicación

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Métodos de pago
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  CUSTOMER: 'customer',
};

// Categorías de productos (ejemplo)
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  HOME: 'home',
  BOOKS: 'books',
  SPORTS: 'sports',
  BEAUTY: 'beauty',
  TOYS: 'toys',
  AUTOMOTIVE: 'automotive',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100,
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// Configuración de validación
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  PRICE_MIN: 0,
  PRICE_MAX: 999999999,
  STOCK_MIN: 0,
  STOCK_MAX: 999999,
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'E-Commerce',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de comercio electrónico',
  CONTACT_EMAIL: 'contacto@ecommerce.com',
  SUPPORT_PHONE: '+57 300 123 4567',
};

// URLs y endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },
  ORDERS: {
    BASE: '/orders',
    STATUS: '/orders/status',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
  },
  ADMIN: {
    STATS: '/admin/stats',
    ANALYTICS: '/admin/analytics',
  },
  PAYMENTS: {
    PROCESS: '/payments/process',
    METHODS: '/payments/methods',
  },
};

// Configuración de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Configuración de toast
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right',
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
};

// Configuración de tema
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Configuración de fechas
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
};

// Configuración de monedas
export const CURRENCY_CONFIG = {
  DEFAULT: 'COP',
  SYMBOL: '$',
  LOCALE: 'es-CO',
  SUPPORTED: ['COP', 'USD', 'EUR'],
};

// Configuración de idiomas
export const LANGUAGE_CONFIG = {
  DEFAULT: 'es',
  SUPPORTED: ['es', 'en'],
  FALLBACK: 'es',
};

// Configuración de SEO
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'E-Commerce - Tu tienda online',
  TITLE_SEPARATOR: ' | ',
  DEFAULT_DESCRIPTION:
    'Encuentra los mejores productos en nuestra tienda online',
  DEFAULT_KEYWORDS: 'ecommerce, tienda online, productos, compras',
};

// Configuración de redes sociales
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/ecommerce',
  TWITTER: 'https://twitter.com/ecommerce',
  INSTAGRAM: 'https://instagram.com/ecommerce',
  LINKEDIN: 'https://linkedin.com/company/ecommerce',
};

// Configuración de tiempo
export const TIME_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

export default {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  PRODUCT_CATEGORIES,
  PAGINATION,
  FILE_CONFIG,
  VALIDATION_RULES,
  APP_CONFIG,
  API_ENDPOINTS,
  NOTIFICATION_TYPES,
  TOAST_CONFIG,
  THEME_CONFIG,
  STORAGE_KEYS,
  DATE_FORMATS,
  CURRENCY_CONFIG,
  LANGUAGE_CONFIG,
  SEO_CONFIG,
  SOCIAL_LINKS,
  TIME_CONFIG,
};
