import Notification from '../../../models/Notification.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, notifications, "Notifications retrieved successfully");
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse(res, 'Failed to fetch notifications', 'NOTIFICATIONS_ERROR');
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    return successResponse(res, { count }, "Unread count retrieved successfully");
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return errorResponse(res, 'Failed to fetch unread count', 'UNREAD_COUNT_ERROR');
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return notFoundResponse(res, "Notification");
    }

    return successResponse(res, notification, "Notification marked as read");
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return errorResponse(res, 'Failed to mark notification as read', 'MARK_READ_ERROR');
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    return successResponse(res, null, "All notifications marked as read");
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return errorResponse(res, 'Failed to mark all notifications as read', 'MARK_ALL_READ_ERROR');
  }
}; 