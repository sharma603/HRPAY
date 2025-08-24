import express from 'express';
import { getDashboardData, getAnnouncements, getHolidays } from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Dashboard Routes (all require authentication)
router.get('/data', auth, getDashboardData);
router.get('/announcements', auth, getAnnouncements);
router.get('/holidays', auth, getHolidays);

export default router; 