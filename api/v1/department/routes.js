import express from 'express';
import { 
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  getDepartmentStats,
  getActiveDepartments
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDepartments);

// All other routes require authentication
router.use(auth);

// Department routes
router.get('/', getDepartments);
router.get('/stats', getDepartmentStats);
router.get('/active', getActiveDepartments);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);
router.patch('/:id/toggle-status', toggleDepartmentStatus);

export default router;
