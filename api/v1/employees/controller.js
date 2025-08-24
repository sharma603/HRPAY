import mongoose from 'mongoose';
import Employee from '../../../models/Employee.js';
import EmployeeBarcode from '../../../models/EmployeeBarcode.js';
import Department from '../../../models/Department.js';
import Designation from '../../../models/Designation.js';
import Company from '../../../models/Company.js';
import SubDepartment from '../../../models/SubDepartment.js';
import path from 'path';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    console.log('=== GETTING EMPLOYEES ===');
    
    const employees = await Employee.find({})
      .select('-__v')
      .sort({ createdAt: -1 });
    
    // Fetch barcode data and resolve department/designation/company names for each employee
    const employeesWithBarcodes = await Promise.all(
      employees.map(async (employee) => {
        const barcode = await EmployeeBarcode.findOne({ 
          employeeId: employee._id, 
          isActive: true 
        }).select('code format');
        
        // Resolve department, designation, company, and subdepartment names
        let departmentName = 'No Department';
        let designationName = 'No Designation';
        let companyName = 'No Company';
        let subDepartmentName = 'No Sub-Department';
        
        if (employee.department) {
          try {
            const dept = await Department.findById(employee.department);
            departmentName = dept?.name || dept?.description || dept?.code || 'Unknown Department';
          } catch (err) {
            departmentName = 'Invalid Department';
          }
        }
        
        if (employee.designation) {
          try {
            const desig = await Designation.findById(employee.designation);
            designationName = desig?.name || desig?.description || desig?.code || 'Unknown Designation';
          } catch (err) {
            designationName = 'Invalid Designation';
          }
        }
        
        if (employee.company) {
          try {
            const comp = await Company.findById(employee.company);
            companyName = comp?.name || comp?.description || comp?.code || 'Unknown Company';
          } catch (err) {
            companyName = 'Invalid Company';
          }
        }
        
        if (employee.subDepartment) {
          try {
            const subDept = await SubDepartment.findById(employee.subDepartment);
            subDepartmentName = subDept?.name || subDept?.code || 'Unknown Sub-Department';
          } catch (err) {
            subDepartmentName = 'Invalid Sub-Department';
          }
        }
        
        if (employee.subDepartment) {
          try {
            const subDept = await SubDepartment.findById(employee.subDepartment);
            subDepartmentName = subDept?.name || subDept?.code || 'Unknown Sub-Department';
          } catch (err) {
            subDepartmentName = 'Invalid Sub-Department';
          }
        }
        
        return {
          ...employee.toObject(),
          barcode: barcode || null,
          department: { name: departmentName },
          designation: { name: designationName },
          company: { name: companyName },
          subDepartment: { name: subDepartmentName }
        };
      })
    );
    
    console.log(`Found ${employeesWithBarcodes.length} employees with barcode data`);
    
    return successResponse(res, employeesWithBarcodes, `Successfully retrieved ${employeesWithBarcodes.length} employees`);
  } catch (error) {
    console.error('Error getting employees:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEES_ERROR');
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting employee by ID:', id);
    
    const employee = await Employee.findById(id)
      .select('-__v');
    
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    // Fetch barcode data and resolve department/designation/company names for this employee
    const barcode = await EmployeeBarcode.findOne({ 
      employeeId: employee._id, 
      isActive: true 
    }).select('code format');
    
            // Resolve department, designation, company, and subdepartment names
        let departmentName = 'No Department';
        let designationName = 'No Designation';
        let companyName = 'No Company';
        let subDepartmentName = 'No Sub-Department';
    
    if (employee.department) {
      try {
        const dept = await Department.findById(employee.department);
        departmentName = dept?.name || dept?.description || dept?.code || 'Unknown Department';
      } catch (err) {
        departmentName = 'Invalid Department';
      }
    }
    
    if (employee.designation) {
      try {
        const desig = await Designation.findById(employee.designation);
        designationName = desig?.name || desig?.description || desig?.code || 'Unknown Designation';
      } catch (err) {
        designationName = 'Invalid Designation';
      }
    }
    
    if (employee.company) {
      try {
        const comp = await Company.findById(employee.company);
        companyName = comp?.name || comp?.description || comp?.code || 'Unknown Company';
      } catch (err) {
        companyName = 'Invalid Company';
      }
    }
    
            const employeeWithBarcode = {
          ...employee.toObject(),
          barcode: barcode || null,
          department: { name: departmentName },
          designation: { name: designationName },
          company: { name: companyName },
          subDepartment: { name: subDepartmentName }
        };
    
    return successResponse(res, employeeWithBarcode, 'Employee retrieved successfully');
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_ERROR');
  }
};

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    console.log('=== CREATING EMPLOYEE ===');
    console.log('Request body:', req.body);
    console.log('User info:', req.user);
    console.log('Auth headers:', req.headers.authorization);
    
    const {
      employeeId,
      name,
      title,
      email,
      phone,
      nationality,
      department,
      designation,
      location,
      company,
      employer,
      joinDate,
      salary,
      status,
      personalInfo,
      workInfo,
      shift,
      shiftStart,
      barcode,
      subDepartment
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !name || !email || !department || !designation) {
      return badRequestResponse(res, 'Employee ID, name, email, department, and designation are required');
    }
    
    // Validate that department, designation, and company are not MongoDB ObjectIds
    // They should be actual names, not IDs
    if (department && department.length === 24 && /^[0-9a-fA-F]{24}$/.test(department)) {
      return badRequestResponse(res, 'Department must be a name, not an ID');
    }
    if (designation && designation.length === 24 && /^[0-9a-fA-F]{24}$/.test(designation)) {
      return badRequestResponse(res, 'Designation must be a name, not an ID');
    }
    if (company && company.length === 24 && /^[0-9a-fA-F]{24}$/.test(company)) {
      return badRequestResponse(res, 'Company must be a name, not an ID');
    }
    
    // Validate subdepartment if provided - it should be a valid ObjectId
    if (subDepartment && (!mongoose.Types.ObjectId.isValid(subDepartment))) {
      return badRequestResponse(res, 'Invalid subdepartment ID format');
    }
    
    // Check if employee with same email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      return badRequestResponse(res, 'Employee with this email already exists');
    }
    
    // Check if employee with same employeeId already exists
    const existingEmployeeId = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existingEmployeeId) {
      return badRequestResponse(res, 'Employee with this ID already exists');
    }
    
    const employeeData = {
      employeeId: employeeId.trim(),
      title: title?.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      nationality: nationality?.trim(),
      department: department.trim(),
      designation: designation.trim(),
      joinDate: joinDate || new Date(),
      salary: salary || 0,
      status: status || 'active',
      personalInfo: {
        ...personalInfo,
        dateOfBirth: personalInfo?.dateOfBirth || null
      },
      workInfo: {
        ...workInfo,
        location: location?.trim(),
        shift: shift?.trim(),
        shiftStart: shiftStart ? new Date(shiftStart) : null
      },
      company: company?.trim(),
      employer: employer?.trim(),
      subDepartment: subDepartment || null,
      createdBy: req.user?.id || 'system' // From auth middleware or use system as fallback
    };
    
    console.log('Creating employee with data:', employeeData);
    
    const employee = new Employee(employeeData);
    await employee.save();
    
    console.log('Employee created successfully:', employee._id);
    
    // Handle barcode creation if provided
    if (barcode && barcode.trim()) {
      try {
        console.log('Creating barcode for employee:', barcode);
        
        // Check if barcode already exists
        const existingBarcode = await EmployeeBarcode.findOne({ code: barcode.trim() });
        if (existingBarcode) {
          console.warn('Barcode already exists, removing from employee creation response');
          // Remove the employee since barcode creation failed
          await Employee.findByIdAndDelete(employee._id);
          return badRequestResponse(res, 'Barcode code already exists');
        }
        
        // Create barcode record
        const barcodeData = {
          employeeId: employee._id,
          code: barcode.trim(),
          format: 'CODE128', // Default format
          description: `Barcode for ${employee.name}`,
          isActive: true
        };
        
        const employeeBarcode = new EmployeeBarcode(barcodeData);
        await employeeBarcode.save();
        
        console.log('Barcode created successfully for employee:', employee._id);
      } catch (barcodeError) {
        console.error('Error creating barcode:', barcodeError);
        // Remove the employee since barcode creation failed
        await Employee.findByIdAndDelete(employee._id);
        return errorResponse(res, 'Failed to create barcode for employee', 'BARCODE_CREATION_ERROR');
      }
    }
    
    const { __v, ...employeeWithoutVersion } = employee.toObject();
    
    return createdResponse(res, employeeWithoutVersion, 'Employee created successfully');
  } catch (error) {
    console.error('Error creating employee:', error);
    return errorResponse(res, error.message, 'CREATE_EMPLOYEE_ERROR');
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating employee:', id);
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.employeeId;
    delete updateData.createdAt;
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    return successResponse(res, updatedEmployee, 'Employee updated successfully');
  } catch (error) {
    console.error('Error updating employee:', error);
    return errorResponse(res, error.message, 'UPDATE_EMPLOYEE_ERROR');
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting employee:', id);
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    await Employee.findByIdAndDelete(id);
    
    return successResponse(res, null, 'Employee deleted successfully');
  } catch (error) {
    console.error('Error deleting employee:', error);
    return errorResponse(res, error.message, 'DELETE_EMPLOYEE_ERROR');
  }
};

