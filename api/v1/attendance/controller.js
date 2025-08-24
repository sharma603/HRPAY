import Attendance from '../../../models/attendance.model.js';
import AttendanceEvent from '../../../models/AttendanceEvent.js';
import User from '../../../models/user.model.js';
import Employee from '../../../models/Employee.js';
import EmployeeBarcode from '../../../models/EmployeeBarcode.js';
import TasUserEmployeeLink from '../../../models/TasUserEmployeeLink.js';
import Device from '../../../models/Device.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  validationError 
} from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

// Check-in with face recognition or fingerprint
export const checkIn = async (req, res) => {
  try {
    const { method, location, deviceInfo, faceData, fingerprintData, barcodeData } = req.body;
    // Determine whose attendance to record
    let userId = req.user.id;
    let resolvedEmployeeId = null;
    if (method === 'barcode' && barcodeData) {
      try {
        const code = String(barcodeData).trim();
        const rec = await EmployeeBarcode.findOne({ code }).lean();
        if (rec?.employeeId) {
          resolvedEmployeeId = String(rec.employeeId);
          let link = await TasUserEmployeeLink.findOne({ employeeId: rec.employeeId }).lean();
          if (link?.userId) {
            userId = String(link.userId);
          } else {
            return notFoundResponse(res, 'No user linked to this employee');
          }
        }
      } catch {}
    }
    // For non-barcode methods, try to resolve employeeId via link
    if (!resolvedEmployeeId) {
      try {
        const link = await TasUserEmployeeLink.findOne({ userId }).lean();
        if (link?.employeeId) { resolvedEmployeeId = String(link.employeeId); }
      } catch {}
    }

    // Validate method
    if (!['face', 'fingerprint', 'barcode', 'manual'].includes(method)) {
      return validationError(res, 'Invalid attendance method');
    }

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      $or: [
        { userId },
        ...(resolvedEmployeeId ? [{ employeeId: resolvedEmployeeId }] : [])
      ],
      date: { $gte: today, $lt: tomorrow },
      isActive: true
    });

    // If already checked-in without checkout, enforce checkout via barcode only
    if (existingAttendance && existingAttendance.checkIn && !existingAttendance.checkOut?.time) {
      if (!(method === 'barcode' && barcodeData)) {
        return validationError(res, 'Checkout requires barcode scan');
      }
      existingAttendance.checkOut = {
        time: new Date(),
        method,
        location: location || { type: 'Point', coordinates: [0, 0] },
        deviceInfo: deviceInfo || {},
        barcodeData,
      };
      // Accumulate total hours for this session
      try {
        const inMs = new Date(existingAttendance.checkIn?.time || Date.now()).getTime();
        const outMs = new Date(existingAttendance.checkOut.time).getTime();
        const diffHrs = Math.max(0, (outMs - inMs) / (1000 * 60 * 60));
        const prev = Number(existingAttendance.totalHours || 0);
        existingAttendance.totalHours = Math.round((prev + diffHrs) * 100) / 100;
      } catch {}
      await existingAttendance.save();
      try {
        await AttendanceEvent.create({
          userId,
          employeeId: resolvedEmployeeId || undefined,
          type: 'check-out',
          time: existingAttendance.checkOut.time,
          method,
          location: existingAttendance.checkOut.location,
          deviceInfo: existingAttendance.checkOut.deviceInfo,
          payload: { barcodeData },
          attendanceId: existingAttendance._id,
        });
      } catch {}
      return successResponse(res, {
        attendanceId: existingAttendance._id,
        checkOutTime: existingAttendance.checkOut.time,
        method: existingAttendance.checkOut.method,
        totalHours: existingAttendance.totalHours,
        status: 'checked-out'
      }, 'Check-out successful');
    }

    // Create or update attendance record
    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
    } else {
      attendance = new Attendance({
        userId,
        employeeId: resolvedEmployeeId || undefined,
        date: today
      });
    }

    // If the day's attendance already has a checkout, do not allow another check-in
    if (attendance.checkOut && attendance.checkOut.time) {
      return errorResponse(res, 'Already checked out today', 400);
    }

    // Set check-in details
    attendance.checkIn = {
      time: new Date(),
      method,
      location: location || { type: 'Point', coordinates: [0, 0] },
      deviceInfo: deviceInfo || {}
    };

    // Validate face recognition data if method is face
    if (method === 'face' && faceData) {
      // Here you would implement face recognition validation
      // For now, we'll just store the face data
      attendance.checkIn.faceData = faceData;
    }

    // Validate fingerprint data if method is fingerprint
    if (method === 'fingerprint' && fingerprintData) {
      // Here you would implement fingerprint validation
      // For now, we'll just store the fingerprint data
      attendance.checkIn.fingerprintData = fingerprintData;
    }

    // Store barcode payload if provided
    if (method === 'barcode' && barcodeData) {
      attendance.checkIn.barcodeData = barcodeData;
    }

    // Ensure a placeholder checkout object exists so downstream UIs can rely on the field
    if (!attendance.checkOut) {
      attendance.checkOut = {};
    }

    await attendance.save();
    try {
      await AttendanceEvent.create({
        userId,
        employeeId: resolvedEmployeeId || undefined,
        type: 'check-in',
        time: attendance.checkIn.time,
        method: attendance.checkIn.method,
        location: attendance.checkIn.location,
        deviceInfo: attendance.checkIn.deviceInfo,
        payload: method === 'barcode' ? { barcodeData } : (method === 'face' ? { faceData } : (method === 'fingerprint' ? { fingerprintData } : {})),
        attendanceId: attendance._id,
      });
    } catch {}

    return successResponse(res, {
      attendanceId: attendance._id,
      checkInTime: attendance.checkIn.time,
      method: attendance.checkIn.method,
      status: 'checked-in'
    }, 'Check-in successful');

  } catch (error) {
    console.error('Check-in error:', error);
    return errorResponse(res, 'Check-in failed', 500);
  }
};

