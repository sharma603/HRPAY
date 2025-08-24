import { badRequestResponse } from "../../../utils/apiResponse.js";

// Validate registration data
export const validateRegistration = (req, res, next) => {
  const { name, email, password, username } = req.body;
  
  if (!name || !email || !password || !username) {
    return badRequestResponse(res, "All fields are required");
  }
  
  if (password.length < 6) {
    return badRequestResponse(res, "Password must be at least 6 characters long");
  }
  
  if (username.length < 3) {
    return badRequestResponse(res, "Username must be at least 3 characters long");
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return badRequestResponse(res, "Please provide a valid email address");
  }
  
  next();
};

// Validate login data
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return badRequestResponse(res, "Username and password are required");
  }
  
  next();
}; 