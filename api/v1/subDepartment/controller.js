import SubDepartment from '../../../models/SubDepartment.js';
import Department from '../../../models/Department.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all sub-departments
export const getSubDepartments = async (req, res) => {
  try {
    console.log('=== GETTING SUB-DEPARTMENTS ===');
    
    const { 
      search, 
      isActive, 
      parentDepartment,
      division,
      company,
      type,
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
      // Validate parent department exists
      const parentDept = await Department.findById(parentDepartment);
      if (!parentDept) {
        return badRequestResponse(res, 'Parent department not found');
      }
      query.parentDepartment = parentDepartment;
    }

    if (division) {
      query.division = division;
    }

    if (company) {
      query.company = company;
    }

    if (type) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and population
    const subDepartments = await SubDepartment.find(query)
      .populate('parentDepartment', 'name code')
      .populate('division', 'name code')
      .populate('company', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await SubDepartment.countDocuments(query);

    console.log(`Found ${subDepartments.length} sub-departments out of ${total} total`);
    
    return successResponse(res, {
      subDepartments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, `Successfully retrieved ${subDepartments.length} sub-departments`);
    
  } catch (error) {
    console.error('Error getting sub-departments:', error);
    return errorResponse(res, error.message, 'GET_SUB_DEPARTMENTS_ERROR');
  }
};

// Get sub-department by ID
export const getSubDepartmentById = async (req, res) => {
  try {
    console.log('=== GETTING SUB-DEPARTMENT BY ID ===');
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return badRequestResponse(res, 'Sub-department ID is required');
    }
    
    const subDepartment = await SubDepartment.findById(id)
      .populate('parentDepartment', 'name code')
      .populate('division', 'name code')
      .populate('company', 'name code')
      .select('-__v');
    
    if (!subDepartment) {
      return notFoundResponse(res, 'Sub-department not found');
    }
    
    console.log(`Found sub-department: ${subDepartment.name}`);
    return successResponse(res, subDepartment, 'Sub-department retrieved successfully');
    
  } catch (error) {
    console.error('Error getting sub-department by ID:', error);
    if (error.name === 'CastError') {
      return badRequestResponse(res, 'Invalid sub-department ID format');
    }
    return errorResponse(res, error.message, 'GET_SUB_DEPARTMENT_BY_ID_ERROR');
  }
};

// Create new sub-department
export const createSubDepartment = async (req, res) => {
  try {
    console.log('=== CREATING SUB-DEPARTMENT ===');
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
      parentDepartment, 
      division, 
      company, 
      type, 
      specialization 
    } = req.body;
    
    // Additional validation
    if (!code || !name || !parentDepartment) {
      return badRequestResponse(res, 'Sub-department code, name, and parent department are required');
    }
    
    // Validate parent department exists
    const parentDept = await Department.findById(parentDepartment);
    if (!parentDept) {
      return badRequestResponse(res, 'Parent department not found');
    }
    
    // Check if sub-department code already exists
    const existingSubDepartment = await SubDepartment.findOne({ code: code.trim().toUpperCase() });
    if (existingSubDepartment) {
      return badRequestResponse(res, 'Sub-department with this code already exists');
    }
    
    // Create sub-department
    const subDepartment = new SubDepartment({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || '',
      erpCode: erpCode?.trim() || '',
      isActive: isActive !== false,
      manager: manager?.trim() || '',
      location: location?.trim() || '',
      budget: budget?.trim() || '',
      employeeCount: parseInt(employeeCount) || 0,
      parentDepartment: parentDepartment,
      division: division || null,
      company: company || null,
      type: type?.trim() || 'Team',
      specialization: specialization?.trim() || '',
      createdBy: req.user.id
    });
    
    await subDepartment.save();
    await subDepartment.populate('parentDepartment', 'name code');
    await subDepartment.populate('division', 'name code');
    await subDepartment.populate('company', 'name code');
    
    console.log(`Sub-department created: ${subDepartment.name} (${subDepartment.code})`);
    return createdResponse(res, subDepartment, 'Sub-department created successfully');
    
  } catch (error) {
    console.error('Error creating sub-department:', error);
    if (error.name === 'ValidationError') {
      return badRequestResponse(res, `Validation error: ${error.message}`);
    }
    if (error.code === 11000) {
      return badRequestResponse(res, 'Sub-department with this code already exists');
    }
    return errorResponse(res, error.message, 'CREATE_SUB_DEPARTMENT_ERROR');
  }
};

