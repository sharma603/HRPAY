import Designation from '../../../models/Designation.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all designations
export const getDesignations = async (req, res) => {
  try {
    console.log('=== GETTING DESIGNATIONS ===');
    
    const { 
      search, 
      isActive, 
      department,
      level,
      sortBy = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (department) {
      query.department = department;
    }

    if (level) {
      query.level = level;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and population
    const designations = await Designation.find(query)
      .populate('department', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Designation.countDocuments(query);

    console.log(`Found ${designations.length} designations out of ${total} total`);
    
    return successResponse(res, {
      designations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, `Successfully retrieved ${designations.length} designations`);
    
  } catch (error) {
    console.error('Error getting designations:', error);
    return errorResponse(res, error.message, 'GET_DESIGNATIONS_ERROR');
  }
};

// Get designation by ID
export const getDesignationById = async (req, res) => {
  try {
    console.log('=== GETTING DESIGNATION BY ID ===');
    const { id } = req.params;
    
    const designation = await Designation.findById(id)
      .populate('department', 'name code')
      .select('-__v');
    
    if (!designation) {
      return notFoundResponse(res, 'Designation not found');
    }
    
    console.log(`Found designation: ${designation.title}`);
    return successResponse(res, designation, 'Designation retrieved successfully');
    
  } catch (error) {
    console.error('Error getting designation by ID:', error);
    return errorResponse(res, error.message, 'GET_DESIGNATION_BY_ID_ERROR');
  }
};

// Create new designation
export const createDesignation = async (req, res) => {
  try {
    console.log('=== CREATING DESIGNATION ===');
    const { 
      code, 
      title, 
      description, 
      erpCode, 
      isActive, 
      level, 
      department, 
      minSalary, 
      maxSalary, 
      requiredSkills 
    } = req.body;
    
    // Validation
    if (!code || !title) {
      return badRequestResponse(res, 'Designation code and title are required');
    }
    
    // Check if designation code already exists
    const existingDesignation = await Designation.findOne({ code: code.trim().toUpperCase() });
    if (existingDesignation) {
      return badRequestResponse(res, 'Designation with this code already exists');
    }
    
    // Create designation
    const designation = new Designation({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description?.trim() || '',
      erpCode: erpCode?.trim() || '',
      isActive: isActive !== false,
      level: level?.trim() || '',
      department: department || null,
      minSalary: parseInt(minSalary) || 0,
      maxSalary: parseInt(maxSalary) || 0,
      requiredSkills: requiredSkills || [],
      createdBy: req.user.id
    });
    
    await designation.save();
    await designation.populate('department', 'name code');
    
    console.log(`Designation created: ${designation.title} (${designation.code})`);
    return createdResponse(res, designation, 'Designation created successfully');
    
  } catch (error) {
    console.error('Error creating designation:', error);
    return errorResponse(res, error.message, 'CREATE_DESIGNATION_ERROR');
  }
};

// Update designation
export const updateDesignation = async (req, res) => {
  try {
    console.log('=== UPDATING DESIGNATION ===');
    const { id } = req.params;
    const { 
      code, 
      title, 
      description, 
      erpCode, 
      isActive, 
      level, 
      department, 
      minSalary, 
      maxSalary, 
      requiredSkills 
    } = req.body;
    
    // Find designation
    const designation = await Designation.findById(id);
    if (!designation) {
      return notFoundResponse(res, 'Designation not found');
    }
    
    // Validation
    if (!code || !title) {
      return badRequestResponse(res, 'Designation code and title are required');
    }
    
    // Check if new code conflicts with existing designation (excluding current one)
    if (code.trim().toUpperCase() !== designation.code) {
      const existingDesignation = await Designation.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDesignation) {
        return badRequestResponse(res, 'Designation with this code already exists');
      }
    }
    
    // Update designation
    designation.code = code.trim().toUpperCase();
    designation.title = title.trim();
    designation.description = description?.trim() || '';
    designation.erpCode = erpCode?.trim() || '';
    designation.isActive = isActive !== false;
    designation.level = level?.trim() || '';
    designation.department = department || null;
    designation.minSalary = parseInt(minSalary) || 0;
    designation.maxSalary = parseInt(maxSalary) || 0;
    designation.requiredSkills = requiredSkills || [];
    designation.updatedBy = req.user.id;
    
    await designation.save();
    await designation.populate('department', 'name code');
    
    console.log(`Designation updated: ${designation.title} (${designation.code})`);
    return successResponse(res, designation, 'Designation updated successfully');
    
  } catch (error) {
    console.error('Error updating designation:', error);
    return errorResponse(res, error.message, 'UPDATE_DESIGNATION_ERROR');
  }
};

// Delete designation
export const deleteDesignation = async (req, res) => {
  try {
    console.log('=== DELETING DESIGNATION ===');
    const { id } = req.params;
    
    // Find designation
    const designation = await Designation.findById(id);
    if (!designation) {
      return notFoundResponse(res, 'Designation not found');
    }
    
    // Check if designation has employees (you might want to add this check later)
    // const employeeCount = await Employee.countDocuments({ designation: id });
    // if (employeeCount > 0) {
    //   return badRequestResponse(res, `Cannot delete designation with ${employeeCount} employees. Please reassign employees first.`);
    // }
    
    await Designation.findByIdAndDelete(id);
    
    console.log(`Designation deleted: ${designation.title} (${designation.code})`);
    return successResponse(res, null, 'Designation deleted successfully');
    
  } catch (error) {
    console.error('Error deleting designation:', error);
    return errorResponse(res, error.message, 'DELETE_DESIGNATION_ERROR');
  }
};

// Toggle designation status
export const toggleDesignationStatus = async (req, res) => {
  try {
    console.log('=== TOGGLING DESIGNATION STATUS ===');
    const { id } = req.params;
    
    const designation = await Designation.findById(id);
    if (!designation) {
      return notFoundResponse(res, 'Designation not found');
    }
    
    designation.isActive = !designation.isActive;
    designation.updatedBy = req.user.id;
    await designation.save();
    
    const status = designation.isActive ? 'activated' : 'deactivated';
    console.log(`Designation ${status}: ${designation.title} (${designation.code})`);
    
    return successResponse(res, designation, `Designation ${status} successfully`);
    
  } catch (error) {
    console.error('Error toggling designation status:', error);
    return errorResponse(res, error.message, 'TOGGLE_DESIGNATION_STATUS_ERROR');
  }
};

// Get designation statistics
export const getDesignationStats = async (req, res) => {
  try {
    console.log('=== GETTING DESIGNATION STATS ===');
    
    const stats = await Designation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          withDepartment: { $sum: { $cond: ['$department', 1, 0] } },
          withoutDepartment: { $sum: { $cond: ['$department', 0, 1] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, inactive: 0, withDepartment: 0, withoutDepartment: 0 };
    
    console.log(`Designation stats: ${result.total} total, ${result.active} active, ${result.inactive} inactive`);
    return successResponse(res, result, 'Designation statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting designation stats:', error);
    return errorResponse(res, error.message, 'GET_DESIGNATION_STATS_ERROR');
  }
};

// Get active designations for dropdown (active only)
export const getActiveDesignations = async (req, res) => {
  try {
    console.log('=== GETTING ACTIVE DESIGNATIONS FOR DROPDOWN ===');
    
    const designations = await Designation.find({ isActive: true })
      .select('_id code title')
      .populate('department', 'name')
      .sort({ title: 1 });

    console.log(`Found ${designations.length} active designations for dropdown`);
    return successResponse(res, designations, 'Active designations retrieved successfully');
    
  } catch (error) {
    console.error('Error getting active designations:', error);
    return errorResponse(res, error.message, 'GET_ACTIVE_DESIGNATIONS_ERROR');
  }
};
