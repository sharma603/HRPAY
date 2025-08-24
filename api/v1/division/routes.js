import express from 'express';
import { 
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
  getDivisionStats,
  getActiveDivisions
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDivisions);

// All other routes require authentication
router.use(auth);

// Division routes
router.get('/', getDivisions);
router.get('/stats', getDivisionStats);
router.get('/active', getActiveDivisions);
router.get('/:id', getDivisionById);
router.post('/', createDivision);
router.put('/:id', updateDivision);
router.delete('/:id', deleteDivision);
router.patch('/:id/toggle-status', toggleDivisionStatus);

export default router;
