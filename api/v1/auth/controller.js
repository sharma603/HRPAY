import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../../config/config.js";
import User from "../../../models/user.model.js";
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  unauthorizedResponse,
  badRequestResponse 
} from "../../../utils/apiResponse.js";

// Register new user
export const register = async (req, res) => {
  try {
    console.log('=== BACKEND REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { name, email, password, role, username } = req.body;
    
    console.log('Extracted data:', { name, email, password, role, username });
    
    // Validate required fields
    if (!name || !email || !password || !username) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, username: !!username });
      return badRequestResponse(res, "All fields are required: name, email, password, username");
    }
    
    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ username: username.trim() });
    if (existingUserByUsername) {
      console.log('Username already exists:', username);
      return badRequestResponse(res, "Username already exists");
    }
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUserByEmail) {
      console.log('Email already exists:', email);
      return badRequestResponse(res, "Email already exists");
    }
    
    const userData = {
      name: name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "employee"
    };
    
    console.log('Creating user with data:', userData);
    
    const user = new User(userData);
    console.log('User model created, attempting to save...');
    
    await user.save();
    console.log('User saved successfully:', user._id);
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return createdResponse(res, userWithoutPassword, "User registered successfully. Please login.");
  } catch (err) {
    console.error('Registration error:', err);
    return errorResponse(res, err.message, 'REGISTRATION_ERROR');
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return unauthorizedResponse(res, "Invalid credentials");
    }
    
    // Compare password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return unauthorizedResponse(res, "Invalid credentials");
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        username: user.username, 
        role: user.role 
      }, 
      config.jwtSecret, 
      { expiresIn: '2h' }
    );
    // Optional: issue a refresh token (longer-lived) for future implementation
    const refreshToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return successResponse(res, {
      token,
      refreshToken,
      user: userWithoutPassword
    }, "Login successful");
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, err.message, 'LOGIN_ERROR');
  }
}; 