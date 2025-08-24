import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Loading .env file...');

// Load environment variables
dotenv.config();

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_URL:', process.env.DB_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***HIDDEN***' : 'undefined');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN); 