import express from 'express';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Notifications Routes (all require authentication)
router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.patch('/mark-all-read', auth, markAllAsRead); // Must come before /:id/read
router.patch('/:id/read', auth, markAsRead);

export default router; 