import Department from '../../../models/Department.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    console.log('=== GETTING DEPARTMENTS ===');
    
    const { 
      search, 
      isActive, 
      parentDepartment,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (parentDepartment) {
      query.parentDepartment = parentDepartment;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and population
    const departments = await Department.find(query)
      .populate('parentDepartment', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Department.countDocuments(query);

    console.log(`Found ${departments.length} departments out of ${total} total`);
    
    return successResponse(res, {
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, `Successfully retrieved ${departments.length} departments`);
    
  } catch (error) {
    console.error('Error getting departments:', error);
    return errorResponse(res, error.message, 'GET_DEPARTMENTS_ERROR');
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    console.log('=== GETTING DEPARTMENT BY ID ===');
    const { id } = req.params;
    
    const department = await Department.findById(id)
      .populate('parentDepartment', 'name code')
      .select('-__v');
    
    if (!department) {
      return notFoundResponse(res, 'Department not found');
    }
    
    console.log(`Found department: ${department.name}`);
    return successResponse(res, department, 'Department retrieved successfully');
    
  } catch (error) {
    console.error('Error getting department by ID:', error);
    return errorResponse(res, error.message, 'GET_DEPARTMENT_BY_ID_ERROR');
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    console.log('=== CREATING DEPARTMENT ===');
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      manager, 
      location, 
      budget, 
      employeeCount, 
      parentDepartment 
    } = req.body;
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Department code and name are required');
    }
    
    // Check if department code already exists
    const existingDepartment = await Department.findOne({ code: code.trim().toUpperCase() });
    if (existingDepartment) {
      return badRequestResponse(res, 'Department with this code already exists');
    }
    
    // Create department
    const department = new Department({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || '',
      erpCode: erpCode?.trim() || '',
      isActive: isActive !== false,
      manager: manager?.trim() || '',
      location: location?.trim() || '',
      budget: budget?.trim() || '',
      employeeCount: parseInt(employeeCount) || 0,
      parentDepartment: parentDepartment || null,
      createdBy: req.user.id
    });
    
    await department.save();
    await department.populate('parentDepartment', 'name code');
    
    console.log(`Department created: ${department.name} (${department.code})`);
    return createdResponse(res, department, 'Department created successfully');
    
  } catch (error) {
    console.error('Error creating department:', error);
    return errorResponse(res, error.message, 'CREATE_DEPARTMENT_ERROR');
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    console.log('=== UPDATING DEPARTMENT ===');
    const { id } = req.params;
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      manager, 
      location, 
      budget, 
      employeeCount, 
      parentDepartment 
    } = req.body;
    
    // Find department
    const department = await Department.findById(id);
    if (!department) {
      return notFoundResponse(res, 'Department not found');
    }
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Department code and name are required');
    }
    
    // Check if new code conflicts with existing department (excluding current one)
    if (code.trim().toUpperCase() !== department.code) {
      const existingDepartment = await Department.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDepartment) {
        return badRequestResponse(res, 'Department with this code already exists');
      }
    }
    
    // Update department
    department.code = code.trim().toUpperCase();
    department.name = name.trim();
    department.description = description?.trim() || '';
    department.erpCode = erpCode?.trim() || '';
    department.isActive = isActive !== false;
    department.manager = manager?.trim() || '';
    department.location = location?.trim() || '';
    department.budget = budget?.trim() || '';
    department.employeeCount = parseInt(employeeCount) || 0;
    department.parentDepartment = parentDepartment || null;
    department.updatedBy = req.user.id;
    
    await department.save();
    await department.populate('parentDepartment', 'name code');
    
    console.log(`Department updated: ${department.name} (${department.code})`);
    return successResponse(res, department, 'Department updated successfully');
    
  } catch (error) {
    console.error('Error updating department:', error);
    return errorResponse(res, error.message, 'UPDATE_DEPARTMENT_ERROR');
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    console.log('=== DELETING DEPARTMENT ===');
    const { id } = req.params;
    
    // Find department
    const department = await Department.findById(id);
    if (!department) {
      return notFoundResponse(res, 'Department not found');
    }
    
    // Check if department has child departments
    const childDepartments = await Department.findOne({ parentDepartment: id });
    if (childDepartments) {
      return badRequestResponse(res, 'Cannot delete department with child departments. Please reassign or delete child departments first.');
    }
    
    // Check if department has employees (you might want to add this check later)
    // const employeeCount = await Employee.countDocuments({ department: id });
    // if (employeeCount > 0) {
    //   return badRequestResponse(res, `Cannot delete department with ${employeeCount} employees. Please reassign employees first.`);
    // }
    
    await Department.findByIdAndDelete(id);
    
    console.log(`Department deleted: ${department.name} (${department.code})`);
    return successResponse(res, null, 'Department deleted successfully');
    
  } catch (error) {
    console.error('Error deleting department:', error);
    return errorResponse(res, error.message, 'DELETE_DEPARTMENT_ERROR');
  }
};

// Toggle department status
export const toggleDepartmentStatus = async (req, res) => {
  try {
    console.log('=== TOGGLING DEPARTMENT STATUS ===');
    const { id } = req.params;
    
    const department = await Department.findById(id);
    if (!department) {
      return notFoundResponse(res, 'Department not found');
    }
    
    department.isActive = !department.isActive;
    department.updatedBy = req.user.id;
    await department.save();
    
    const status = department.isActive ? 'activated' : 'deactivated';
    console.log(`Department ${status}: ${department.name} (${department.code})`);
    
    return successResponse(res, department, `Department ${status} successfully`);
    
  } catch (error) {
    console.error('Error toggling department status:', error);
    return errorResponse(res, error.message, 'TOGGLE_DEPARTMENT_STATUS_ERROR');
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    console.log('=== GETTING DEPARTMENT STATS ===');
    
    const stats = await Department.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          withParent: { $sum: { $cond: ['$parentDepartment', 1, 0] } },
          withoutParent: { $sum: { $cond: ['$parentDepartment', 0, 1] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, inactive: 0, withParent: 0, withoutParent: 0 };
    
    console.log(`Department stats: ${result.total} total, ${result.active} active, ${result.inactive} inactive`);
    return successResponse(res, result, 'Department statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting department stats:', error);
    return errorResponse(res, error.message, 'GET_DEPARTMENT_STATS_ERROR');
  }
};

// Get active departments for dropdown (active only)
export const getActiveDepartments = async (req, res) => {
  try {
    console.log('=== GETTING ACTIVE DEPARTMENTS FOR DROPDOWN ===');
    
    const departments = await Department.find({ isActive: true })
      .select('_id code name')
      .sort({ name: 1 });

    console.log(`Found ${departments.length} active departments for dropdown`);
    return successResponse(res, departments, 'Active departments retrieved successfully');
    
  } catch (error) {
    console.error('Error getting active departments:', error);
    return errorResponse(res, error.message, 'GET_ACTIVE_DEPARTMENTS_ERROR');
  }
};
