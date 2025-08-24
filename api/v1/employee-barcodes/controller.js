import EmployeeBarcode from '../../../models/EmployeeBarcode.js';
import Employee from '../../../models/Employee.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Create new employee barcode
export const createEmployeeBarcode = async (req, res) => {
  try {
    console.log('=== CREATING EMPLOYEE BARCODE ===');
    console.log('Request body:', req.body);
    
    const { employeeId, code, format, description } = req.body;
    
    // Validate required fields
    if (!employeeId || !code) {
      return badRequestResponse(res, 'Employee ID and barcode code are required');
    }
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return notFoundResponse(res, 'Employee not found');
    }
    
    // Check if barcode code already exists
    const existingBarcode = await EmployeeBarcode.findOne({ code: code.trim() });
    if (existingBarcode) {
      return badRequestResponse(res, 'Barcode code already exists');
    }
    
    // Check if employee already has a barcode
    const existingEmployeeBarcode = await EmployeeBarcode.findOne({ 
      employeeId: employeeId,
      isActive: true 
    });
    
    if (existingEmployeeBarcode) {
      // Update existing barcode
      existingEmployeeBarcode.code = code.trim();
      existingEmployeeBarcode.format = format || 'CODE128';
      existingEmployeeBarcode.description = description;
      existingEmployeeBarcode.updatedAt = new Date();
      
      await existingEmployeeBarcode.save();
      
      console.log('Employee barcode updated successfully');
      return successResponse(res, existingEmployeeBarcode, 'Employee barcode updated successfully');
    }
    
    // Create new barcode
    const barcodeData = {
      employeeId: employeeId,
      code: code.trim(),
      format: format || 'CODE128',
      description: description || '',
      isActive: true
    };
    
    const employeeBarcode = new EmployeeBarcode(barcodeData);
    await employeeBarcode.save();
    
    console.log('Employee barcode created successfully:', employeeBarcode._id);
    
    return createdResponse(res, employeeBarcode, 'Employee barcode created successfully');
  } catch (error) {
    console.error('Error creating employee barcode:', error);
    return errorResponse(res, error.message, 'CREATE_EMPLOYEE_BARCODE_ERROR');
  }
};

// Get all employee barcodes
export const getEmployeeBarcodes = async (req, res) => {
  try {
    console.log('Getting all employee barcodes');
    
    const barcodes = await EmployeeBarcode.find({})
      .populate('employeeId', 'name employeeId')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    return successResponse(res, barcodes, `Successfully retrieved ${barcodes.length} employee barcodes`);
  } catch (error) {
    console.error('Error getting employee barcodes:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_BARCODES_ERROR');
  }
};

// Get employee barcode by ID
export const getEmployeeBarcodeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting employee barcode by ID:', id);
    
    const barcode = await EmployeeBarcode.findById(id)
      .populate('employeeId', 'name employeeId')
      .select('-__v');
    
    if (!barcode) {
      return notFoundResponse(res, 'Employee barcode not found');
    }
    
    return successResponse(res, barcode, 'Employee barcode retrieved successfully');
  } catch (error) {
    console.error('Error getting employee barcode by ID:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_BARCODE_ERROR');
  }
};

// Get employee barcode by employee ID
export const getEmployeeBarcodeByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log('Getting employee barcode by employee ID:', employeeId);
    
    const barcode = await EmployeeBarcode.findOne({ 
      employeeId: employeeId,
      isActive: true 
    }).select('-__v');
    
    if (!barcode) {
      return notFoundResponse(res, 'Employee barcode not found');
    }
    
    return successResponse(res, barcode, 'Employee barcode retrieved successfully');
  } catch (error) {
    console.error('Error getting employee barcode by employee ID:', error);
    return errorResponse(res, error.message, 'GET_EMPLOYEE_BARCODE_ERROR');
  }
};

// Update employee barcode
export const updateEmployeeBarcode = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating employee barcode:', id);
    
    const barcode = await EmployeeBarcode.findById(id);
    if (!barcode) {
      return notFoundResponse(res, 'Employee barcode not found');
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.employeeId;
    delete updateData.createdAt;
    
    const updatedBarcode = await EmployeeBarcode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    return successResponse(res, updatedBarcode, 'Employee barcode updated successfully');
  } catch (error) {
    console.error('Error updating employee barcode:', error);
    return errorResponse(res, error.message, 'UPDATE_EMPLOYEE_BARCODE_ERROR');
  }
};

// Delete employee barcode
export const deleteEmployeeBarcode = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting employee barcode:', id);
    
    const barcode = await EmployeeBarcode.findById(id);
    if (!barcode) {
      return notFoundResponse(res, 'Employee barcode not found');
    }
    
    // Soft delete by setting isActive to false
    barcode.isActive = false;
    barcode.updatedAt = new Date();
    await barcode.save();
    
    return successResponse(res, null, 'Employee barcode deleted successfully');
  } catch (error) {
    console.error('Error deleting employee barcode:', error);
    return errorResponse(res, error.message, 'DELETE_EMPLOYEE_BARCODE_ERROR');
  }
};
