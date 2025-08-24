import Company from '../../../models/Company.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all companies
export const getCompanies = async (req, res) => {
  try {
    console.log('=== GETTING COMPANIES ===');
    
    const { 
      search, 
      isActive, 
      parentCompany,
      type,
      industry,
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
    
    if (parentCompany) {
      query.parentCompany = parentCompany;
    }

    if (type) {
      query.type = type;
    }

    if (industry) {
      query.industry = industry;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and population
    const companies = await Company.find(query)
      .populate('parentCompany', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Company.countDocuments(query);

    console.log(`Found ${companies.length} companies out of ${total} total`);
    
    return successResponse(res, {
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, `Successfully retrieved ${companies.length} companies`);
    
  } catch (error) {
    console.error('Error getting companies:', error);
    return errorResponse(res, error.message, 'GET_COMPANIES_ERROR');
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    console.log('=== GETTING COMPANY BY ID ===');
    const { id } = req.params;
    
    const company = await Company.findById(id)
      .populate('parentCompany', 'name code')
      .select('-__v');
    
    if (!company) {
      return notFoundResponse(res, 'Company not found');
    }
    
    console.log(`Found company: ${company.name}`);
    return successResponse(res, company, 'Company retrieved successfully');
    
  } catch (error) {
    console.error('Error getting company by ID:', error);
    return errorResponse(res, error.message, 'GET_COMPANY_BY_ID_ERROR');
  }
};

// Create new company
export const createCompany = async (req, res) => {
  try {
    console.log('=== CREATING COMPANY ===');
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      type, 
      address, 
      contact, 
      registrationNumber, 
      taxId, 
      parentCompany, 
      ceo, 
      foundedYear, 
      employeeCount, 
      industry 
    } = req.body;
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Company code and name are required');
    }
    
    // Check if company code already exists
    const existingCompany = await Company.findOne({ code: code.trim().toUpperCase() });
    if (existingCompany) {
      return badRequestResponse(res, 'Company with this code already exists');
    }
    
    // Create company
    const company = new Company({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || '',
      erpCode: erpCode?.trim() || '',
      isActive: isActive !== false,
      type: type?.trim() || 'Parent',
      address: address || {},
      contact: contact || {},
      registrationNumber: registrationNumber?.trim() || '',
      taxId: taxId?.trim() || '',
      parentCompany: parentCompany || null,
      ceo: ceo?.trim() || '',
      foundedYear: parseInt(foundedYear) || null,
      employeeCount: parseInt(employeeCount) || 0,
      industry: industry?.trim() || '',
      createdBy: req.user.id
    });
    
    await company.save();
    await company.populate('parentCompany', 'name code');
    
    console.log(`Company created: ${company.name} (${company.code})`);
    return createdResponse(res, company, 'Company created successfully');
    
  } catch (error) {
    console.error('Error creating company:', error);
    return errorResponse(res, error.message, 'CREATE_COMPANY_ERROR');
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    console.log('=== UPDATING COMPANY ===');
    const { id } = req.params;
    const { 
      code, 
      name, 
      description, 
      erpCode, 
      isActive, 
      type, 
      address, 
      contact, 
      registrationNumber, 
      taxId, 
      parentCompany, 
      ceo, 
      foundedYear, 
      employeeCount, 
      industry 
    } = req.body;
    
    // Find company
    const company = await Company.findById(id);
    if (!company) {
      return notFoundResponse(res, 'Company not found');
    }
    
    // Validation
    if (!code || !name) {
      return badRequestResponse(res, 'Company code and name are required');
    }
    
    // Check if new code conflicts with existing company (excluding current one)
    if (code.trim().toUpperCase() !== company.code) {
      const existingCompany = await Company.findOne({ 
        code: code.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingCompany) {
        return badRequestResponse(res, 'Company with this code already exists');
      }
    }
    
    // Update company
    company.code = code.trim().toUpperCase();
    company.name = name.trim();
    company.description = description?.trim() || '';
    company.erpCode = erpCode?.trim() || '';
    company.isActive = isActive !== false;
    company.type = type?.trim() || 'Parent';
    company.address = address || {};
    company.contact = contact || {};
    company.registrationNumber = registrationNumber?.trim() || '';
    company.taxId = taxId?.trim() || '';
    company.parentCompany = parentCompany || null;
    company.ceo = ceo?.trim() || '';
    company.foundedYear = parseInt(foundedYear) || null;
    company.employeeCount = parseInt(employeeCount) || 0;
    company.industry = industry?.trim() || '';
    company.updatedBy = req.user.id;
    
    await company.save();
    await company.populate('parentCompany', 'name code');
    
    console.log(`Company updated: ${company.name} (${company.code})`);
    return successResponse(res, company, 'Company updated successfully');
    
  } catch (error) {
    console.error('Error updating company:', error);
    return errorResponse(res, error.message, 'UPDATE_COMPANY_ERROR');
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    console.log('=== DELETING COMPANY ===');
    const { id } = req.params;
    
    // Find company
    const company = await Company.findById(id);
    if (!company) {
      return notFoundResponse(res, 'Company not found');
    }
    
    // Check if company has child companies
    const childCompanies = await Company.findOne({ parentCompany: id });
    if (childCompanies) {
      return badRequestResponse(res, 'Cannot delete company with child companies. Please reassign or delete child companies first.');
    }
    
    // Check if company has divisions (you might want to add this check later)
    // const divisionCount = await Division.countDocuments({ company: id });
    // if (divisionCount > 0) {
    //   return badRequestResponse(res, `Cannot delete company with ${divisionCount} divisions. Please reassign divisions first.`);
    // }
    
    await Company.findByIdAndDelete(id);
    
    console.log(`Company deleted: ${company.name} (${company.code})`);
    return successResponse(res, null, 'Company deleted successfully');
    
  } catch (error) {
    console.error('Error deleting company:', error);
    return errorResponse(res, error.message, 'DELETE_COMPANY_ERROR');
  }
};

// Toggle company status
export const toggleCompanyStatus = async (req, res) => {
  try {
    console.log('=== TOGGLING COMPANY STATUS ===');
    const { id } = req.params;
    
    const company = await Company.findById(id);
    if (!company) {
      return notFoundResponse(res, 'Company not found');
    }
    
    company.isActive = !company.isActive;
    company.updatedBy = req.user.id;
    await company.save();
    
    const status = company.isActive ? 'activated' : 'deactivated';
    console.log(`Company ${status}: ${company.name} (${company.code})`);
    
    return successResponse(res, company, `Company ${status} successfully`);
    
  } catch (error) {
    console.error('Error toggling company status:', error);
    return errorResponse(res, error.message, 'TOGGLE_COMPANY_STATUS_ERROR');
  }
};

// Get company statistics
export const getCompanyStats = async (req, res) => {
  try {
    console.log('=== GETTING COMPANY STATS ===');
    
    const stats = await Company.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          withParent: { $sum: { $cond: ['$parentCompany', 1, 0] } },
          withoutParent: { $sum: { $cond: ['$parentCompany', 0, 1] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, inactive: 0, withParent: 0, withoutParent: 0 };
    
    console.log(`Company stats: ${result.total} total, ${result.active} active, ${result.inactive} inactive`);
    return successResponse(res, result, 'Company statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting company stats:', error);
    return errorResponse(res, error.message, 'GET_COMPANY_STATS_ERROR');
  }
};

// Get active companies for dropdown (active only)
export const getActiveCompanies = async (req, res) => {
  try {
    console.log('=== GETTING ACTIVE COMPANIES FOR DROPDOWN ===');
    
    const companies = await Company.find({ isActive: true })
      .select('_id code name type')
      .sort({ name: 1 });

    console.log(`Found ${companies.length} active companies for dropdown`);
    return successResponse(res, companies, 'Active companies retrieved successfully');
    
  } catch (error) {
    console.error('Error getting active companies:', error);
    return errorResponse(res, error.message, 'GET_ACTIVE_COMPANIES_ERROR');
  }
}; 