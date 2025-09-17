const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { logger } = require('./logger');

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    ];
    
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, allowedOrigins });
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 horas
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });
};

// Rate limiters específicos
const rateLimiters = {
  // Rate limiter general
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    parseInt(process.env.RATE_LIMIT_MAX || '100'),
    'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
    process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true'
  ),

  // Rate limiter para autenticación (más estricto)
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    5, // Solo 5 intentos de login por IP
    'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos'
  ),

  // Rate limiter para registro
  register: createRateLimit(
    60 * 60 * 1000, // 1 hora
    3, // Solo 3 registros por hora por IP
    'Demasiados registros desde esta IP, intenta de nuevo en 1 hora'
  ),

  // Rate limiter para APIs públicas
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutos
    200, // Más permisivo para APIs
    'Límite de API excedido, intenta de nuevo más tarde'
  ),

  // Rate limiter para uploads
  upload: createRateLimit(
    60 * 60 * 1000, // 1 hora
    10, // 10 uploads por hora
    'Demasiadas subidas de archivos, intenta de nuevo más tarde'
  )
};

// Configuración de Helmet
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Puede causar problemas con algunos recursos
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  }
};

// Middleware de seguridad personalizado
const securityMiddleware = {
  // Middleware para validar API Key (opcional)
  validateApiKey: (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;
    
    if (validApiKey && apiKey !== validApiKey) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        providedKey: apiKey ? 'PROVIDED' : 'MISSING'
      });
      
      return res.status(401).json({
        success: false,
        message: 'API key inválida o faltante'
      });
    }
    
    next();
  },

  // Middleware para detectar y bloquear IPs sospechosas
  suspiciousActivityDetector: (() => {
    const suspiciousIPs = new Map();
    const SUSPICIOUS_THRESHOLD = 50; // requests en 5 minutos
    const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutos
    
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      
      if (!suspiciousIPs.has(ip)) {
        suspiciousIPs.set(ip, { count: 1, firstRequest: now, blocked: false });
      } else {
        const ipData = suspiciousIPs.get(ip);
        
        // Si está bloqueado, verificar si ya pasó el tiempo
        if (ipData.blocked && (now - ipData.firstRequest) < BLOCK_DURATION) {
          logger.warn('Blocked IP attempted access', { ip, userAgent: req.get('User-Agent') });
          return res.status(429).json({
            success: false,
            message: 'IP temporalmente bloqueada por actividad sospechosa'
          });
        }
        
        // Reset si pasaron 5 minutos
        if ((now - ipData.firstRequest) > 5 * 60 * 1000) {
          suspiciousIPs.set(ip, { count: 1, firstRequest: now, blocked: false });
        } else {
          ipData.count++;
          
          // Bloquear si excede el threshold
          if (ipData.count > SUSPICIOUS_THRESHOLD && !ipData.blocked) {
            ipData.blocked = true;
            logger.error('IP blocked for suspicious activity', {
              ip,
              requestCount: ipData.count,
              userAgent: req.get('User-Agent')
            });
            
            return res.status(429).json({
              success: false,
              message: 'IP bloqueada por actividad sospechosa'
            });
          }
        }
      }
      
      next();
    };
  })(),

  // Middleware para logging de seguridad
  securityLogger: (req, res, next) => {
    // Log requests sospechosos
    const suspiciousPatterns = [
      /\.\.\//,  // Path traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript injection
      /vbscript:/i,  // VBScript injection
      /onload=/i,    // Event handler injection
      /onerror=/i    // Event handler injection
    ];
    
    const url = req.originalUrl;
    const body = JSON.stringify(req.body);
    const query = JSON.stringify(req.query);
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(body) || pattern.test(query)
    );
    
    if (isSuspicious) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        method: req.method,
        url,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query
      });
    }
    
    next();
  },

  // Middleware para sanitizar inputs
  sanitizeInput: (req, res, next) => {
    const sanitize = (obj) => {
      if (typeof obj === 'string') {
        return obj
          .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .trim();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitize(obj[key]);
          }
        }
        return sanitized;
      }
      
      return obj;
    };
    
    if (req.body) {
      req.body = sanitize(req.body);
    }
    
    if (req.query) {
      req.query = sanitize(req.query);
    }
    
    next();
  }
};

// Función para aplicar toda la configuración de seguridad
const applySecurity = (app) => {
  // Helmet para headers de seguridad
  if (process.env.HELMET_ENABLED !== 'false') {
    app.use(helmet(helmetConfig));
  }
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting general
  app.use(rateLimiters.general);
  
  // Middlewares de seguridad personalizados
  app.use(securityMiddleware.suspiciousActivityDetector);
  app.use(securityMiddleware.securityLogger);
  app.use(securityMiddleware.sanitizeInput);
  
  logger.info('Security middleware applied successfully');
};

module.exports = {
  corsOptions,
  rateLimiters,
  helmetConfig,
  securityMiddleware,
  applySecurity
};