// Update sub-department
export const updateSubDepartment = async (req, res) => {
  try {
    console.log('=== UPDATING SUB-DEPARTMENT ===');
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
      parentDepartment, 
      division, 
      company, 
      type, 
      specialization 
    } = req.body;
    
    // Find sub-department
    const subDepartment = await SubDepartment.findById(id);
    if (!subDepartment) {
      return notFoundResponse(res, 'Sub-department not found');
    }
    
    // Additional validation
    if (!code || !name || !parentDepartment) {
      return badRequestResponse(res, 'Sub-department code, name, and parent department are required');
    }
    
    // Validate parent department exists
    const parentDept = await Department.findById(parentDepartment);
    if (!parentDept) {
      return badRequestResponse(res, 'Parent department not found');
    }
    
    // Check if new code conflicts with existing sub-department (excluding current one)
    if (code.trim().toUpperCase() !== subDepartment.code) {
      const existingSubDepartment = await SubDepartment.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingSubDepartment) {
        return badRequestResponse(res, 'Sub-department with this code already exists');
      }
    }
    
    // Update sub-department
    subDepartment.code = code.trim().toUpperCase();
    subDepartment.name = name.trim();
    subDepartment.description = description?.trim() || '';
    subDepartment.erpCode = erpCode?.trim() || '';
    subDepartment.isActive = isActive !== false;
    subDepartment.manager = manager?.trim() || '';
    subDepartment.location = location?.trim() || '';
    subDepartment.budget = budget?.trim() || '';
    subDepartment.employeeCount = parseInt(employeeCount) || 0;
    subDepartment.parentDepartment = parentDepartment;
    subDepartment.division = division || null;
    subDepartment.company = company || null;
    subDepartment.type = type?.trim() || 'Team';
    subDepartment.specialization = specialization?.trim() || '';
    subDepartment.updatedBy = req.user.id;
    
    await subDepartment.save();
    await subDepartment.populate('parentDepartment', 'name code');
    await subDepartment.populate('division', 'name code');
    await subDepartment.populate('company', 'name code');
    
    console.log(`Sub-department updated: ${subDepartment.name} (${subDepartment.code})`);
    return successResponse(res, subDepartment, 'Sub-department updated successfully');
    
  } catch (error) {
    console.error('Error updating sub-department:', error);
    if (error.name === 'ValidationError') {
      return badRequestResponse(res, `Validation error: ${error.message}`);
    }
    if (error.code === 11000) {
      return badRequestResponse(res, 'Sub-department with this code already exists');
    }
    return errorResponse(res, error.message, 'UPDATE_SUB_DEPARTMENT_ERROR');
  }
};

// Delete sub-department
export const deleteSubDepartment = async (req, res) => {
  try {
    console.log('=== DELETING SUB-DEPARTMENT ===');
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return badRequestResponse(res, 'Sub-department ID is required');
    }
    
    // Find sub-department
    const subDepartment = await SubDepartment.findById(id);
    if (!subDepartment) {
      return notFoundResponse(res, 'Sub-department not found');
    }
    
    // Check if sub-department has employees (you might want to add this check later)
    // const employeeCount = await Employee.countDocuments({ subDepartment: id });
    // if (employeeCount > 0) {
    //   return badRequestResponse(res, `Cannot delete sub-department with ${employeeCount} employees. Please reassign employees first.`);
    // }
    
    await SubDepartment.findByIdAndDelete(id);
    
    console.log(`Sub-department deleted: ${subDepartment.name} (${subDepartment.code})`);
    return successResponse(res, null, 'Sub-department deleted successfully');
    
  } catch (error) {
    console.error('Error deleting sub-department:', error);
    if (error.name === 'CastError') {
      return badRequestResponse(res, 'Invalid sub-department ID format');
    }
    return errorResponse(res, error.message, 'DELETE_SUB_DEPARTMENT_ERROR');
  }
};

// Toggle sub-department status
export const toggleSubDepartmentStatus = async (req, res) => {
  try {
    console.log('=== TOGGLING SUB-DEPARTMENT STATUS ===');
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return badRequestResponse(res, 'Sub-department ID is required');
    }
    
    const subDepartment = await SubDepartment.findById(id);
    if (!subDepartment) {
      return notFoundResponse(res, 'Sub-department not found');
    }
    
    subDepartment.isActive = !subDepartment.isActive;
    subDepartment.updatedBy = req.user.id;
    await subDepartment.save();
    
    const status = subDepartment.isActive ? 'activated' : 'deactivated';
    console.log(`Sub-department ${status}: ${subDepartment.name} (${subDepartment.code})`);
    
    return successResponse(res, subDepartment, `Sub-department ${status} successfully`);
    
  } catch (error) {
    console.error('Error toggling sub-department status:', error);
    if (error.name === 'CastError') {
      return badRequestResponse(res, 'Invalid sub-department ID format');
    }
    return errorResponse(res, error.message, 'TOGGLE_SUB_DEPARTMENT_STATUS_ERROR');
  }
};

// Get sub-department statistics
export const getSubDepartmentStats = async (req, res) => {
  try {
    console.log('=== GETTING SUB-DEPARTMENT STATS ===');
    
    const stats = await SubDepartment.aggregate([
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
    
    console.log(`Sub-department stats: ${result.total} total, ${result.active} active, ${result.inactive} inactive`);
    return successResponse(res, result, 'Sub-department statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting sub-department stats:', error);
    return errorResponse(res, error.message, 'GET_SUB_DEPARTMENT_STATS_ERROR');
  }
};

// Get active sub-departments for dropdown (active only)
export const getActiveSubDepartments = async (req, res) => {
  try {
    console.log('=== GETTING ACTIVE SUB-DEPARTMENTS FOR DROPDOWN ===');
    
    const subDepartments = await SubDepartment.find({ isActive: true })
      .select('_id code name')
      .populate('parentDepartment', 'name')
      .populate('division', 'name')
      .sort({ name: 1 });

    console.log(`Found ${subDepartments.length} active sub-departments for dropdown`);
    return successResponse(res, subDepartments, 'Active sub-departments retrieved successfully');
    
  } catch (error) {
    console.error('Error getting active sub-departments:', error);
    return errorResponse(res, error.message, 'GET_ACTIVE_SUB_DEPARTMENTS_ERROR');
  }
};
