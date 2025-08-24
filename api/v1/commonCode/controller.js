import CommonCode from '../../../models/CommonCode.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all code types
export const getCodeTypes = async (req, res) => {
  try {
    const codeTypes = await CommonCode.distinct('codeType');
    return successResponse(res, codeTypes, "Code types retrieved successfully");
  } catch (error) {
    console.error('Error fetching code types:', error);
    return errorResponse(res, 'Failed to get code types', 'CODE_TYPES_ERROR');
  }
};

// Get codes by code type
export const getCodesByType = async (req, res) => {
  try {
    const { codeType } = req.params;
    const { showDeactivated = false } = req.query;
    
    let query = { codeType: codeType.toUpperCase() };
    
    // Filter by active status if showDeactivated is false
    if (!showDeactivated) {
      query.isActive = true;
    }
    
    const codes = await CommonCode.find(query)
      .sort({ code: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    return successResponse(res, codes, `Codes for ${codeType} retrieved successfully`);
  } catch (error) {
    console.error('Error fetching codes by type:', error);
    return errorResponse(res, 'Failed to get codes by type', 'CODES_BY_TYPE_ERROR');
  }
};

// Create new code
export const createCode = async (req, res) => {
  try {
    const { codeType, code, description, erpCode } = req.body;
    
    // Check if code already exists for this code type
    const existingCode = await CommonCode.findOne({
      codeType: codeType.toUpperCase(),
      code: code.toUpperCase()
    });
    
    if (existingCode) {
      return errorResponse(res, 'Code already exists for this code type', 'DUPLICATE_CODE_ERROR');
    }
    
    const newCode = new CommonCode({
      codeType: codeType.toUpperCase(),
      code: code.toUpperCase(),
      description: description.trim(),
      erpCode: erpCode ? erpCode.trim() : '',
      createdBy: req.user.id
    });
    
    await newCode.save();
    
    const populatedCode = await CommonCode.findById(newCode._id)
      .populate('createdBy', 'name email');
    
    return successResponse(res, populatedCode, "Code created successfully");
  } catch (error) {
    console.error('Error creating code:', error);
    return errorResponse(res, 'Failed to create code', 'CREATE_CODE_ERROR');
  }
};

// Update existing code
export const updateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, erpCode } = req.body;
    
    const existingCode = await CommonCode.findById(id);
    if (!existingCode) {
      return notFoundResponse(res, "Code");
    }
    
    // Check if the new code value conflicts with another code in the same type
    if (code && code !== existingCode.code) {
      const duplicateCode = await CommonCode.findOne({
        codeType: existingCode.codeType,
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (duplicateCode) {
        return errorResponse(res, 'Code already exists for this code type', 'DUPLICATE_CODE_ERROR');
      }
    }
    
    // Update fields
    if (code) existingCode.code = code.toUpperCase();
    if (description !== undefined) existingCode.description = description.trim();
    if (erpCode !== undefined) existingCode.erpCode = erpCode.trim();
    existingCode.updatedBy = req.user.id;
    
    await existingCode.save();
    
    const updatedCode = await CommonCode.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    return successResponse(res, updatedCode, "Code updated successfully");
  } catch (error) {
    console.error('Error updating code:', error);
    return errorResponse(res, 'Failed to update code', 'UPDATE_CODE_ERROR');
  }
};

// Delete code
export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    const code = await CommonCode.findById(id);
    if (!code) {
      return notFoundResponse(res, "Code");
    }
    
    await CommonCode.findByIdAndDelete(id);
    
    return successResponse(res, { message: 'Code deleted successfully' }, "Code deleted successfully");
  } catch (error) {
    console.error('Error deleting code:', error);
    return errorResponse(res, 'Failed to delete code', 'DELETE_CODE_ERROR');
  }
};

// Toggle code activation status
export const toggleCodeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const code = await CommonCode.findById(id);
    if (!code) {
      return notFoundResponse(res, "Code");
    }
    
    code.isActive = !code.isActive;
    code.updatedBy = req.user.id;
    await code.save();
    
    const updatedCode = await CommonCode.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    const status = code.isActive ? 'activated' : 'deactivated';
    return successResponse(res, updatedCode, `Code ${status} successfully`);
  } catch (error) {
    console.error('Error toggling code status:', error);
    return errorResponse(res, 'Failed to toggle code status', 'TOGGLE_STATUS_ERROR');
  }
};

// Bulk create codes
export const bulkCreateCodes = async (req, res) => {
  try {
    const { codeType, codes } = req.body;
    
    if (!Array.isArray(codes) || codes.length === 0) {
      return errorResponse(res, 'Codes array is required and must not be empty', 'INVALID_CODES_ARRAY');
    }
    
    const codesToCreate = codes.map(codeData => ({
      codeType: codeType.toUpperCase(),
      code: codeData.code.toUpperCase(),
      description: codeData.description.trim(),
      erpCode: codeData.erpCode ? codeData.erpCode.trim() : '',
      createdBy: req.user.id
    }));
    
    // Check for duplicates
    for (const codeData of codesToCreate) {
      const existingCode = await CommonCode.findOne({
        codeType: codeData.codeType,
        code: codeData.code
      });
      
      if (existingCode) {
        return errorResponse(res, `Code ${codeData.code} already exists for ${codeData.codeType}`, 'DUPLICATE_CODE_ERROR');
      }
    }
    
    const createdCodes = await CommonCode.insertMany(codesToCreate);
    
    const populatedCodes = await CommonCode.find({
      _id: { $in: createdCodes.map(c => c._id) }
    }).populate('createdBy', 'name email');
    
    return successResponse(res, populatedCodes, `${createdCodes.length} codes created successfully`);
  } catch (error) {
    console.error('Error bulk creating codes:', error);
    return errorResponse(res, 'Failed to bulk create codes', 'BULK_CREATE_ERROR');
  }
};

// Search codes
export const searchCodes = async (req, res) => {
  try {
    const { codeType, searchTerm, showDeactivated = false } = req.query;
    
    let query = {};
    
    if (codeType) {
      query.codeType = codeType.toUpperCase();
    }
    
    if (searchTerm) {
      query.$or = [
        { code: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { erpCode: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (!showDeactivated) {
      query.isActive = true;
    }
    
    const codes = await CommonCode.find(query)
      .sort({ codeType: 1, code: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    return successResponse(res, codes, "Codes search completed successfully");
  } catch (error) {
    console.error('Error searching codes:', error);
    return errorResponse(res, 'Failed to search codes', 'SEARCH_CODES_ERROR');
  }
};
