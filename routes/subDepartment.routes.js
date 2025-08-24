import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createSubDepartment,
  getSubDepartments,
  getSubDepartmentById,
  updateSubDepartment,
  deleteSubDepartment,
  toggleSubDepartmentStatus,
  getSubDepartmentStats,
  getActiveSubDepartments
} from '../controllers/subDepartment.controller.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveSubDepartments);

// Apply authentication middleware to all other routes
router.use(auth);

// Create a new sub-department
router.post('/', createSubDepartment);

// Get all sub-departments with pagination and filters
router.get('/', getSubDepartments);

// Get sub-department statistics
router.get('/stats', getSubDepartmentStats);

// Get sub-department by ID
router.get('/:id', getSubDepartmentById);

// Update sub-department
router.put('/:id', updateSubDepartment);

// Delete sub-department
router.delete('/:id', deleteSubDepartment);

// Toggle sub-department status
router.patch('/:id/toggle-status', toggleSubDepartmentStatus);

export default router;
