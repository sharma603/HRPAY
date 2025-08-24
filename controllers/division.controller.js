import Division from '../models/Division.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new division
const createDivision = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    erpCode,
    divisionHead,
    location,
    budget,
    parentDivision,
    company
  } = req.body;

  // Check if division with same code already exists
  const existingDivision = await Division.findOne({ code });
  if (existingDivision) {
    throw new ApiError(400, "Division with this code already exists");
  }

  const division = await Division.create({
    code,
    name,
    description,
    erpCode,
    divisionHead,
    location,
    budget,
    parentDivision,
    company,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, division, "Division created successfully")
  );
});

// Get all divisions with pagination and filters
const getDivisions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive, company, parentDivision } = req.query;

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

  if (company) {
    query.company = company;
  }

  if (parentDivision) {
    query.parentDivision = parentDivision;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'parentDivision', select: 'name code' },
      { path: 'company', select: 'name code' },
      { path: 'createdBy', select: 'username email' }
    ],
    sort: { createdAt: -1 }
  };

  const divisions = await Division.paginate(query, options);

  return res.status(200).json(
    new ApiResponse(200, divisions, "Divisions retrieved successfully")
  );
});

// Get division by ID
const getDivisionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const division = await Division.findById(id)
    .populate('parentDivision', 'name code')
    .populate('company', 'name code')
    .populate('createdBy', 'username email');

  if (!division) {
    throw new ApiError(404, "Division not found");
  }

  return res.status(200).json(
    new ApiResponse(200, division, "Division retrieved successfully")
  );
});

// Update division
const updateDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.createdAt;

  const division = await Division.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('parentDivision', 'name code')
   .populate('company', 'name code');

  if (!division) {
    throw new ApiError(404, "Division not found");
  }

  return res.status(200).json(
    new ApiResponse(200, division, "Division updated successfully")
  );
});

// Delete division
const deleteDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const division = await Division.findByIdAndDelete(id);

  if (!division) {
    throw new ApiError(404, "Division not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Division deleted successfully")
  );
});

// Toggle division status
const toggleDivisionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const division = await Division.findById(id);
  if (!division) {
    throw new ApiError(404, "Division not found");
  }

  division.isActive = !division.isActive;
  division.updatedBy = req.user._id;
  await division.save();

  return res.status(200).json(
    new ApiResponse(200, division, "Division status updated successfully")
  );
});

// Get division statistics
const getDivisionStats = asyncHandler(async (req, res) => {
  const stats = await Division.aggregate([
    {
      $group: {
        _id: null,
        totalDivisions: { $sum: 1 },
        activeDivisions: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveDivisions: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const companyStats = await Division.aggregate([
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: stats[0]?.totalDivisions || 0,
    active: stats[0]?.activeDivisions || 0,
    inactive: stats[0]?.inactiveDivisions || 0,
    byCompany: companyStats
  };

  return res.status(200).json(
    new ApiResponse(200, result, "Division statistics retrieved successfully")
  );
});

// Get divisions for dropdown (active only)
const getActiveDivisions = asyncHandler(async (req, res) => {
  const divisions = await Division.find({ isActive: true })
    .select('_id code name')
    .populate('company', 'name')
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, divisions, "Active divisions retrieved successfully")
  );
});

export {
  createDivision,
  getDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
  getDivisionStats,
  getActiveDivisions
};