// Check-out with face recognition or fingerprint
export const checkOut = async (req, res) => {
  try {
    const { method, location, deviceInfo, faceData, fingerprintData, barcodeData } = req.body;
    let userId = req.user.id;
    let resolvedEmployeeId = null;
    if (method === 'barcode' && barcodeData) {
      try {
        const code = String(barcodeData).trim();
        const rec = await EmployeeBarcode.findOne({ code }).lean();
        if (rec?.employeeId) {
          resolvedEmployeeId = String(rec.employeeId);
          let link = await TasUserEmployeeLink.findOne({ employeeId: rec.employeeId }).lean();
          if (link?.userId) {
            userId = String(link.userId);
          } else {
            return notFoundResponse(res, 'No user linked to this employee');
          }
        }
      } catch {}
    }
    if (!resolvedEmployeeId) {
      try {
        const link = await TasUserEmployeeLink.findOne({ userId }).lean();
        if (link?.employeeId) { resolvedEmployeeId = String(link.employeeId); }
      } catch {}
    }

    // Validate method
    if (!['face', 'fingerprint', 'barcode', 'manual'].includes(method)) {
      return validationError(res, 'Invalid attendance method');
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      $or: [
        { userId },
        ...(resolvedEmployeeId ? [{ employeeId: resolvedEmployeeId }] : [])
      ],
      date: { $gte: today, $lt: tomorrow },
      isActive: true
    });

    if (!attendance || !attendance.checkIn) {
      return errorResponse(res, 'No check-in record found for today', 400);
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return errorResponse(res, 'Already checked out today', 400);
    }

    // Set check-out details
    attendance.checkOut = {
      time: new Date(),
      method,
      location: location || { type: 'Point', coordinates: [0, 0] },
      deviceInfo: deviceInfo || {}
    };
    // Accumulate total hours for this session
    try {
      const inMs = new Date(attendance.checkIn?.time || Date.now()).getTime();
      const outMs = new Date(attendance.checkOut.time).getTime();
      const diffHrs = Math.max(0, (outMs - inMs) / (1000 * 60 * 60));
      const prev = Number(attendance.totalHours || 0);
      attendance.totalHours = Math.round((prev + diffHrs) * 100) / 100;
    } catch {}

    // Validate face recognition data if method is face
    if (method === 'face' && faceData) {
      attendance.checkOut.faceData = faceData;
    }

    // Validate fingerprint data if method is fingerprint
    if (method === 'fingerprint' && fingerprintData) {
      attendance.checkOut.fingerprintData = fingerprintData;
    }

    // Store barcode payload if provided
    if (method === 'barcode' && barcodeData) {
      attendance.checkOut.barcodeData = barcodeData;
    }

    await attendance.save();
    try {
      await AttendanceEvent.create({
        userId,
        employeeId: resolvedEmployeeId || undefined,
        type: 'check-out',
        time: attendance.checkOut.time,
        method,
        location: attendance.checkOut.location,
        deviceInfo: attendance.checkOut.deviceInfo,
        payload: method === 'barcode' ? { barcodeData } : (method === 'face' ? { faceData } : (method === 'fingerprint' ? { fingerprintData } : {})),
        attendanceId: attendance._id,
      });
    } catch {}

    return successResponse(res, {
      attendanceId: attendance._id,
      checkOutTime: attendance.checkOut.time,
      method: attendance.checkOut.method,
      totalHours: attendance.totalHours,
      status: 'checked-out'
    }, 'Check-out successful');

  } catch (error) {
    console.error('Check-out error:', error);
    return errorResponse(res, 'Check-out failed', 500);
  }
};

// Get attendance history for user
export const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit = 30 } = req.query;

    let query = { userId, isActive: true };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    return successResponse(res, attendance, 'Attendance history retrieved successfully');

  } catch (error) {
    console.error('Get attendance history error:', error);
    return errorResponse(res, 'Failed to retrieve attendance history', 500);
  }
};

// Get today's attendance status
export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow },
      isActive: true
    });

    if (!attendance) {
      return successResponse(res, {
        checkedIn: false,
        checkedOut: false,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0
      }, 'No attendance record for today');
    }

    return successResponse(res, {
      checkedIn: !!attendance.checkIn?.time,
      checkedOut: !!attendance.checkOut?.time,
      checkInTime: attendance.checkIn?.time,
      checkOutTime: attendance.checkOut?.time,
      totalHours: attendance.totalHours,
      method: attendance.checkIn?.method
    }, 'Today\'s attendance retrieved successfully');

  } catch (error) {
    console.error('Get today attendance error:', error);
    return errorResponse(res, 'Failed to retrieve today\'s attendance', 500);
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let startDate, endDate;
    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    });

    const stats = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      averageHoursPerDay: attendance.length > 0 ? 
        (attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length).toFixed(2) : 0
    };

    return successResponse(res, stats, 'Attendance statistics retrieved successfully');

  } catch (error) {
    console.error('Get attendance stats error:', error);
    return errorResponse(res, 'Failed to retrieve attendance statistics', 500);
  }
}; 

