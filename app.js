import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { errorHandler } from "./utils/errorHandler.js";
import logger from "./utils/logger.js";
import config from "./config/config.js";
import { rateLimitConfig, mobileAppRateLimitConfig, developmentRateLimitConfig } from "./config/rate-limit-config.js";
import authRoutes from "./api/v1/auth/routes.js";
import companyRoutes from "./api/v1/company/routes.js";
import mobileAppRoutes from "./api/v1/mobileApp/routes.js";
import commonCodeRoutes from "./api/v1/commonCode/routes.js";
import departmentRoutes from "./api/v1/department/routes.js";
import designationRoutes from "./api/v1/designation/routes.js";
import divisionRoutes from "./api/v1/division/routes.js";
import subDepartmentRoutes from "./api/v1/subDepartment/routes.js";
import employeeRoutes from "./api/v1/employees/routes.js";
import attendanceRoutes from "./api/v1/attendance/routes.js";
import tasRoutes from "./api/v1/tas/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are loaded in server.js

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      // Allow images from same origin, data URIs, HTTPS, and explicitly from any origin
      // The Cross-Origin-Resource-Policy (set below) will govern safety
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // IMPORTANT: allow other origins (e.g., http://localhost:3000) to fetch static images
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Compression middleware
app.use(compression());

// Rate limiting (with whitelist and disable options)
if (!config.rateLimitDisabled) {
  // More lenient rate limiting for authentication (mobile app friendly)
  const authLimiter = rateLimit({
    windowMs: mobileAppRateLimitConfig.windowMs,
    max: mobileAppRateLimitConfig.max,
    message: mobileAppRateLimitConfig.message,
    standardHeaders: mobileAppRateLimitConfig.standardHeaders,
    legacyHeaders: mobileAppRateLimitConfig.legacyHeaders,
    skip: (req, res) => {
      try {
        const ip = req.ip || req.connection?.remoteAddress || '';
        if (rateLimitConfig.whitelist && rateLimitConfig.whitelist.length > 0) {
          return rateLimitConfig.whitelist.includes(ip);
        }
      } catch {}
      return false;
    }
  });

  // General rate limiting for other API endpoints
  const generalLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    message: rateLimitConfig.message,
    standardHeaders: rateLimitConfig.standardHeaders,
    legacyHeaders: rateLimitConfig.legacyHeaders,
    skip: (req, res) => {
      try {
        const ip = req.ip || req.connection?.remoteAddress || '';
        if (rateLimitConfig.whitelist && rateLimitConfig.whitelist.length > 0) {
          return rateLimitConfig.whitelist.includes(ip);
        }
      } catch {}
      return false;
    }
  });

  // Apply different rate limits to different route groups
  app.use('/api/v1/auth', authLimiter); // More lenient for authentication
  app.use('/api', generalLimiter); // Standard rate limiting for other endpoints
}

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (config.nodeEnv === 'development') {
  app.use(logger.request);
}

// Serve static files from uploads directory with permissive CORP/CORS for images
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // Allow configured origins; default to * for static assets if not set
  try {
    const origins = config.corsOrigins;
    if (origins === '*' || (Array.isArray(origins) && origins.includes('*'))) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (Array.isArray(origins) && origins.length > 0) {
      // In practice browsers ignore ACAO on <img>, but set it for completeness
      res.setHeader('Access-Control-Allow-Origin', origins[0]);
    } else if (typeof origins === 'string' && origins) {
      res.setHeader('Access-Control-Allow-Origin', origins);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } catch {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Log upload requests for debugging
app.use('/uploads', (req, res, next) => {
  if (req.path.includes('/employees/')) {
    console.log('Employee file request:', req.path);
  }
  next();
});

// Database connection is now handled in server.js

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/mobileApp', mobileAppRoutes);
app.use('/api/v1/commonCode', commonCodeRoutes);
app.use('/api/v1/department', departmentRoutes);
app.use('/api/v1/designation', designationRoutes);
app.use('/api/v1/division', divisionRoutes);
app.use('/api/v1/subDepartment', subDepartmentRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/tas', tasRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// Simple root path handler to stop 404 errors
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Handle any query parameters on root path
app.get('/?*', (req, res) => {
  res.json({ message: 'API is running' });
});



// Removed legacy test-connection endpoint; use /health instead

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app; 