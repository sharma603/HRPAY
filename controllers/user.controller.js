import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

// Create a new user (Register)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, username } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !username) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: "All fields are required" 
      });
    }
    
    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ username: username.trim() });
    if (existingUserByUsername) {
      return res.status(400).json({ 
        error: 'USER_EXISTS',
        message: "Username already exists" 
      });
    }
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'EMAIL_EXISTS',
        message: "Email already exists" 
      });
    }
    
    const userData = {
      name: name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "employee"
    };
    
    const user = new User(userData);
    await user.save();
    
    // Don't generate token - user should login separately
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    logger.info('User registered successfully', { userId: user._id, username: user.username });
    
    res.status(201).json({ 
      message: "User registered successfully. Please login.",
      user: userWithoutPassword 
    });
  } catch (err) {
    logger.error('Registration error', err);
    res.status(500).json({ 
      error: 'REGISTRATION_ERROR',
      message: "Failed to register user" 
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        error: 'INVALID_CREDENTIALS',
        message: "Invalid credentials" 
      });
    }
    
    // Compare password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Failed login attempt', { username });
      return res.status(401).json({ 
        error: 'INVALID_CREDENTIALS',
        message: "Invalid credentials" 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        username: user.username, 
        role: user.role 
      }, 
      config.jwtSecret, 
      { expiresIn: '1d' }
    );
    
    logger.info('User logged in successfully', { userId: user._id, username: user.username });
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ 
      message: "Login successful",
      token, 
      user: userWithoutPassword 
    });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ 
      error: 'LOGIN_ERROR',
      message: "Failed to login" 
    });
  }
}; 