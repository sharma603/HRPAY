// Rate Limiting Configuration for HypeBridge HRPAY Backend
// This file allows you to easily adjust rate limiting settings for mobile apps

export const rateLimitConfig = {
  // Time window for rate limiting (15 minutes in milliseconds)
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  
  // Maximum requests per IP address per time window
  // Increased from 100 to 1000 for better mobile app experience
  max: process.env.RATE_LIMIT_MAX || 1000,
  
  // IP addresses that are whitelisted (not subject to rate limiting)
  whitelist: process.env.RATE_LIMIT_WHITELIST ? 
    process.env.RATE_LIMIT_WHITELIST.split(',').map(v => v.trim()).filter(Boolean) : 
    ['127.0.0.1', '::1'],
  
  // Whether to disable rate limiting entirely
  disabled: String(process.env.RATE_LIMIT_DISABLED || '').toLowerCase() === 'true',
  
  // Custom error message for rate limit exceeded
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  
  // Rate limiting headers
  standardHeaders: true,
  legacyHeaders: false
};

// Mobile app specific rate limiting (more lenient for authentication)
export const mobileAppRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes for mobile apps
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
};

// Development mode rate limiting (very lenient)
export const developmentRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5000 requests per 15 minutes for development
  message: {
    error: 'Development mode: Rate limit exceeded, but you can increase limits in config',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
};
