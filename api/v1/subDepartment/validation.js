import Joi from 'joi';

// Validation schemas for sub-department operations
export const createSubDepartmentSchema = Joi.object({
  code: Joi.string()
    .trim()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      'string.empty': 'Sub-department code is required',
      'string.min': 'Sub-department code must be at least 2 characters long',
      'string.max': 'Sub-department code must not exceed 20 characters',
      'string.pattern.base': 'Sub-department code must contain only uppercase letters, numbers, and hyphens',
      'any.required': 'Sub-department code is required'
    }),
  
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Sub-department name is required',
      'string.min': 'Sub-department name must be at least 2 characters long',
      'string.max': 'Sub-department name must not exceed 100 characters',
      'any.required': 'Sub-department name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  erpCode: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'ERP code must not exceed 50 characters'
    }),
  
  isActive: Joi.boolean()
    .default(true),
  
  manager: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Manager name must not exceed 100 characters'
    }),
  
  location: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Location must not exceed 200 characters'
    }),
  
  budget: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Budget must not exceed 50 characters'
    }),
  
  employeeCount: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Employee count must be a number',
      'number.integer': 'Employee count must be a whole number',
      'number.min': 'Employee count cannot be negative'
    }),
  
  parentDepartment: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Parent department is required',
      'string.pattern.base': 'Parent department must be a valid ObjectId',
      'any.required': 'Parent department is required'
    }),
  
  division: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Division must be a valid ObjectId'
    }),
  
  company: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Company must be a valid ObjectId'
    }),
  
  type: Joi.string()
    .trim()
    .max(50)
    .default('Team')
    .messages({
      'string.max': 'Type must not exceed 50 characters'
    }),
  
  specialization: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Specialization must not exceed 200 characters'
    })
});

export const updateSubDepartmentSchema = Joi.object({
  code: Joi.string()
    .trim()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9-]+$/)
    .required()
    .messages({
      'string.empty': 'Sub-department code is required',
      'string.min': 'Sub-department code must be at least 2 characters long',
      'string.max': 'Sub-department code must not exceed 20 characters',
      'string.pattern.base': 'Sub-department code must contain only uppercase letters, numbers, and hyphens',
      'any.required': 'Sub-department code is required'
    }),
  
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Sub-department name is required',
      'string.min': 'Sub-department name must be at least 2 characters long',
      'string.max': 'Sub-department name must not exceed 100 characters',
      'any.required': 'Sub-department name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters'
    }),
  
  erpCode: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'ERP code must not exceed 50 characters'
    }),
  
  isActive: Joi.boolean(),
  
  manager: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Manager name must not exceed 100 characters'
    }),
  
  location: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Location must not exceed 200 characters'
    }),
  
  budget: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Budget must not exceed 50 characters'
    }),
  
  employeeCount: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Employee count must be a number',
      'number.integer': 'Employee count must be a whole number',
      'number.min': 'Employee count cannot be negative'
    }),
  
  parentDepartment: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Parent department is required',
      'string.pattern.base': 'Parent department must be a valid ObjectId',
      'any.required': 'Parent department is required'
    }),
  
  division: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Division must be a valid ObjectId'
    }),
  
  company: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Company must be a valid ObjectId'
    }),
  
  type: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Type must not exceed 50 characters'
    }),
  
  specialization: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Specialization must not exceed 200 characters'
    })
});

export const queryParamsSchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term must not exceed 100 characters'
    }),
  
  isActive: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'isActive must be either "true" or "false"'
    }),
  
  parentDepartment: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Parent department must be a valid ObjectId'
    }),
  
  division: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Division must be a valid ObjectId'
    }),
  
  company: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Company must be a valid ObjectId'
    }),
  
  type: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Type must not exceed 50 characters'
    }),
  
  sortBy: Joi.string()
    .valid('name', 'code', 'createdAt', 'updatedAt')
    .default('name')
    .messages({
      'any.only': 'sortBy must be one of: name, code, createdAt, updatedAt'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .messages({
      'any.only': 'sortOrder must be either "asc" or "desc"'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

export const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Sub-department ID is required',
      'string.pattern.base': 'Sub-department ID must be a valid ObjectId',
      'any.required': 'Sub-department ID is required'
    })
});
