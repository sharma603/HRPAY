import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  getDepartmentStats,
  getActiveDepartments
} from '../controllers/department.controller.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDepartments);

// Apply authentication middleware to all other routes
router.use(auth);

// Create a new department
router.post('/', createDepartment);

// Get all departments with pagination and filters
router.get('/', getDepartments);

// Get department statistics
router.get('/stats', getDepartmentStats);

// Get department by ID
router.get('/:id', getDepartmentById);

// Update department
router.put('/:id', updateDepartment);

// Delete department
router.delete('/:id', deleteDepartment);

// Toggle department status
router.patch('/:id/toggle-status', toggleDepartmentStatus);

export default router;
