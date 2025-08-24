import express from 'express';
import { 
  getDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  toggleDesignationStatus,
  getDesignationStats,
  getActiveDesignations
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDesignations);

// All other routes require authentication
router.use(auth);

// Designation routes
router.get('/', getDesignations);
router.get('/stats', getDesignationStats);
router.get('/active', getActiveDesignations);
router.get('/:id', getDesignationById);
router.post('/', createDesignation);
router.put('/:id', updateDesignation);
router.delete('/:id', deleteDesignation);
router.patch('/:id/toggle-status', toggleDesignationStatus);

export default router;
