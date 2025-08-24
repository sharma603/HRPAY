import Division from '../../../models/Division.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all divisions
export const getDivisions = async (req, res) => {
  try {
    console.log('=== GETTING DIVISIONS ===');
    
    const { 
      search, 
      isActive, 
      parentDivision,
      company,
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
    
    if (parentDivision) {
      query.parentDivision = parentDivision;
    }

    if (company) {
      query.company = company;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and population
    const divisions = await Division.find(query)
      .populate('parentDivision', 'name code')
      .populate('company', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Division.countDocuments(query);

    console.log(`Found ${divisions.length} divisions out of ${total} total`);
    
    return successResponse(res, {
      divisions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, `Successfully retrieved ${divisions.length} divisions`);
    
  } catch (error) {
    console.error('Error getting divisions:', error);
    return errorResponse(res, error.message, 'GET_DIVISIONS_ERROR');
  }
};

// Get division by ID
export const getDivisionById = async (req, res) => {
  try {
    console.log('=== GETTING DIVISION BY ID ===');
    const { id } = req.params;
    
    const division = await Division.findById(id)
      .populate('parentDivision', 'name code')
      .populate('company', 'name code')
      .select('-__v');
    
    if (!division) {
      return notFoundResponse(res, 'Division not found');
    }
    
    console.log(`Found division: ${division.name}`);
    return successResponse(res, division, 'Division retrieved successfully');
    
  } catch (error) {
    console.error('Error getting division by ID:', error);
    return errorResponse(res, error.message, 'GET_DIVISION_BY_ID_ERROR');
  }
};

// Create new division
export const createDivision = async (req, res) => {
  try {
    console.log('=== CREATING DIVISION ===');
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      divisionHead, 
      location, 
      budget, 
      employeeCount, 
      parentDivision,
      company 
    } = req.body;
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Division code and name are required');
    }
    
    // Check if division code already exists
    const existingDivision = await Division.findOne({ code: code.trim().toUpperCase() });
    if (existingDivision) {
      return badRequestResponse(res, 'Division with this code already exists');
    }
    
    // Create division
    const division = new Division({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || '',
      erpCode: erpCode?.trim() || '',
      isActive: isActive !== false,
      divisionHead: divisionHead?.trim() || '',
      location: location?.trim() || '',
      budget: budget?.trim() || '',
      employeeCount: parseInt(employeeCount) || 0,
      parentDivision: parentDivision || null,
      company: company || null,
      createdBy: req.user.id
    });
    
    await division.save();
    await division.populate('parentDivision', 'name code');
    await division.populate('company', 'name code');
    
    console.log(`Division created: ${division.name} (${division.code})`);
    return createdResponse(res, division, 'Division created successfully');
    
  } catch (error) {
    console.error('Error creating division:', error);
    return errorResponse(res, error.message, 'CREATE_DIVISION_ERROR');
  }
};

// Update division
export const updateDivision = async (req, res) => {
  try {
    console.log('=== UPDATING DIVISION ===');
    const { id } = req.params;
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      divisionHead, 
      location, 
      budget, 
      employeeCount, 
      parentDivision,
      company 
    } = req.body;
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return notFoundResponse(res, 'Division not found');
    }
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Division code and name are required');
    }
    
    // Check if new code conflicts with existing division (excluding current one)
    if (code.trim().toUpperCase() !== division.code) {
      const existingDivision = await Division.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDivision) {
        return badRequestResponse(res, 'Division with this code already exists');
      }
    }
    
    // Update division
    division.code = code.trim().toUpperCase();
    division.name = name.trim();
    division.description = description?.trim() || '';
    division.erpCode = erpCode?.trim() || '';
    division.isActive = isActive !== false;
    division.divisionHead = divisionHead?.trim() || '';
    division.location = location?.trim() || '';
    division.budget = budget?.trim() || '';
    division.employeeCount = parseInt(employeeCount) || 0;
    division.parentDivision = parentDivision || null;
    division.company = company || null;
    division.updatedBy = req.user.id;
    
    await division.save();
    await division.populate('parentDivision', 'name code');
    await division.populate('company', 'name code');
    
    console.log(`Division updated: ${division.name} (${division.code})`);
    return successResponse(res, division, 'Division updated successfully');
    
  } catch (error) {
    console.error('Error updating division:', error);
    return errorResponse(res, error.message, 'UPDATE_DIVISION_ERROR');
  }
};

// Delete division
export const deleteDivision = async (req, res) => {
  try {
    console.log('=== DELETING DIVISION ===');
    const { id } = req.params;
    
    // Find division
    const division = await Division.findById(id);
    if (!division) {
      return notFoundResponse(res, 'Division not found');
    }
    
    // Check if division has child divisions
    const childDivisions = await Division.findOne({ parentDivision: id });
    if (childDivisions) {
      return badRequestResponse(res, 'Cannot delete division with child divisions. Please reassign or delete child divisions first.');
    }
    
    // Check if division has departments (you might want to add this check later)
    // const departmentCount = await Department.countDocuments({ division: id });
    // if (departmentCount > 0) {
    //   return badRequestResponse(res, `Cannot delete division with ${departmentCount} departments. Please reassign departments first.`);
    // }
    
    await Division.findByIdAndDelete(id);
    
    console.log(`Division deleted: ${division.name} (${division.code})`);
    return successResponse(res, null, 'Division deleted successfully');
    
  } catch (error) {
    console.error('Error deleting division:', error);
    return errorResponse(res, error.message, 'DELETE_DIVISION_ERROR');
  }
};

// Toggle division status
export const toggleDivisionStatus = async (req, res) => {
  try {
    console.log('=== TOGGLING DIVISION STATUS ===');
    const { id } = req.params;
    
    const division = await Division.findById(id);
    if (!division) {
      return notFoundResponse(res, 'Division not found');
    }
    
    division.isActive = !division.isActive;
    division.updatedBy = req.user.id;
    await division.save();
    
    const status = division.isActive ? 'activated' : 'deactivated';
    console.log(`Division ${status}: ${division.name} (${division.code})`);
    
    return successResponse(res, division, `Division ${status} successfully`);
    
  } catch (error) {
    console.error('Error toggling division status:', error);
    return errorResponse(res, error.message, 'TOGGLE_DIVISION_STATUS_ERROR');
  }
};

// Get division statistics
export const getDivisionStats = async (req, res) => {
  try {
    console.log('=== GETTING DIVISION STATS ===');
    
    const stats = await Division.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          withParent: { $sum: { $cond: ['$parentDivision', 1, 0] } },
          withoutParent: { $sum: { $cond: ['$parentDivision', 0, 1] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, inactive: 0, withParent: 0, withoutParent: 0 };
    
    console.log(`Division stats: ${result.total} total, ${result.active} active, ${result.inactive} inactive`);
    return successResponse(res, result, 'Division statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting division stats:', error);
    return errorResponse(res, error.message, 'GET_DIVISION_STATS_ERROR');
  }
};

// Get active divisions for dropdown (active only)
export const getActiveDivisions = async (req, res) => {
  try {
    console.log('=== GETTING ACTIVE DIVISIONS FOR DROPDOWN ===');
    
    const divisions = await Division.find({ isActive: true })
      .select('_id code name')
      .populate('company', 'name')
      .sort({ name: 1 });

    console.log(`Found ${divisions.length} active divisions for dropdown`);
    return successResponse(res, divisions, 'Active divisions retrieved successfully');
    
  } catch (error) {
    console.error('Error getting active divisions:', error);
    return errorResponse(res, error.message, 'GET_ACTIVE_DIVISIONS_ERROR');
  }
};
