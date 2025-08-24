import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/config.js';
import User from './models/user.model.js';

// Connect to MongoDB
await mongoose.connect(config.mongoUri);
console.log('MongoDB connected successfully');

try {
  // Find the test user
  const user = await User.findOne({ username: 'testuser' });
  
  if (!user) {
    console.log('❌ Test user not found');
    process.exit(1);
  }
  
  console.log('✅ Test user found:', user.name);
  console.log('Username:', user.username);
  console.log('Email:', user.email);
  console.log('Password hash:', user.password.substring(0, 20) + '...');
  
  // Test password comparison
  const testPassword = 'password123';
  const isMatch = await bcrypt.compare(testPassword, user.password);
  
  console.log('Password match:', isMatch);
  
  if (isMatch) {
    console.log('✅ Password verification successful');
  } else {
    console.log('❌ Password verification failed');
    
    // Try to create a new hash and compare
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash:', newHash.substring(0, 20) + '...');
    
    const isMatchNew = await bcrypt.compare(testPassword, newHash);
    console.log('New hash match:', isMatchNew);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await mongoose.connection.close();
  console.log('Database connection closed');
} 