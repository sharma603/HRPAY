import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import EmployeeBarcode from '../models/EmployeeBarcode.js';
import EmployeeBiometric from '../models/EmployeeBiometric.js';

// Get next employee ID suggestion (e.g., increment numeric suffix)
export const getNextEmployeeId = asyncHandler(async (req, res) => {
  // Try to infer pattern like PREFIXNNN where NNN is number
  const last = await Employee.findOne({}, { employeeId: 1 }).sort({ createdAt: -1 }).lean();
  let nextId = 'EMP001';
  if (last?.employeeId) {
    const match = String(last.employeeId).match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2], 10) + 1;
      const width = match[2].length;
      nextId = `${prefix}${String(num).padStart(width, '0')}`;
    } else {
      nextId = `${last.employeeId}-1`;
    }
  }
  res.json({ success: true, data: { nextId, lastId: last?.employeeId || null } });
});

// Create or update a barcode for an employee
export const setEmployeeBarcode = asyncHandler(async (req, res) => {
  const { id } = req.params; // employee id
  const { code, format = 'barcode', revoke = false } = req.body;
  const employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  if (revoke) {
    const updated = await EmployeeBarcode.findOneAndUpdate({ employeeId: id, isActive: true }, { isActive: false, revokedAt: new Date() }, { new: true });
    return res.json({ success: true, message: 'Barcode revoked', data: updated });
  }

  if (!code) return res.status(400).json({ success: false, message: 'Barcode code is required' });

  // Prevent duplicate barcode entries globally (active or inactive)
  const existingByCode = await EmployeeBarcode.findOne({ code }).lean();
  if (existingByCode) {
    if (String(existingByCode.employeeId) === String(id) && existingByCode.isActive) {
      return res.status(200).json({ success: true, message: 'Barcode already set for this employee', data: existingByCode });
    }
    return res.status(409).json({ success: false, message: 'This barcode is already assigned to another employee' });
  }

  // Ensure an employee has only one active barcode
  await EmployeeBarcode.updateMany({ employeeId: id, isActive: true }, { isActive: false, revokedAt: new Date() });

  // Create new unique barcode record
  const record = await EmployeeBarcode.create({ employeeId: id, code, format, isActive: true });

  // Also denormalize on Employee for quick lookups
  try {
    employee.barcode = code;
    employee.updatedAt = Date.now();
    await employee.save();
  } catch {}

  return res.status(201).json({ success: true, message: 'Barcode set', data: record });
});

// Lookup current active barcode for an employee
export const getEmployeeBarcode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await EmployeeBarcode.findOne({ employeeId: id, isActive: true }).lean();
  return res.json({ success: true, data: record });
});