// Admin: get today's org-wide attendance summary
export const getAdminTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total active employees
    const totalActiveEmployees = await Employee.countDocuments({ status: 'Active' });

    // Today's attendance records
    const todays = await Attendance.find({ date: { $gte: today, $lt: tomorrow }, isActive: true });

    const present = todays.filter(a => !!a.checkIn).length;
    const late = todays.filter(a => a.status === 'late').length;
    const onDuty = todays.filter(a => !!a.checkIn && !a.checkOut?.time).length;
    const absent = Math.max(totalActiveEmployees - present, 0);

    const percent = (n) => (totalActiveEmployees > 0 ? Number(((n / totalActiveEmployees) * 100).toFixed(1)) : 0);

    return successResponse(res, {
      date: today.toISOString(),
      totalEmployees: totalActiveEmployees,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      onDutyCount: onDuty,
      presentPercent: percent(present),
      absentPercent: percent(absent),
      latePercent: percent(late),
      onDutyPercent: percent(onDuty),
    }, 'Admin today summary');
  } catch (error) {
    console.error('Admin today summary error:', error);
    return errorResponse(res, 'Failed to get today summary', 500);
  }
};

// Admin: list of on-duty (checked-in but not checked-out) employees for today
export const getAdminOnDutyList = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
      'checkIn.time': { $exists: true },
      $or: [ { 'checkOut.time': { $exists: false } }, { 'checkOut.time': null } ]
    }).populate({ path: 'userId', select: 'name email' }).lean();

    // Resolve employeeIds for each record: prefer attendance.employeeId, otherwise via TasUserEmployeeLink by userId
    const userIds = Array.from(new Set(records.map(r => String(r.userId?._id || r.userId))));
    const links = await TasUserEmployeeLink.find({ userId: { $in: userIds } }).lean();
    const userToEmp = new Map(links.map(l => [String(l.userId), String(l.employeeId)]));
    const empIdsFromAtt = records.map(r => String(r.employeeId || '')).filter(Boolean);
    const empIdsFromLinks = records.map(r => userToEmp.get(String(r.userId?._id || r.userId)) || '').filter(Boolean);
    const allEmpIds = Array.from(new Set([...empIdsFromAtt, ...empIdsFromLinks]));
    const employees = await Employee.find({ _id: { $in: allEmpIds } })
      .select('employeeId firstName lastName department avatar')
      .lean();
    const empMap = new Map(employees.map(e => [String(e._id), e]));

    const rows = records.map(r => {
      const attEmpId = String(r.employeeId || '');
      const linkEmpId = userToEmp.get(String(r.userId?._id || r.userId));
      const resolvedEmpId = attEmpId || linkEmpId || '';
      const emp = resolvedEmpId ? (empMap.get(String(resolvedEmpId)) || {}) : {};
      const empName = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
      const name = empName || r.userId?.name || emp.employeeId || '';
      return {
        code: emp.employeeId || '',
        name,
        department: emp.department || '',
        checkInTime: r.checkIn?.time || null,
        method: r.checkIn?.method || '',
        avatar: emp.avatar || null,
      };
    }).sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime));

    return successResponse(res, rows, 'On-duty list');
  } catch (error) {
    console.error('Admin on-duty list error:', error);
    return errorResponse(res, 'Failed to get on-duty list', 500);
  }
});

