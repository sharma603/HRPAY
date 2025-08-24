// Load environment variables first, before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables immediately
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔍 Environment variables:');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  - DB_URL:', process.env.DB_URL ? '✅ Set' : '❌ Missing');
console.log('  - USE_LOCAL_DB:', process.env.USE_LOCAL_DB);

// Now import config after environment variables are loaded
import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    // Wait for database connection
    await connectDB();
    
    // Start server only after database is connected
    app.listen(config.port, () => {
      console.log(`🚀 ScriptQube HRPAY ERP Server running on port ${config.port}`);
      console.log(`📱 API available at http://localhost:${config.port}/api`);
      console.log(`🔗 ScriptQube - Empowering HR Management`);
      console.log(`✅ Database connection established and ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 