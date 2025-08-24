import Department from '../models/Department.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new department
const createDepartment = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    erpCode,
    manager,
    location,
    budget,
    parentDepartment
  } = req.body;

  // Check if department with same code already exists
  const existingDepartment = await Department.findOne({ code });
  if (existingDepartment) {
    throw new ApiError(400, "Department with this code already exists");
  }

  const department = await Department.create({
    code,
    name,
    description,
    erpCode,
    manager,
    location,
    budget,
    parentDepartment,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, department, "Department created successfully")
  );
});

// Get all departments with pagination and filters
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive, parentDepartment } = req.query;

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

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'parentDepartment', select: 'name code' },
      { path: 'createdBy', select: 'username email' }
    ],
    sort: { createdAt: -1 }
  };

  const departments = await Department.paginate(query, options);

  return res.status(200).json(
    new ApiResponse(200, departments, "Departments retrieved successfully")
  );
});

// Get department by ID
const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findById(id)
    .populate('parentDepartment', 'name code')
    .populate('createdBy', 'username email');

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, department, "Department retrieved successfully")
  );
});

// Update department
const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.createdAt;

  const department = await Department.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('parentDepartment', 'name code');

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, department, "Department updated successfully")
  );
});

// Delete department
const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findByIdAndDelete(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Department deleted successfully")
  );
});

// Toggle department status
const toggleDepartmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findById(id);
  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  department.isActive = !department.isActive;
  department.updatedBy = req.user._id;
  await department.save();

  return res.status(200).json(
    new ApiResponse(200, department, "Department status updated successfully")
  );
});

// Get department statistics
const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await Department.aggregate([
    {
      $group: {
        _id: null,
        totalDepartments: { $sum: 1 },
        activeDepartments: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveDepartments: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const departmentCounts = await Department.aggregate([
    {
      $group: {
        _id: '$isActive',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: stats[0]?.totalDepartments || 0,
    active: stats[0]?.activeDepartments || 0,
    inactive: stats[0]?.inactiveDepartments || 0,
    breakdown: departmentCounts
  };

  return res.status(200).json(
    new ApiResponse(200, result, "Department statistics retrieved successfully")
  );
});

// Get departments for dropdown (active only)
const getActiveDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .select('_id code name')
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, departments, "Active departments retrieved successfully")
  );
});

export {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  getDepartmentStats,
  getActiveDepartments
};
