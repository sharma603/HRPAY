import express from 'express';
import { 
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
  getCompanyStats,
  getActiveCompanies
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Public endpoints (no authentication required)
router.get('/active', getActiveCompanies);

// All other routes require authentication
router.use(auth);

// Company routes
router.get('/', getCompanies);
router.get('/stats', getCompanyStats);
router.get('/active', getActiveCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.patch('/:id/toggle-status', toggleCompanyStatus);

export default router; 