// Public: scan barcode to auto toggle check-in/check-out without login
export const publicBarcodeScan = asyncHandler(async (req, res) => {
  try {
    const { code, location, deviceInfo } = req.body || {};
    const barcode = String(code || '').trim();
    if (!barcode) {
      return validationError(res, 'Parameter "code" is required');
    }

    // Resolve employee from barcode
    const rec = await EmployeeBarcode.findOne({ code: barcode }).lean();
    if (!rec?.employeeId) {
      return notFoundResponse(res, 'Barcode not registered');
    }

    // Resolve user linked to employee
    let link = await TasUserEmployeeLink.findOne({ employeeId: rec.employeeId }).lean();
    let userId;
    if (link?.userId) {
      userId = String(link.userId);
    } else {
      return notFoundResponse(res, 'Employee not linked to any user. Please contact administrator.');
    }

    // Today window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance STRICTLY by employeeId to avoid cross-user toggles
    let attendance = await Attendance.findOne({
      employeeId: rec.employeeId,
      date: { $gte: today, $lt: tomorrow },
      isActive: true
    });

    if (attendance && attendance.checkIn && !attendance.checkOut?.time) {
      // Checkout
      attendance.checkOut = {
        time: new Date(),
        method: 'barcode',
        location: location || { type: 'Point', coordinates: [0, 0] },
        deviceInfo: deviceInfo || {},
        barcodeData: barcode,
      };
      // Accumulate totalHours for this session
      try {
        const inMs = new Date(attendance.checkIn?.time || Date.now()).getTime();
        const outMs = new Date(attendance.checkOut.time).getTime();
        const diffHrs = Math.max(0, (outMs - inMs) / (1000 * 60 * 60));
        const prev = Number(attendance.totalHours || 0);
        attendance.totalHours = Math.round((prev + diffHrs) * 100) / 100;
      } catch {}
      await attendance.save();
      try {
        await AttendanceEvent.create({
          userId,
          employeeId: rec.employeeId,
          type: 'check-out',
          time: attendance.checkOut.time,
          method: 'barcode',
          location: attendance.checkOut.location,
          deviceInfo: attendance.checkOut.deviceInfo,
          payload: { barcodeData: barcode },
          attendanceId: attendance._id,
        });
      } catch {}
      // Upsert device record for auditing
      try {
        const id = String(deviceInfo?.deviceId || '').trim();
        if (id) {
          await Device.findOneAndUpdate(
            { deviceId: id },
            { $set: { lastActive: new Date(), meta: deviceInfo || {} } },
            { upsert: true }
          );
        }
      } catch {}
      return successResponse(res, {
        status: 'checked-out',
        attendanceId: attendance._id,
        checkOutTime: attendance.checkOut.time,
        totalHours: attendance.totalHours,
      }, 'Check-out successful');
    }

    // Check-in (create or update existing record). If already checked-out today, start a new IN by clearing checkout
    if (!attendance) {
      attendance = new Attendance({ userId, employeeId: rec.employeeId, date: today });
    }
    if (attendance.checkOut && attendance.checkOut.time) {
      attendance.checkOut = undefined;
      // keep totalHours accumulated across sessions within the same day
    }
    attendance.checkIn = {
      time: new Date(),
      method: 'barcode',
      location: location || { type: 'Point', coordinates: [0, 0] },
      deviceInfo: deviceInfo || {},
      barcodeData: barcode,
    };
    await attendance.save();
    try {
      await AttendanceEvent.create({
        userId,
        employeeId: rec.employeeId,
        type: 'check-in',
        time: attendance.checkIn.time,
        method: 'barcode',
        location: attendance.checkIn.location,
        deviceInfo: attendance.checkIn.deviceInfo,
        payload: { barcodeData: barcode },
        attendanceId: attendance._id,
      });
    } catch {}
    // Upsert device record for auditing
    try {
      const id = String(deviceInfo?.deviceId || '').trim();
      if (id) {
        await Device.findOneAndUpdate(
          { deviceId: id },
          { $set: { lastActive: new Date(), meta: deviceInfo || {} } },
          { upsert: true }
        );
      }
    } catch {}
    return successResponse(res, {
      status: 'checked-in',
      attendanceId: attendance._id,
      checkInTime: attendance.checkIn.time,
    }, 'Check-in successful');
  } catch (error) {
    console.error('Public barcode scan error:', error);
    return errorResponse(res, 'Failed to record attendance', 500);
  }
});

