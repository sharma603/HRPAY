import mongoose from 'mongoose';
import config from './config/config.js';

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('Connection URL:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can access the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test employee collection
    const employeeCollection = db.collection('employees');
    const count = await employeeCollection.countDocuments();
    console.log(`👥 Employee count: ${count}`);
    
    await mongoose.disconnect();
    console.log('✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testConnection(); 