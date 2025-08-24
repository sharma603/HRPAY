import express from 'express';
import { getSettings, updateSettings, getCompanyInfo, updateCompanyInfo } from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Settings Routes (all require authentication)
router.get('/', auth, getSettings);
router.post('/', auth, updateSettings);
router.get('/company', auth, getCompanyInfo);
router.post('/company', auth, updateCompanyInfo);

export default router; 