// Public: check if barcode exists without authentication
export const publicBarcodeCheck = asyncHandler(async (req, res) => {
  try {
    const { code } = req.query || {};
    const barcode = String(code || '').trim();
    
    if (!barcode) {
      return validationError(res, 'Query parameter "code" is required');
    }

    // Check if barcode exists
    const record = await EmployeeBarcode.findOne({ code, isActive: true }).lean();
    if (!record) {
      return successResponse(res, { exists: false }, 'Barcode not found');
    }

    // Get employee details
    const employee = await Employee.findById(record.employeeId)
      .select('employeeId firstName middleName lastName status')
      .lean();
    
    if (!employee) {
      return successResponse(res, { exists: false }, 'Employee not found');
    }

    const fullName = `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim();
    
    return successResponse(res, {
      exists: true,
      employee: {
        id: String(employee._id),
        employeeId: employee.employeeId,
        name: fullName,
        status: employee.status
      },
      barcode: {
        format: record.format,
        isActive: record.isActive,
        issuedAt: record.issuedAt
      }
    }, 'Barcode found');
    
  } catch (error) {
    console.error('Public barcode check error:', error);
    return errorResponse(res, 'Failed to check barcode', 500);
  }
});

// Auth: scan barcode to toggle check-in/check-out (same logic as public, but requires auth)
export const toggleBarcodeAttendance = asyncHandler(async (req, res) => {
  try {
    const { code, location, deviceInfo } = req.body || {};
    const barcode = String(code || '').trim();
    if (!barcode) {
      return validationError(res, 'Parameter "code" is required');
    }

    // Resolve employee from barcode
    const rec = await EmployeeBarcode.findOne({ code: barcode }).lean();
    if (!rec?.employeeId) {
      return notFoundResponse(res, 'Barcode not registered');
    }

    // Resolve user linked to employee
    let link = await TasUserEmployeeLink.findOne({ employeeId: rec.employeeId }).lean();
    let userId;
    if (link?.userId) {
      userId = String(link.userId);
    } else {
      return notFoundResponse(res, 'Employee not linked to any user. Please contact administrator.');
    }

    // Today window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's attendance STRICTLY by employeeId to avoid cross-user toggles
    let attendance = await Attendance.findOne({ employeeId: rec.employeeId, date: { $gte: today, $lt: tomorrow }, isActive: true });

    if (attendance && attendance.checkIn && !attendance.checkOut?.time) {
      // Checkout
      attendance.checkOut = {
        time: new Date(),
        method: 'barcode',
        location: location || { type: 'Point', coordinates: [0, 0] },
        deviceInfo: deviceInfo || {},
        barcodeData: barcode,
      };
      await attendance.save();
      try {
        await AttendanceEvent.create({
          userId,
          employeeId: rec.employeeId,
          type: 'check-out',
          time: attendance.checkOut.time,
          method: 'barcode',
          location: attendance.checkOut.location,
          deviceInfo: attendance.checkOut.deviceInfo,
          payload: { barcodeData: barcode },
          attendanceId: attendance._id,
        });
      } catch {}
      return successResponse(res, {
        status: 'checked-out',
        attendanceId: attendance._id,
        checkOutTime: attendance.checkOut.time,
        totalHours: attendance.totalHours,
      }, 'Check-out successful');
    }

    // Check-in (create or update existing record). If already checked-out today, start a new IN by clearing checkout
    if (!attendance) {
      attendance = new Attendance({ userId, employeeId: rec.employeeId, date: today });
    }
    if (attendance.checkOut && attendance.checkOut.time) {
      attendance.checkOut = undefined;
      // keep totalHours accumulated across sessions within the same day
    }
    attendance.checkIn = {
      time: new Date(),
      method: 'barcode',
      location: location || { type: 'Point', coordinates: [0, 0] },
      deviceInfo: deviceInfo || {},
      barcodeData: barcode,
    };
    // ensure placeholder checkout object exists
    if (!attendance.checkOut) attendance.checkOut = {};
    await attendance.save();
    try {
      await AttendanceEvent.create({
        userId,
        employeeId: rec.employeeId,
        type: 'check-in',
        time: attendance.checkIn.time,
        method: 'barcode',
        location: attendance.checkIn.location,
        deviceInfo: attendance.checkIn.deviceInfo,
        payload: { barcodeData: barcode },
        attendanceId: attendance._id,
      });
    } catch {}
    return successResponse(res, {
      status: 'checked-in',
      attendanceId: attendance._id,
      checkInTime: attendance.checkIn.time,
    }, 'Check-in successful');
  } catch (error) {
    console.error('Toggle barcode error:', error);
    return errorResponse(res, 'Failed to record attendance', 500);
  }
});

// Admin: Date-range analysis across employees
export const attendanceAnalysis = asyncHandler(async (req, res) => {
  const { from, to, q } = req.query || {};
  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Get active employees (basic list)
  const employees = await Employee.find({ status: 'Active' })
    .select('employeeId firstName lastName')
    .limit(500)
    .lean();

  // Aggregate attendance total minutes per user in date range
  const byUser = await Attendance.aggregate([
    { $match: { date: { $gte: start, $lte: end }, isActive: true } },
    { $group: { _id: '$userId', minutes: { $sum: { $ifNull: ['$totalHours', 0] } } } },
  ]);
  const minutesMap = new Map(byUser.map(r => [String(r._id), Number(r.minutes || 0) * 60])); // totalHours assumed in hours → minutes

  // Map users to employees via TasUserEmployeeLink if available
  const links = await TasUserEmployeeLink.find({ userId: { $in: Array.from(minutesMap.keys()) } })
    .select('userId employeeId')
    .lean();
  const userToEmp = new Map(links.map(l => [String(l.userId), String(l.employeeId)]));

  const rows = employees.map((e, idx) => {
    // find minutes by any linked user
    let totalMinutes = 0;
    for (const [userId, empId] of userToEmp.entries()) {
      if (empId === String(e._id)) {
        totalMinutes += minutesMap.get(userId) || 0;
      }
    }
    return {
      sl: idx + 1,
      code: e.employeeId,
      name: [e.firstName, e.lastName].filter(Boolean).join(' '),
      minutes: Math.round(totalMinutes),
    };
  }).filter(r => !q || r.name?.toLowerCase().includes(String(q).toLowerCase()) || r.code?.toLowerCase().includes(String(q).toLowerCase()));

  return successResponse(res, rows, 'Attendance analysis');
});

// Admin: list in/out for a specific date (for editing screen)
export const attendanceListByDate = asyncHandler(async (req, res) => {
  const { date, q } = req.query || {};
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  const tomorrow = new Date(d); tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await Attendance.find({ date: { $gte: d, $lt: tomorrow }, isActive: true })
    .populate({ path: 'userId', select: 'name email' })
    .lean();

  // Build maps for quick lookups
  const userIdToRecord = new Map(records
    .filter(r => r.userId)
    .map(r => [String(r.userId?._id || r.userId), r])
  );
  const empIdToRecord = new Map(records
    .filter(r => r.employeeId)
    .map(r => [String(r.employeeId), r])
  );
  const links = await TasUserEmployeeLink.find({}).lean();
  const empToUser = new Map(links.map(l => [String(l.employeeId), String(l.userId)]));

  // Load all active employees so absentees are included
  const employees = await Employee.find({ status: 'Active' })
    .select('employeeId firstName lastName')
    .lean();

  const rows = employees.map(e => {
    const empId = String(e._id);
    // Prefer direct match by attendance.employeeId when available
    let rec = empIdToRecord.get(empId) || null;
    if (!rec) {
      const userId = empToUser.get(empId);
      if (userId) rec = userIdToRecord.get(userId) || null;
    }
    // Prefer Employee full name to avoid mismatches with User name
    const name = [e.firstName, e.lastName].filter(Boolean).join(' ');
    return {
      code: e.employeeId || '',
      name,
      in: rec?.checkIn?.time || null,
      out: rec?.checkOut?.time || null,
      totalHours: rec?.totalHours || 0,
      status: rec?.status || 'absent',
    };
  }).filter(r => !q || r.name?.toLowerCase().includes(String(q).toLowerCase()) || r.code?.toLowerCase().includes(String(q).toLowerCase()));

  return successResponse(res, rows, 'Attendance list for date (including absentees)');
});

// Admin: multi-day range report with daily IN/OUT per employee
export const attendanceRangeReport = asyncHandler(async (req, res) => {
  const { from, to, q } = req.query || {};
  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Build date buckets (inclusive)
  const dates = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  const dayKey = (dt) => new Date(dt).toISOString().slice(0,10);
  const dateKeys = dates.map(dayKey);

  // Load active employees (filter by q if provided)
  const empQuery = { status: 'Active' };
  const allEmps = await Employee.find(empQuery)
    .select('employeeId firstName lastName')
    .lean();
  const emps = allEmps.filter(e => !q || (e.employeeId || '').toLowerCase().includes(String(q).toLowerCase()) || [e.firstName, e.lastName].filter(Boolean).join(' ').toLowerCase().includes(String(q).toLowerCase()));

  // Load user links for these employees
  const empIds = emps.map(e => String(e._id));
  const links = await TasUserEmployeeLink.find({ employeeId: { $in: empIds } }).lean();
  const empToUser = new Map(links.map(l => [String(l.employeeId), String(l.userId)]));

  // Fetch attendance in range; prefer employeeId match; fallback entries with only userId will be mapped via link
  const att = await Attendance.find({
    date: { $gte: start, $lte: end },
    isActive: true,
    $or: [ { employeeId: { $in: empIds } }, { userId: { $in: links.map(l => String(l.userId)) } } ]
  }).lean();

  // Index attendance by (employeeId, dateKey)
  const attMap = new Map();
  for (const r of att) {
    const empId = String(r.employeeId || '') || (() => {
      const uid = String(r.userId || '');
      // reverse lookup
      for (const [eId, uId] of empToUser.entries()) { if (uId === uid) return eId; }
      return '';
    })();
    if (!empId) continue;
    const key = `${empId}::${dayKey(r.date)}`;
    attMap.set(key, r);
  }

  const rows = emps.map(e => {
    const name = [e.firstName, e.lastName].filter(Boolean).join(' ');
    const days = dateKeys.map(k => {
      const rec = attMap.get(`${String(e._id)}::${k}`);
      return {
        date: k,
        in: rec?.checkIn?.time || null,
        out: rec?.checkOut?.time || null,
        totalHours: rec?.totalHours || 0,
        status: rec ? (rec.status || 'present') : 'absent',
      };
    });
    return { code: e.employeeId || '', name, days };
  });

  return successResponse(res, { dates: dateKeys, rows }, 'Attendance range report');
});

// Server-Sent Events stream for live AttendanceEvent updates
export const streamAttendanceEvents = asyncHandler(async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  try { res.flushHeaders?.(); } catch {}

  const { employeeId, userId } = req.query || {};
  const pipeline = [];
  // Filter to inserts only on AttendanceEvent
  pipeline.push({ $match: { operationType: { $in: ['insert'] } } });
  // Additional filters (if provided)
  if (employeeId) {
    pipeline.push({ $match: { 'fullDocument.employeeId': { $eq: (await (async () => employeeId)()) } } });
  }
  if (userId) {
    pipeline.push({ $match: { 'fullDocument.userId': { $eq: (await (async () => userId)()) } } });
  }

  // Send initial ping so clients know we're connected
  res.write(`event: ping\n`);
  res.write(`data: "connected"\n\n`);

  let changeStream;
  const close = () => {
    try { changeStream?.close(); } catch {}
    try { res.end(); } catch {}
  };

  try {
    changeStream = AttendanceEvent.watch(pipeline, { fullDocument: 'updateLookup' });
    changeStream.on('change', (change) => {
      try {
        const doc = change.fullDocument || {};
        const payload = {
          id: String(doc._id || ''),
          userId: String(doc.userId || ''),
          employeeId: doc.employeeId ? String(doc.employeeId) : undefined,
          type: doc.type,
          time: doc.time || doc.createdAt || new Date(),
          method: doc.method,
          location: doc.location,
          deviceInfo: doc.deviceInfo,
          payload: doc.payload,
          attendanceId: doc.attendanceId ? String(doc.attendanceId) : undefined,
          createdAt: doc.createdAt,
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch {}
    });
    changeStream.on('error', () => close());
  } catch (err) {
    // If change streams are not enabled on MongoDB (non-replica set), end gracefully
    res.write(`event: error\n`);
    res.write(`data: "change streams not available"\n\n`);
    return close();
  }

  // Clean up when client disconnects
  req.on('close', () => close());
});

// Admin: create missing TasUserEmployeeLink records for employees with barcodes
export const backfillEmployeeUserLinks = asyncHandler(async (req, res) => {
  // Require explicit userId to be provided
  const userId = req.body?.userId;
  if (!userId) {
    return errorResponse(res, 'userId is required in request body', 400);
  }

  // Find employees that have an active barcode but no link
  const activeBarcodes = await EmployeeBarcode.find({ isActive: true }, { employeeId: 1 }).lean();
  const employeeIds = Array.from(new Set(activeBarcodes.map(b => String(b.employeeId))));
  const existingLinks = await TasUserEmployeeLink.find({ employeeId: { $in: employeeIds } }, { employeeId: 1 }).lean();
  const linkedSet = new Set(existingLinks.map(l => String(l.employeeId)));
  const toLink = employeeIds.filter(id => !linkedSet.has(id));

  let created = 0;
  for (const empId of toLink) {
    try {
      await TasUserEmployeeLink.create({ employeeId: empId, userId: userId, accessLevel: 'employee' });
      created += 1;
    } catch {}
  }

  return successResponse(res, { created, processed: employeeIds.length }, 'Backfill completed');
});

// TAS: Daily Attendance Report
export const getTasDailyReport = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate, department, search, location, employeeName, designation } = req.query || {};
    
    // Handle date range
    let startDate, endDate;
    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today if no dates provided
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Build query for employees
    let empQuery = { status: 'Active' };
    if (department) {
      empQuery.department = { $regex: department, $options: 'i' };
    }
    if (designation) {
      empQuery.designation = { $regex: designation, $options: 'i' };
    }
    if (employeeName) {
      empQuery.$or = [
        { firstName: { $regex: employeeName, $options: 'i' } },
        { lastName: { $regex: employeeName, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(empQuery)
      .select('employeeId firstName lastName department designation')
      .lean();

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    }).populate('userId', 'name email').lean();

    // Build attendance map
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      if (record.employeeId) {
        attendanceMap.set(String(record.employeeId), record);
      }
    });

    // Generate daily report with working hours calculation
    let dailyReport = employees.map(emp => {
      const attendance = attendanceMap.get(String(emp._id));
      const name = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
      
      // Calculate working hours
      let totalHours = 0;
      let workingHours = 'N/A';
      if (attendance?.checkIn?.time && attendance?.checkOut?.time) {
        const checkIn = new Date(attendance.checkIn.time);
        const checkOut = new Date(attendance.checkOut.time);
        const diffMs = checkOut - checkIn;
        totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        workingHours = `${totalHours}h`;
      } else if (attendance?.checkIn?.time) {
        workingHours = 'On Duty';
      }
      
      return {
        employeeId: emp.employeeId || '',
        fingerId: emp.employeeId || '', // Using employeeId as fingerId for now
        name,
        department: emp.department || '',
        designation: emp.designation || '',
        checkIn: attendance?.checkIn?.time || null,
        checkOut: attendance?.checkOut?.time || null,
        totalHours: workingHours,
        status: attendance?.status || 'absent',
        late: attendance?.status === 'late',
        present: !!attendance?.checkIn,
        absent: !attendance?.checkIn,
        location: attendance?.location || 'Doha Qatar',
        source: attendance?.source || 'MACHINE'
      };
    });

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      dailyReport = dailyReport.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
    }

    // Calculate summary
    const summary = {
      totalEmployees: dailyReport.length,
      present: dailyReport.filter(r => r.present).length,
      absent: dailyReport.filter(r => r.absent).length,
      late: dailyReport.filter(r => r.late).length,
      onDuty: dailyReport.filter(r => r.present && !r.checkOut).length
    };

    return successResponse(res, {
      fromDate: startDate.toISOString(),
      toDate: endDate.toISOString(),
      summary,
      employees: dailyReport
    }, 'Daily attendance report generated successfully');
  } catch (error) {
    console.error('TAS Daily Report error:', error);
    return errorResponse(res, 'Failed to generate daily report', 500);
  }
});

// TAS: On-duty Shift Report
export const getTasOnDutyReport = asyncHandler(async (req, res) => {
  try {
    const { date, shift, department } = req.query || {};
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(reportDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build query for employees
    let empQuery = { status: 'Active' };
    if (department) {
      empQuery.department = department;
    }

    const employees = await Employee.find(empQuery)
      .select('employeeId firstName lastName department designation')
    .lean();

    // Get on-duty employees (checked in but not checked out)
    const onDutyRecords = await Attendance.find({
      date: { $gte: reportDate, $lt: tomorrow },
      isActive: true,
      'checkIn.time': { $exists: true },
      'checkOut.time': { $exists: false }
    }).lean();

    // Build on-duty map
    const onDutyMap = new Map();
    onDutyRecords.forEach(record => {
      if (record.employeeId) {
        onDutyMap.set(String(record.employeeId), record);
      }
    });

    // Generate on-duty report
    const onDutyReport = employees
      .filter(emp => onDutyMap.has(String(emp._id)))
      .map(emp => {
        const attendance = onDutyMap.get(String(emp._id));
        const name = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
        
        return {
          employeeId: emp.employeeId || '',
          name,
          department: emp.department || '',
          designation: emp.designation || '',
          checkInTime: attendance?.checkIn?.time,
          checkInMethod: attendance?.checkIn?.method,
          hoursWorked: attendance?.totalHours || 0,
          location: attendance?.checkIn?.location
        };
      });

    return successResponse(res, {
      date: reportDate.toISOString(),
      totalOnDuty: onDutyReport.length,
      employees: onDutyReport
    }, 'On-duty shift report generated successfully');
  } catch (error) {
    console.error('TAS On-Duty Report error:', error);
    return errorResponse(res, 'Failed to generate on-duty report', 500);
  }
});

// TAS: Absent Summary Report
export const getTasAbsentSummary = asyncHandler(async (req, res) => {
  try {
    const { fromDate, toDate, department, search, location, employeeName, designation } = req.query || {};
    
    // Handle date range
    let startDate, endDate;
    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today if no dates provided
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Build query for employees
    let empQuery = { status: 'Active' };
    if (department) {
      empQuery.department = { $regex: department, $options: 'i' };
    }
    if (designation) {
      empQuery.designation = { $regex: designation, $options: 'i' };
    }
    if (employeeName) {
      empQuery.$or = [
        { firstName: { $regex: employeeName, $options: 'i' } },
        { lastName: { $regex: employeeName, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(empQuery)
      .select('employeeId firstName lastName department designation')
      .lean();

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    }).lean();

    // Build attendance map
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      if (record.employeeId) {
        attendanceMap.set(String(record.employeeId), record);
      }
    });

    // Generate absent summary with leave date
    const absentEmployees = employees
      .filter(emp => !attendanceMap.has(String(emp._id)))
      .map(emp => {
        const name = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
        
        return {
          employeeId: emp.employeeId || '',
          name,
          department: emp.department || '',
          designation: emp.designation || '',
          leaveDate: startDate.toISOString(), // Use the start date as leave date
          status: 'absent',
          remark: 'No check-in recorded'
        };
      });

    // Apply search filter if provided
    let filteredAbsentEmployees = absentEmployees;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAbsentEmployees = absentEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
    }

    // Calculate summary statistics
    const departments = [...new Set(filteredAbsentEmployees.map(emp => emp.department))].length;
    const totalEmployees = employees.length;
    const absentRate = totalEmployees > 0 ? Math.round((filteredAbsentEmployees.length / totalEmployees) * 100) : 0;

    return successResponse(res, {
      fromDate: startDate.toISOString(),
      toDate: endDate.toISOString(),
      summary: {
        totalAbsent: filteredAbsentEmployees.length,
        totalEmployees,
        absentRate: `${absentRate}%`,
        departments
      },
      employees: filteredAbsentEmployees
    }, 'Absenteeism summary report generated successfully');
  } catch (error) {
    console.error('TAS Absent Summary error:', error);
    return errorResponse(res, 'Failed to generate absent summary', 500);
  }
});

// TAS: Late Come Report
export const getTasLateComeReport = asyncHandler(async (req, res) => {
  try {
    const { date, department, lateThreshold } = req.query || {};
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(reportDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Default late threshold: 9:00 AM
    const threshold = lateThreshold || '09:00';
    const [thresholdHour, thresholdMinute] = threshold.split(':').map(Number);
    const thresholdTime = new Date(reportDate);
    thresholdTime.setHours(thresholdHour, thresholdMinute, 0, 0);

    // Build query for employees
    let empQuery = { status: 'Active' };
    if (department) {
      empQuery.department = department;
    }

    const employees = await Employee.find(empQuery)
      .select('employeeId firstName lastName department designation')
      .lean();

    // Get late attendance records
    const lateRecords = await Attendance.find({
      date: { $gte: reportDate, $lt: tomorrow },
      isActive: true,
      'checkIn.time': { $gt: thresholdTime }
    }).lean();

    // Build late attendance map
    const lateMap = new Map();
    lateRecords.forEach(record => {
      if (record.employeeId) {
        lateMap.set(String(record.employeeId), record);
      }
    });

    // Generate late come report
    const lateEmployees = employees
      .filter(emp => lateMap.has(String(emp._id)))
      .map(emp => {
        const attendance = lateMap.get(String(emp._id));
        const name = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
        const checkInTime = new Date(attendance.checkIn.time);
        const minutesLate = Math.round((checkInTime - thresholdTime) / (1000 * 60));
        
        return {
          employeeId: emp.employeeId || '',
          name,
          department: emp.department || '',
          designation: emp.designation || '',
          checkInTime: attendance.checkIn.time,
          scheduledTime: thresholdTime,
          minutesLate,
          checkInMethod: attendance.checkIn.method
        };
      });

    // Group by department
    const byDepartment = {};
    lateEmployees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!byDepartment[dept]) {
        byDepartment[dept] = [];
      }
      byDepartment[dept].push(emp);
    });

    return successResponse(res, {
      date: reportDate.toISOString(),
      lateThreshold: threshold,
      totalLate: lateEmployees.length,
      byDepartment,
      employees: lateEmployees
    }, 'Late come report generated successfully');
  } catch (error) {
    console.error('TAS Late Come Report error:', error);
    return errorResponse(res, 'Failed to generate late come report', 500);
  }
});