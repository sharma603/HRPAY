import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
  getCompanyStats,
  getActiveCompanies
} from '../controllers/company.controller.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveCompanies);

// Apply authentication middleware to all other routes
router.use(auth);

// Create a new company
router.post('/', createCompany);

// Get all companies with pagination and filters
router.get('/', getCompanies);

// Get company statistics
router.get('/stats', getCompanyStats);

// Get company by ID
router.get('/:id', getCompanyById);

// Update company
router.put('/:id', updateCompany);

// Delete company
router.delete('/:id', deleteCompany);

// Toggle company status
router.patch('/:id/toggle-status', toggleCompanyStatus);

export default router;
