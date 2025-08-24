import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Announcement from '../models/announcement.model.js';
import Holiday from '../models/holiday.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/HRPAY';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed dashboard data
const seedDashboardData = async () => {
  try {
    await connectDB();
    console.log('Starting dashboard data seeding...\n');

    // Create sample users and employees
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    const user = users[0]; // Use first user

    console.log('✅ User found for dashboard data');

    // Create sample announcements
    const announcements = [
      {
        title: 'Company Meeting Tomorrow',
        content: 'All employees are invited to attend the monthly company meeting tomorrow at 10 AM.',
        type: 'important',
        author: user._id,
        targetAudience: 'all'
      },
      {
        title: 'Holiday Notice',
        content: 'Office will be closed on Friday for Independence Day.',
        type: 'holiday',
        author: user._id,
        targetAudience: 'all'
      },
      {
        title: 'Team Building Event',
        content: 'Join us for team building activities this weekend.',
        type: 'event',
        author: user._id,
        targetAudience: 'all'
      }
    ];

    for (const announcementData of announcements) {
      const announcement = new Announcement(announcementData);
      await announcement.save();
    }
    console.log('✅ Sample announcements created');

    // Create sample holidays
    const holidays = [
      {
        name: 'Independence Day',
        date: new Date('2024-07-04'),
        type: 'public',
        description: 'National holiday'
      },
      {
        name: 'Labor Day',
        date: new Date('2024-09-02'),
        type: 'public',
        description: 'National holiday'
      },
      {
        name: 'Thanksgiving',
        date: new Date('2024-11-28'),
        type: 'public',
        description: 'National holiday'
      }
    ];

    for (const holidayData of holidays) {
      const holiday = new Holiday(holidayData);
      await holiday.save();
    }
    console.log('✅ Sample holidays created');



    console.log('\n🎉 Dashboard data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - User found for dashboard data');
    console.log('   - Sample announcements created');
    console.log('   - Sample holidays created');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted');
  mongoose.connection.close();
  process.exit(0);
});

// Run the seeding
seedDashboardData(); 