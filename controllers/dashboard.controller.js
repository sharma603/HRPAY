import Announcement from '../models/announcement.model.js';
import Holiday from '../models/holiday.model.js';
import User from '../models/user.model.js';
import Employee from '../models/Employee.js';
import TasUserEmployeeLink from '../models/TasUserEmployeeLink.js';

// Get dashboard data for a specific user
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Link user to employee profile (if exists)
    const link = await TasUserEmployeeLink.findOne({ userId: user._id });
    let employeeProfile = null;
    if (link?.employeeId) {
      const emp = await Employee.findById(link.employeeId);
      if (emp) {
        employeeProfile = {
          id: emp._id,
          fullName: emp.fullName,
          department: emp.department,
          designation: emp.designation,
          phone: emp.phone,
          email: emp.email,
          avatar: emp.avatar,
          status: emp.status
        };
      }
    }

    // Get recent announcements
    const announcements = await Announcement.find({
      isActive: true,
      targetAudience: 'all',
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    // Get upcoming holidays
    const upcomingHolidays = await Holiday.find({
      isActive: true,
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(3);

    // Birthdays today
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate(); // 1-31
    const todaysBirthdays = await Employee.aggregate([
      {
        $addFields: {
          dobMonth: { $month: '$dob' },
          dobDay: { $dayOfMonth: '$dob' }
        }
      },
      {
        $match: {
          status: 'Active',
          dobMonth: month,
          dobDay: day
        }
      },
      {
        $project: {
          fullName: {
            $trim: {
              input: {
                $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName']
              }
            }
          },
          department: 1,
          designation: 1,
          dob: 1,
          avatar: 1
        }
      },
      { $limit: 10 }
    ]);

    // Team: colleagues in same department
    let team = [];
    if (employeeProfile?.department) {
      const teammates = await Employee.find({
        department: employeeProfile.department,
        status: 'Active'
      })
      .limit(10)
      .select('firstName middleName lastName designation avatar');

      team = teammates.map(t => ({
        id: t._id,
        fullName: `${t.firstName}${t.middleName ? ' ' + t.middleName : ''} ${t.lastName}`.trim(),
        designation: t.designation,
        avatar: t.avatar
      }));
    }

    const totalEmployees = await Employee.countDocuments({ status: 'Active' });

    // Prepare dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      employee: employeeProfile,
      announcements: announcements.map(announcement => ({
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        createdAt: announcement.createdAt
      })),
      upcomingHolidays: upcomingHolidays.map(holiday => ({
        id: holiday._id,
        name: holiday.name,
        date: holiday.date,
        type: holiday.type
      })),
      todaysBirthdays,
      team,
      summary: {
        totalAnnouncements: announcements.length,
        totalHolidays: upcomingHolidays.length,
        totalEmployees
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
}; 