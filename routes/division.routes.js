import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createDivision,
  getDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
  getDivisionStats,
  getActiveDivisions
} from '../controllers/division.controller.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDivisions);

// Apply authentication middleware to all other routes
router.use(auth);

// Create a new division
router.post('/', createDivision);

// Get all divisions with pagination and filters
router.get('/', getDivisions);

// Get division statistics
router.get('/stats', getDivisionStats);

// Get division by ID
router.get('/:id', getDivisionById);

// Update division
router.put('/:id', updateDivision);

// Delete division
router.delete('/:id', deleteDivision);

// Toggle division status
router.patch('/:id/toggle-status', toggleDivisionStatus);

export default router;
