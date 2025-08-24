import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
  toggleDesignationStatus,
  getDesignationStats,
  getActiveDesignations
} from '../controllers/designation.controller.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveDesignations);

// Apply authentication middleware to all other routes
router.use(auth);

// Create a new designation
router.post('/', createDesignation);

// Get all designations with pagination and filters
router.get('/', getDesignations);

// Get designation statistics
router.get('/stats', getDesignationStats);

// Get designation by ID
router.get('/:id', getDesignationById);

// Update designation
router.put('/:id', updateDesignation);

// Delete designation
router.delete('/:id', deleteDesignation);

// Toggle designation status
router.patch('/:id/toggle-status', toggleDesignationStatus);

export default router;
