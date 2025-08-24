import express from 'express';
import { 
  getShifts, 
  createShift, 
  updateShift, 
  deleteShift,
  getAreas,
  createArea,
  updateArea,
  deleteArea
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Shift routes
router.get('/shifts', getShifts);
router.post('/shifts', createShift);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

// Area routes
router.get('/areas', getAreas);
router.post('/areas', createArea);
router.put('/areas/:id', updateArea);
router.delete('/areas/:id', deleteArea);

export default router;