// Upload employee avatar
export const uploadEmployeeAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== UPLOADING EMPLOYEE AVATAR ===');
    console.log('Employee ID:', id);
    console.log('File info:', req.file);
    console.log('Request headers:', req.headers);
    
    if (!req.file) {
      console.log('No file uploaded');
      return badRequestResponse(res, 'No file uploaded');
    }
    
    const employee = await Employee.findById(id);
    if (!employee) {
      console.log('Employee not found:', id);
      return notFoundResponse(res, 'Employee not found');
    }
    
    console.log('Found employee:', employee.name);
    
    // Clean up old avatar file if it exists
    if (employee.avatar && employee.avatar.filename) {
      try {
        const oldAvatarPath = path.join(process.cwd(), 'uploads', employee.avatar.path);
        if (require('fs').existsSync(oldAvatarPath)) {
          require('fs').unlinkSync(oldAvatarPath);
          console.log('Deleted old avatar:', oldAvatarPath);
        }
      } catch (cleanupError) {
        console.warn('Could not delete old avatar:', cleanupError.message);
      }
    }
    
    // Move file from temp directory to employee-specific folder
    const employeeName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
    const employeeDir = path.join(process.cwd(), 'uploads', 'employees', employeeName);
    const finalPath = path.join(employeeDir, req.file.filename);
    
    // Create employee directory if it doesn't exist
    require('fs').mkdirSync(employeeDir, { recursive: true });
    
    // Move the file
    require('fs').renameSync(req.file.path, finalPath);
    console.log('File moved from temp to:', finalPath);
    
    // Update avatar information
    const relativePath = `/employees/${employeeName}/${req.file.filename}`;
    const avatarUrl = `http://localhost:4000/uploads${relativePath}`;
    
    employee.avatar = {
      url: avatarUrl,
      filename: req.file.filename,
      path: relativePath
    };
    
    console.log('Saving avatar info:', employee.avatar);
    await employee.save();
    
    console.log('Avatar uploaded successfully for employee:', employee.name);
    
    return successResponse(res, employee.avatar, 'Avatar uploaded successfully');
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return errorResponse(res, error.message, 'UPLOAD_AVATAR_ERROR');
  }
};

