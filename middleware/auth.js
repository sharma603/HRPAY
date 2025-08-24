import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const requireRole = (roles = []) => (req, res, next) => {
  try {
    const allowed = Array.isArray(roles) ? roles : [roles];
    const role = req?.user?.role;
    if (allowed.length === 0 || allowed.includes(role)) return next();
    return res.status(403).json({ message: 'Forbidden', error: 'AUTH_FORBIDDEN' });
  } catch {
    return res.status(403).json({ message: 'Forbidden', error: 'AUTH_FORBIDDEN' });
  }
};

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      message: "No token provided",
      error: "AUTH_NO_TOKEN"
    });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    const isExpired = err && (err.name === 'TokenExpiredError' || /expired/i.test(err.message || ''));
    return res.status(401).json({ 
      message: isExpired ? 'Token expired' : 'Invalid token',
      error: isExpired ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_INVALID_TOKEN'
    });
  }
};

// Export both named and default exports for flexibility
export { auth as verifyToken };
export default auth; 