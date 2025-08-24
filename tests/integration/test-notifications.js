import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSampleNotifications = async () => {
  try {
    // First, get a user ID (assuming there's at least one user)
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }

    // Clear existing notifications for this user
    await Notification.deleteMany({ userId: user._id });
    console.log('Cleared existing notifications');

    // Create sample notifications
    const sampleNotifications = [
      {
        title: 'Welcome to HR System',
        message: 'Welcome to the new HR Management System. Your account has been successfully created.',
        type: 'success',
        priority: 'high',
        userId: user._id,
        isRead: false
      },
      {
        title: 'Timesheet Reminder',
        message: 'Please submit your timesheet for this week by Friday.',
        type: 'warning',
        priority: 'medium',
        userId: user._id,
        isRead: false
      },
      {
        title: 'Leave Request Approved',
        message: 'Your leave request for January 15-20 has been approved.',
        type: 'info',
        priority: 'medium',
        userId: user._id,
        isRead: true
      },
      {
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur on Sunday from 2-4 AM. The system may be temporarily unavailable.',
        type: 'warning',
        priority: 'low',
        userId: user._id,
        isRead: false
      },
      {
        title: 'New Feature Available',
        message: 'The new Employee Self Service module is now available. Check it out!',
        type: 'info',
        priority: 'medium',
        userId: user._id,
        isRead: false
      },
      {
        title: 'Payroll Processed',
        message: 'Your salary for this month has been processed and will be credited to your account.',
        type: 'success',
        priority: 'high',
        userId: user._id,
        isRead: true
      }
    ];

    // Insert notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} sample notifications`);

    // Display the created notifications
    console.log('\nSample notifications created:');
    createdNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} - ${notification.isRead ? 'Read' : 'Unread'}`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSampleNotifications();
  mongoose.connection.close();
};

main(); 