// Get employee avatars
export const getEmployeeAvatars = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting avatars for employee:', id);
    
    const employee = await Employee.findById(id).select('name avatar');
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    // Get all files in employee's avatar folder
    const employeeName = employee.name.replace(/[^a-zA2-9]/g, '_');
    const avatarDir = path.join(process.cwd(), 'uploads', 'employees', employeeName);
    
    let avatars = [];
    try {
      if (require('fs').existsSync(avatarDir)) {
        const files = require('fs').readdirSync(avatarDir);
        avatars = files.map(filename => ({
          filename,
          url: `http://localhost:4000/uploads/employees/${employeeName}/${filename}`,
          path: `/employees/${employeeName}/${filename}`
        }));
      }
    } catch (dirError) {
      console.warn('Could not read avatar directory:', dirError.message);
    }
    
    return successResponse(res, {
      employee: employee.name,
      currentAvatar: employee.avatar,
      allAvatars: avatars
    }, 'Employee avatars retrieved successfully');
  } catch (error) {
    console.error('Error getting employee avatars:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_AVATARS_ERROR');
  }
};

// Remove employee avatar
export const removeEmployeeAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== REMOVING EMPLOYEE AVATAR ===');
    console.log('Employee ID:', id);
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    console.log('Found employee:', employee.name);
    
    // Remove avatar file if it exists
    if (employee.avatar && employee.avatar.filename) {
      try {
        const employeeName = employee.name.replace(/[^a-zA-Z0-9]/g, '_');
        const avatarPath = path.join(process.cwd(), 'uploads', 'employees', employeeName, employee.avatar.filename);
        
        if (require('fs').existsSync(avatarPath)) {
          require('fs').unlinkSync(avatarPath);
          console.log('Deleted avatar file:', avatarPath);
        }
      } catch (cleanupError) {
        console.warn('Could not delete avatar file:', cleanupError.message);
      }
    }
    
    // Clear avatar information from employee record
    employee.avatar = undefined;
    await employee.save();
    
    console.log('Avatar removed successfully for employee:', employee.name);
    
    return successResponse(res, null, 'Avatar removed successfully');
  } catch (error) {
    console.error('Error removing avatar:', error);
    return errorResponse(res, error.message, 'REMOVE_AVATAR_ERROR');
  }
};

// Check if barcode exists
export const checkBarcodeExists = async (req, res) => {
  try {
    const { code } = req.query;
    console.log('Checking if barcode exists:', code);
    
    if (!code) {
      return badRequestResponse(res, 'Barcode code is required');
    }
    
    const barcode = await EmployeeBarcode.findOne({ 
      code: code.trim(),
      isActive: true 
    }).populate('employeeId', 'name employeeId');
    
    const exists = !!barcode;
    
    return successResponse(res, {
      exists,
      barcode: exists ? barcode : null,
      employee: exists ? barcode.employeeId : null
    }, `Barcode ${exists ? 'exists' : 'does not exist'}`);
  } catch (error) {
    console.error('Error checking barcode existence:', error);
    return errorResponse(res, error.message, 'CHECK_BARCODE_ERROR');
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    console.log('Getting employee statistics');
    
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          terminatedEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'terminated'] }, 1, 0] }
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
    
    const result = {
      overall: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        terminatedEmployees: 0
      },
      byDepartment: departmentStats
    };
    
    return successResponse(res, result, 'Employee statistics retrieved successfully');
  } catch (error) {
    console.error('Error getting employee stats:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_STATS_ERROR');
  }
};
