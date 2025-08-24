// Environment variables are loaded in app.js

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.DB_URL || 'mongodb://127.0.0.1:27017/HRPAY',
  jwtSecret: process.env.JWT_SECRET,
  // For local testing without MongoDB
  useLocalDB: process.env.USE_LOCAL_DB || false,
  localDBPath: './data/users.json',
  // Security settings - Updated to allow mobile app connections
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://localhost:19006',  // Expo dev server
      'http://localhost:8081',   // Metro bundler
      'http://192.168.1.1:4000', // Common home network IPs
      'http://192.168.1.2:4000',
      'http://192.168.1.3:4000',
      'http://192.168.1.4:4000',
      'http://192.168.1.5:4000',
      'http://192.168.0.1:4000', // Alternative network range
      'http://192.168.0.2:4000',
      'http://192.168.0.3:4000',
      'http://192.168.0.4:4000',
      'http://10.0.0.1:4000',    // Another common range
      'http://10.0.0.2:4000',
      'http://10.0.0.3:4000',
      'http://10.0.0.4:4000'
    ],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  rateLimitWhitelist: process.env.RATE_LIMIT_WHITELIST ? process.env.RATE_LIMIT_WHITELIST.split(',').map(v => v.trim()).filter(Boolean) : [],
  rateLimitDisabled: String(process.env.RATE_LIMIT_DISABLED || '').toLowerCase() === 'true',
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables, with safe defaults for development
if (!config.jwtSecret) {
  if (config.nodeEnv === 'production') {
    console.error('❌ JWT_SECRET is required in production environment');
    process.exit(1);
  } else {
    console.warn('⚠️  JWT_SECRET not set. Using a default development secret. Set JWT_SECRET in .env for better security.');
    config.jwtSecret = 'dev_insecure_secret_change_me';
  }
}

if (config.nodeEnv === 'production' && !process.env.DB_URL) {
  console.error('❌ DB_URL is required in production environment');
  process.exit(1);
}

export default config; 