const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuración de logging
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Rojo
  WARN: '\x1b[33m',  // Amarillo
  INFO: '\x1b[36m',  // Cian
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.logFile = process.env.LOG_FILE || path.join(logsDir, 'app.log');
    this.maxSize = this.parseSize(process.env.LOG_MAX_SIZE || '10m');
    this.maxFiles = parseInt(process.env.LOG_MAX_FILES || '5');
  }

  getLogLevel() {
    const level = (process.env.LOG_LEVEL || 'info').toUpperCase();
    return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.INFO;
  }

  parseSize(sizeStr) {
    const match = sizeStr.match(/^(\d+)([kmg]?)$/i);
    if (!match) return 10 * 1024 * 1024; // 10MB por defecto
    
    const size = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'k': return size * 1024;
      case 'm': return size * 1024 * 1024;
      case 'g': return size * 1024 * 1024 * 1024;
      default: return size;
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.logLevel;
  }

  writeToFile(message) {
    try {
      // Verificar tamaño del archivo y rotar si es necesario
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size >= this.maxSize) {
          this.rotateLogFile();
        }
      }

      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  rotateLogFile() {
    try {
      // Mover archivos existentes
      for (let i = this.maxFiles - 1; i > 0; i--) {
        const oldFile = `${this.logFile}.${i}`;
        const newFile = `${this.logFile}.${i + 1}`;
        
        if (fs.existsSync(oldFile)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldFile); // Eliminar el más antiguo
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      // Mover el archivo actual
      if (fs.existsSync(this.logFile)) {
        fs.renameSync(this.logFile, `${this.logFile}.1`);
      }
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const color = LOG_COLORS[level] || LOG_COLORS.RESET;
      console.log(`${color}${formattedMessage}${LOG_COLORS.RESET}`);
    }

    // Log a archivo
    this.writeToFile(formattedMessage);
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
}

// Instancia singleton del logger
const logger = new Logger();

// Middleware de logging para Express
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  // Capturar la respuesta
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Determinar el nivel de log basado en el status code
    let logLevel = 'INFO';
    if (statusCode >= 500) {
      logLevel = 'ERROR';
    } else if (statusCode >= 400) {
      logLevel = 'WARN';
    }

    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    const meta = {
      method,
      url,
      statusCode,
      duration,
      userAgent,
      ip,
      responseSize: data ? data.length : 0
    };

    logger.log(logLevel, message, meta);
    
    return originalSend.call(this, data);
  };

  next();
};

// Middleware de manejo de errores
const errorLogger = (err, req, res, next) => {
  const message = `Unhandled error: ${err.message}`;
  const meta = {
    error: err.name,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown'
  };

  logger.error(message, meta);
  next(err);
};

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.name,
    message: err.message,
    stack: err.stack
  });
  
  // Dar tiempo para que se escriba el log antes de salir
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason.toString(),
    promise: promise.toString()
  });
});

module.exports = {
  logger,
  requestLogger,
  errorLogger
};