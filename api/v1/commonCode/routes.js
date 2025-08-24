import express from 'express';
import { 
  getCodeTypes,
  getCodesByType,
  createCode,
  updateCode,
  deleteCode,
  toggleCodeStatus,
  bulkCreateCodes,
  searchCodes
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all code types
router.get('/types', getCodeTypes);

// Get codes by code type
router.get('/types/:codeType', getCodesByType);

// Search codes
router.get('/search', searchCodes);

// Create new code
router.post('/', createCode);

// Bulk create codes
router.post('/bulk', bulkCreateCodes);

// Update existing code
router.put('/:id', updateCode);

// Delete code
router.delete('/:id', deleteCode);

// Toggle code activation status
router.patch('/:id/toggle-status', toggleCodeStatus);

export default router;
