import Designation from '../models/Designation.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new designation
const createDesignation = asyncHandler(async (req, res) => {
  const {
    code,
    title,
    description,
    erpCode,
    level,
    department,
    minSalary,
    maxSalary,
    requiredSkills
  } = req.body;

  // Check if designation with same code already exists
  const existingDesignation = await Designation.findOne({ code });
  if (existingDesignation) {
    throw new ApiError(400, "Designation with this code already exists");
  }

  const designation = await Designation.create({
    code,
    title,
    description,
    erpCode,
    level,
    department,
    minSalary,
    maxSalary,
    requiredSkills,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, designation, "Designation created successfully")
  );
});

// Get all designations with pagination and filters
const getDesignations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive, department, level } = req.query;

  const query = {};
  
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

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'department', select: 'name code' },
      { path: 'createdBy', select: 'username email' }
    ],
    sort: { createdAt: -1 }
  };

  const designations = await Designation.paginate(query, options);

  return res.status(200).json(
    new ApiResponse(200, designations, "Designations retrieved successfully")
  );
});

// Get designation by ID
const getDesignationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const designation = await Designation.findById(id)
    .populate('department', 'name code')
    .populate('createdBy', 'username email');

  if (!designation) {
    throw new ApiError(404, "Designation not found");
  }

  return res.status(200).json(
    new ApiResponse(200, designation, "Designation retrieved successfully")
  );
});

// Update designation
const updateDesignation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.createdAt;

  const designation = await Designation.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('department', 'name code');

  if (!designation) {
    throw new ApiError(404, "Designation not found");
  }

  return res.status(200).json(
    new ApiResponse(200, designation, "Designation updated successfully")
  );
});

// Delete designation
const deleteDesignation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const designation = await Designation.findByIdAndDelete(id);

  if (!designation) {
    throw new ApiError(404, "Designation not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Designation deleted successfully")
  );
});

// Toggle designation status
const toggleDesignationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const designation = await Designation.findById(id);
  if (!designation) {
    throw new ApiError(404, "Designation not found");
  }

  designation.isActive = !designation.isActive;
  designation.updatedBy = req.user._id;
  await designation.save();

  return res.status(200).json(
    new ApiResponse(200, designation, "Designation status updated successfully")
  );
});

// Get designation statistics
const getDesignationStats = asyncHandler(async (req, res) => {
  const stats = await Designation.aggregate([
    {
      $group: {
        _id: null,
        totalDesignations: { $sum: 1 },
        activeDesignations: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveDesignations: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const levelStats = await Designation.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: stats[0]?.totalDesignations || 0,
    active: stats[0]?.activeDesignations || 0,
    inactive: stats[0]?.inactiveDesignations || 0,
    byLevel: levelStats
  };

  return res.status(200).json(
    new ApiResponse(200, result, "Designation statistics retrieved successfully")
  );
});

// Get designations for dropdown (active only)
const getActiveDesignations = asyncHandler(async (req, res) => {
  const designations = await Designation.find({ isActive: true })
    .select('_id code title')
    .populate('department', 'name')
    .sort({ title: 1 });

  return res.status(200).json(
    new ApiResponse(200, designations, "Active designations retrieved successfully")
  );
});

export {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
  toggleDesignationStatus,
  getDesignationStats,
  getActiveDesignations
};
