import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/config.js';
import User from './models/user.model.js';

// Connect to MongoDB
await mongoose.connect(config.mongoUri);
console.log('MongoDB connected successfully');

try {
  // Get the test user
  const user = await User.findOne({ username: 'testuser' });
  if (!user) {
    console.log('Test user not found');
  } else {
    console.log('Found user:', user.username);
    console.log('Stored password hash:', user.password);
    
    // Test direct bcrypt comparison
    const password = 'password123';
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt comparison result:', isMatch);
    
    // Test the model method
    const modelMatch = await user.comparePassword(password);
    console.log('Model method comparison result:', modelMatch);
    
    // Test with wrong password
    const wrongMatch = await bcrypt.compare('wrongpassword', user.password);
    console.log('Wrong password test:', wrongMatch);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await mongoose.connection.close();
  console.log('Database connection closed');
} 