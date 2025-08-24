import Company from '../models/Company.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new company
const createCompany = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    erpCode,
    type,
    address,
    contact,
    registrationNumber,
    taxId,
    parentCompany,
    ceo,
    foundedYear,
    industry
  } = req.body;

  // Check if company with same code already exists
  const existingCompany = await Company.findOne({ code });
  if (existingCompany) {
    throw new ApiError(400, "Company with this code already exists");
  }

  const company = await Company.create({
    code,
    name,
    description,
    erpCode,
    type,
    address,
    contact,
    registrationNumber,
    taxId,
    parentCompany,
    ceo,
    foundedYear,
    industry,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, company, "Company created successfully")
  );
});

// Get all companies with pagination and filters
const getCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', isActive, type, parentCompany, industry } = req.query;

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

  if (type) {
    query.type = type;
  }

  if (parentCompany) {
    query.parentCompany = parentCompany;
  }

  if (industry) {
    query.industry = industry;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'parentCompany', select: 'name code' },
      { path: 'createdBy', select: 'username email' }
    ],
    sort: { createdAt: -1 }
  };

  const companies = await Company.paginate(query, options);

  return res.status(200).json(
    new ApiResponse(200, companies, "Companies retrieved successfully")
  );
});

// Get company by ID
const getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findById(id)
    .populate('parentCompany', 'name code')
    .populate('createdBy', 'username email');

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(200, company, "Company retrieved successfully")
  );
});

// Update company
const updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.createdBy;
  delete updateData.createdAt;

  const company = await Company.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('parentCompany', 'name code');

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(200, company, "Company updated successfully")
  );
});

// Delete company
const deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findByIdAndDelete(id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Company deleted successfully")
  );
});

// Toggle company status
const toggleCompanyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  company.isActive = !company.isActive;
  company.updatedBy = req.user._id;
  await company.save();

  return res.status(200).json(
    new ApiResponse(200, company, "Company status updated successfully")
  );
});

// Get company statistics
const getCompanyStats = asyncHandler(async (req, res) => {
  const stats = await Company.aggregate([
    {
      $group: {
        _id: null,
        totalCompanies: { $sum: 1 },
        activeCompanies: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactiveCompanies: {
          $sum: { $cond: ['$isActive', 0, 1] }
        }
      }
    }
  ]);

  const typeStats = await Company.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const industryStats = await Company.aggregate([
    {
      $group: {
        _id: '$industry',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: stats[0]?.totalCompanies || 0,
    active: stats[0]?.activeCompanies || 0,
    inactive: stats[0]?.inactiveCompanies || 0,
    byType: typeStats,
    byIndustry: industryStats
  };

  return res.status(200).json(
    new ApiResponse(200, result, "Company statistics retrieved successfully")
  );
});

// Get companies for dropdown (active only)
const getActiveCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ isActive: true })
    .select('_id code name type')
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, companies, "Active companies retrieved successfully")
  );
});

export {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
  getCompanyStats,
  getActiveCompanies
};