// Check if a barcode code already exists (instant validation for scanners)
export const checkBarcodeExists = asyncHandler(async (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) {
    return res.status(400).json({ success: false, message: 'Query parameter "code" is required' });
  }
  const record = await EmployeeBarcode.findOne({ code }).lean();
  if (!record) {
    return res.json({ success: true, data: { exists: false } });
  }
  const employee = await Employee.findById(record.employeeId)
    .select('employeeId firstName middleName lastName status')
    .lean();
  const fullName = employee ? `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim() : null;
  return res.json({
    success: true,
    data: {
      exists: true,
      employee: employee ? { id: String(employee._id), employeeId: employee.employeeId, name: fullName, status: employee.status } : null,
      barcode: { format: record.format, isActive: record.isActive, issuedAt: record.issuedAt }
    }
  });
});

// Get all employees
export const getEmployees = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, search, department, status } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { subDepartment: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Execute query with pagination
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const total = await Employee.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
});

// Get employee by ID
export const getEmployeeById = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
});

// Create new employee
export const createEmployee = asyncHandler(async (req, res) => {
  try {
    // If a barcode is provided during creation, validate uniqueness first
    const requestedBarcode = (req.body.barcode || '').trim();
    if (requestedBarcode) {
      const existingBarcodeRecord = await EmployeeBarcode.findOne({ code: requestedBarcode }).lean();
      if (existingBarcodeRecord) {
        return res.status(409).json({
          success: false,
          message: 'This barcode is already assigned to another employee'
        });
      }
      const existingEmployeeWithBarcode = await Employee.findOne({ barcode: requestedBarcode }).lean();
      if (existingEmployeeWithBarcode) {
        return res.status(409).json({
          success: false,
          message: 'This barcode is already assigned to another employee'
        });
      }
    }

    // Auto-generate employeeId if not provided
    if (!req.body.employeeId) {
      const last = await Employee.findOne({}, { employeeId: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean();
      let nextId = 'EMP001';
      if (last?.employeeId) {
        const match = String(last.employeeId).match(/^(.*?)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const num = parseInt(match[2], 10) + 1;
          const width = match[2].length;
          nextId = `${prefix}${String(num).padStart(width, '0')}`;
        } else {
          nextId = `${last.employeeId}-1`;
        }
      }
      req.body.employeeId = nextId;
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existingEmployee) {
      return res.status(409).json({ success: false, message: 'Employee ID already exists' });
    }
    
    // Normalize/derive fields from accept-friendly payloads
    const payload = { ...req.body };
    
    // Handle workInfo structure
    if (payload.workInfo && payload.workInfo.location) {
      payload.location = payload.workInfo.location;
    }
    
    // If client sent name fields separately via a single 'name' field (mobile splits already), keep safe
    if (!payload.firstName && payload.name) {
      const parts = String(payload.name).trim().split(/\s+/).filter(Boolean);
      payload.firstName = parts.shift() || 'NA';
      payload.lastName = parts.length ? parts.pop() : 'NA';
      payload.middleName = parts.length ? parts.join(' ') : '';
    }
    // Sanitize optional enum fields and coerce types to avoid validation errors from empty strings
    try {
      const allowedTitles = ['Mr.', 'Ms.', 'Dr.', 'Mrs.'];
      if (!allowedTitles.includes(payload.title)) {
        delete payload.title; // allow schema default
      }
      const allowedReligions = ['Islam', 'Christianity', 'Hinduism', 'Other'];
      if (!allowedReligions.includes(payload.religion)) {
        delete payload.religion; // optional
      }
      const allowedDivisions = ['North', 'South', 'East', 'West'];
      if (!allowedDivisions.includes(payload.division)) {
        delete payload.division; // optional
      }
      // Coerce dates if provided as strings (YYYY-MM-DD)
      if (payload.dob) {
        payload.dob = new Date(payload.dob);
      }
      if (payload.dateOfJoining) {
        payload.dateOfJoining = new Date(payload.dateOfJoining);
      }
      // Coerce numeric salary
      if (typeof payload.basicSalary === 'string') {
        const parsed = parseFloat(payload.basicSalary);
        if (!Number.isFinite(parsed)) {
          return res.status(400).json({ success: false, message: 'Invalid data: basicSalary must be a number' });
        }
        payload.basicSalary = parsed;
      }
      // Validate salary type with safe default if missing/invalid
      const allowedSalaryTypes = ['Monthly', 'Weekly', 'Daily'];
      if (!allowedSalaryTypes.includes(payload.salaryType)) {
        payload.salaryType = 'Monthly';
      }
    } catch {}

    // Create new employee
    // Set a default createdBy if not provided (temporary solution for development)
    if (!payload.createdBy) {
      payload.createdBy = new mongoose.Types.ObjectId('000000000000000000000000'); // Placeholder ObjectId
    }
    const employee = new Employee(payload);
    await employee.save();
    
    // If barcode provided, create barcode record and ensure it is active
    if (requestedBarcode) {
      try {
        await EmployeeBarcode.create({ employeeId: employee._id, code: requestedBarcode, format: 'barcode', isActive: true });
      } catch (err) {
        // Rollback employee if barcode creation failed (e.g., race condition)
        try { await Employee.findByIdAndDelete(employee._id); } catch {}
        if (err && err.code === 11000) {
          return res.status(409).json({ success: false, message: 'This barcode is already assigned to another employee' });
        }
        return res.status(500).json({ success: false, message: 'Failed to create employee barcode', error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
});

// Update employee
export const updateEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if employee ID is being changed and if it already exists
    if (req.body.employeeId && req.body.employeeId !== existingEmployee.employeeId) {
      const duplicateEmployee = await Employee.findOne({ 
        employeeId: req.body.employeeId,
        _id: { $ne: id }
      });
      if (duplicateEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }
    
    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
});

// Upload/update employee avatar
export const uploadEmployeeAvatar = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const subdir = req.uploadSubdirName || 'misc';
    const avatarUrl = `/uploads/employees/${subdir}/${req.file.filename}`;

    existingEmployee.avatar = avatarUrl;
    existingEmployee.updatedAt = Date.now();
    await existingEmployee.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: existingEmployee,
      avatar: existingEmployee.avatar
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
});

// Upload/update employee fingerprint image (placeholder - image only)
export const uploadEmployeeFingerprint = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const subdir = req.uploadSubdirName || 'misc';
    const fingerprintUrl = `/uploads/employees/${subdir}/${req.file.filename}`;

    existingEmployee.fingerprint = fingerprintUrl;
    existingEmployee.updatedAt = Date.now();
    await existingEmployee.save();

    res.status(200).json({
      success: true,
      message: 'Fingerprint uploaded successfully',
      data: existingEmployee,
      fingerprint: existingEmployee.fingerprint
    });
  } catch (error) {
    console.error('Error uploading fingerprint:', error);
    res.status(500).json({ success: false, message: 'Failed to upload fingerprint', error: error.message });
  }
});

// Create or update biometric template record (expects base64 template string)
export const saveEmployeeBiometric = asyncHandler(async (req, res) => {
  const { id } = req.params; // employee id
  const { type = 'fingerprint', format = 'unknown', templateBase64, iv, tag, deviceInfo } = req.body || {};
  const employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
  // templateBase64 is optional for device-auth-only records
  const size = templateBase64 ? Buffer.from(templateBase64, 'base64').length : 0;
  const rec = await EmployeeBiometric.create({ employeeId: id, type, format, dataEnc: templateBase64 || null, iv, tag, size, deviceInfo, verifiedAt: new Date() });
  try {
    employee.hasBiometric = true;
    employee.biometricType = type;
    employee.lastBiometricAt = new Date();
    await employee.save();
  } catch {}
  return res.status(201).json({ success: true, message: 'Biometric saved', data: { id: rec._id } });
});

// Delete employee
export const deleteEmployee = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// Get employee statistics
export const getEmployeeStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          inactiveEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || { totalEmployees: 0, activeEmployees: 0, inactiveEmployees: 0 },
        byDepartment: departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics',
      error: error.message
    });
  }
}); 