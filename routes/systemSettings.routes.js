import express from 'express';
import {
  getSystemSettings,
  updateSystemSettings
} from '../controllers/systemSettings.controller.js';

const router = express.Router();

// Get system settings
router.get('/', getSystemSettings);

// Update system settings
router.post('/', updateSystemSettings);

export default router; 