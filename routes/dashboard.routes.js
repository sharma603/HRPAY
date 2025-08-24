import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get dashboard data
router.get('/data', auth, getDashboardData);

export default router; 