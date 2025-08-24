import express from 'express';
import { 
  getSubDepartments,
  getSubDepartmentById,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  toggleSubDepartmentStatus,
  getSubDepartmentStats,
  getActiveSubDepartments
} from './controller.js';
import { 
  createSubDepartmentSchema,
  updateSubDepartmentSchema,
  queryParamsSchema,
  idParamSchema
} from './validation.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        error: error.details[0].message
      });
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        error: error.details[0].message
      });
    }
    next();
  };
};

// Public endpoints (no authentication required)
router.get('/active', getActiveSubDepartments);

// All other routes require authentication
router.use(auth);

// Sub-Department routes with validation
router.get('/', validateQuery(queryParamsSchema), getSubDepartments);
router.get('/stats', getSubDepartmentStats);
router.get('/active', getActiveSubDepartments);
router.get('/:id', validateParams(idParamSchema), getSubDepartmentById);
router.post('/', validate(createSubDepartmentSchema), createSubDepartment);
router.put('/:id', validateParams(idParamSchema), validate(updateSubDepartmentSchema), updateSubDepartment);
router.delete('/:id', validateParams(idParamSchema), deleteSubDepartment);
router.patch('/:id/toggle-status', validateParams(idParamSchema), toggleSubDepartmentStatus);

export default router;
