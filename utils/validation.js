// Common validation schemas and utilities

// Basic validation functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Common validation schemas
export const commonValidations = {
  // User validation
  user: {
    email: (email) => {
      if (!email) return 'Email is required';
      if (!isValidEmail(email)) return 'Invalid email format';
      return null;
    },
    password: (password) => {
      if (!password) return 'Password is required';
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (!isValidPassword(password)) return 'Password must contain uppercase, lowercase, and number';
      return null;
    },
    name: (name) => {
      if (!name) return 'Name is required';
      if (name.length < 2) return 'Name must be at least 2 characters';
      return null;
    }
  },

  // Employee validation
  employee: {
    employeeId: (id) => {
      if (!id) return 'Employee ID is required';
      if (id.length < 3) return 'Employee ID must be at least 3 characters';
      return null;
    },
    name: (name) => {
      if (!name) return 'Employee name is required';
      if (name.length < 2) return 'Employee name must be at least 2 characters';
      return null;
    },
    email: (email) => {
      if (email && !isValidEmail(email)) return 'Invalid email format';
      return null;
    },
    phone: (phone) => {
      if (phone && !isValidPhone(phone)) return 'Invalid phone format';
      return null;
    }
  },

  // Pagination validation
  pagination: {
    page: (page) => {
      const num = parseInt(page);
      if (isNaN(num) || num < 1) return 'Page must be a positive number';
      return null;
    },
    limit: (limit) => {
      const num = parseInt(limit);
      if (isNaN(num) || num < 1 || num > 100) return 'Limit must be between 1 and 100';
      return null;
    }
  }
};

// Request validation middleware
export const validateRequest = (validations) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate body
    if (validations.body) {
      Object.keys(validations.body).forEach(field => {
        const value = req.body[field];
        const validation = validations.body[field];
        const error = validation(value);
        if (error) errors.push({ field, message: error });
      });
    }

    // Validate query
    if (validations.query) {
      Object.keys(validations.query).forEach(field => {
        const value = req.query[field];
        const validation = validations.query[field];
        const error = validation(value);
        if (error) errors.push({ field, message: error });
      });
    }

    // Validate params
    if (validations.params) {
      Object.keys(validations.params).forEach(field => {
        const value = req.params[field];
        const validation = validations.params[field];
        const error = validation(value);
        if (error) errors.push({ field, message: error });
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        error: 'VALIDATION_ERROR'
      });
    }

    next();
  };
};

// Sanitize input data
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeInput(data[key]);
    });
    return sanitized;
  }
  return data;
};

// Rate limiting helper
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (requests.has(ip)) {
      requests.set(ip, requests.get(ip).filter(time => time > windowStart));
    }
    
    const userRequests = requests.get(ip) || [];
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
  };
}; 