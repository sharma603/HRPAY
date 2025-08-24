import mongoose from 'mongoose';
import config from './config/config.js';

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection URL:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Please check:');
    console.error('1. MongoDB is running on localhost:27017');
    console.error('2. Database "HRPAY" exists');
    console.error('3. Network connectivity');
  }
};

testConnection(); 