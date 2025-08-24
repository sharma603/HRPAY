import SubDepartment from '../models/SubDepartment.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new sub-department
const createSubDepartment = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    erpCode,
    manager,
    location,
    budget,
    parentDepartment,
    division,
    company,
    type,
    specialization
  } = req.body;

  // Check if sub-department with same code already exists
  const existingSubDepartment = await SubDepartment.findOne({ code });
  if (existingSubDepartment) {
    throw new ApiError(400, "Sub-department with this code already exists");
  }

  const subDepartment = await SubDepartment.create({
    code,
    name,
    description,
    erpCode,
    manager,
    location,
    budget,
    parentDepartment,
    division,
    company,
    type,
    specialization,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, subDepartment, "Sub-department created successfully")
  );
});

// Get all sub-departments with pagination and filters
const getSubDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive, parentDepartment, division, company, type } = req.query;

  const query = {};
  
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

  if (division) {
    query.division = division;
  }

  if (company) {
    query.company = company;
  }

  if (type) {
    query.type = type;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'parentDepartment', select: 'name code' },
      { path: 'division', select: 'name code' },
      { path: 'company', select: 'name code' },
      { path: 'createdBy', select: 'username email' }
    ],
    sort: { createdAt: -1 }
  };

  const subDepartments = await SubDepartment.paginate(query, options);

  return res.status(200).json(
    new ApiResponse(200, subDepartments, "Sub-departments retrieved successfully")
  );
});

// Get sub-department by ID
const getSubDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subDepartment = await SubDepartment.findById(id)
    .populate('parentDepartment', 'name code')
    .populate('division', 'name code')
    .populate('company', 'name code')
    .populate('createdBy', 'username email');

  if (!subDepartment) {
    throw new ApiError(404, "Sub-department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, subDepartment, "Sub-department retrieved successfully")
  );
});

// Update sub-department
const updateSubDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.createdAt;

  const subDepartment = await SubDepartment.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('parentDepartment', 'name code')
   .populate('division', 'name code')
   .populate('company', 'name code');

  if (!subDepartment) {
    throw new ApiError(404, "Sub-department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, subDepartment, "Sub-department updated successfully")
  );
});

// Delete sub-department
const deleteSubDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subDepartment = await SubDepartment.findByIdAndDelete(id);

  if (!subDepartment) {
    throw new ApiError(404, "Sub-department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Sub-department deleted successfully")
  );
});

// Toggle sub-department status
const toggleSubDepartmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subDepartment = await SubDepartment.findById(id);
  if (!subDepartment) {
    throw new ApiError(404, "Sub-department not found");
  }

  subDepartment.isActive = !subDepartment.isActive;
  subDepartment.updatedBy = req.user._id;
  await subDepartment.save();

  return res.status(200).json(
    new ApiResponse(200, subDepartment, "Sub-department status updated successfully")
  );
});

// Get sub-department statistics
const getSubDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await SubDepartment.aggregate([
    {
      $group: {
        _id: null,
        totalSubDepartments: { $sum: 1 },
        activeSubDepartments: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveSubDepartments: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const typeStats = await SubDepartment.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const parentDepartmentStats = await SubDepartment.aggregate([
    {
      $group: {
        _id: '$parentDepartment',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: stats[0]?.totalSubDepartments || 0,
    active: stats[0]?.activeSubDepartments || 0,
    inactive: stats[0]?.inactiveSubDepartments || 0,
    byType: typeStats,
    byParentDepartment: parentDepartmentStats
  };

  return res.status(200).json(
    new ApiResponse(200, result, "Sub-department statistics retrieved successfully")
  );
});

// Get sub-departments for dropdown (active only)
const getActiveSubDepartments = asyncHandler(async (req, res) => {
  const subDepartments = await SubDepartment.find({ isActive: true })
    .select('_id code name')
    .populate('parentDepartment', 'name')
    .populate('division', 'name')
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, subDepartments, "Active sub-departments retrieved successfully")
  );
});

export {
  createSubDepartment,
  getSubDepartments,
  getSubDepartmentById,
  updateSubDepartment,
  deleteSubDepartment,
  toggleSubDepartmentStatus,
  getSubDepartmentStats,
  getActiveSubDepartments
};
