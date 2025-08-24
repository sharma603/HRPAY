// Comprehensive logging utility

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Log directory
const logDir = path.join(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper function to format timestamp
const formatTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to write to log file
const writeToLogFile = (level, message, data = null) => {
  const timestamp = formatTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  const logFile = path.join(logDir, `${level.toLowerCase()}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';

  fs.appendFileSync(logFile, logLine);
};

// Main logger class
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Log error messages
  error(message, error = null, context = {}) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      const logData = {
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        context
      };

      console.error(`[ERROR] ${message}`, error || '');
      writeToLogFile('ERROR', message, logData);
    }
  }

  // Log warning messages
  warn(message, data = null, context = {}) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      const logData = { message, data, context };
      console.warn(`[WARN] ${message}`, data || '');
      writeToLogFile('WARN', message, logData);
    }
  }

  // Log info messages
  info(message, data = null, context = {}) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      const logData = { message, data, context };
      console.info(`[INFO] ${message}`, data || '');
      writeToLogFile('INFO', message, logData);
    }
  }

  // Log debug messages
  debug(message, data = null, context = {}) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      const logData = { message, data, context };
      console.debug(`[DEBUG] ${message}`, data || '');
      writeToLogFile('DEBUG', message, logData);
    }
  }

  // Log HTTP requests
  request(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      if (res.statusCode >= 400) {
        logger.error(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, null, logData);
      } else {
        logger.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
      }
    });

    next();
  }

  // Log database operations
  db(operation, collection, query = null, result = null, error = null) {
    const logData = {
      operation,
      collection,
      query,
      result: result ? (Array.isArray(result) ? `${result.length} documents` : '1 document') : null,
      error: error ? error.message : null
    };

    if (error) {
      this.error(`DB ${operation} failed on ${collection}`, error, logData);
    } else {
      this.debug(`DB ${operation} on ${collection}`, logData);
    }
  }

  // Log authentication events
  auth(event, userId = null, success = true, details = {}) {
    const logData = {
      event,
      userId,
      success,
      details
    };

    if (success) {
      this.info(`Auth ${event}`, logData);
    } else {
      this.warn(`Auth ${event} failed`, logData);
    }
  }

  // Log performance metrics
  performance(operation, duration, details = {}) {
    const logData = {
      operation,
      duration: `${duration}ms`,
      details
    };

    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, logData);
    } else {
      this.debug(`Performance: ${operation} took ${duration}ms`, logData);
    }
  }

  // Get log statistics
  getStats() {
    const stats = {};
    const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log'];

    logFiles.forEach(file => {
      const filePath = path.join(logDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.length > 0);
        stats[file] = lines.length;
      } else {
        stats[file] = 0;
      }
    });

    return stats;
  }

  // Clear old logs (keep last 7 days)
  cleanup() {
    const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log'];
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    logFiles.forEach(file => {
      const filePath = path.join(logDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned up old log file: ${file}`);
        }
      }
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Export the logger instance and helper functions
export default logger;

// Export helper functions for direct use
export const logError = (message, error = null, context = {}) => {
  logger.error(message, error, context);
};

export const logInfo = (message, data = null, context = {}) => {
  logger.info(message, data, context);
};

export const logDebug = (message, data = null, context = {}) => {
  logger.debug(message, data, context);
};

export const logWarn = (message, data = null, context = {}) => {
  logger.warn(message, data, context);
}; 