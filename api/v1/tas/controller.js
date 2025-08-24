import TasShift from '../../../models/TasShift.js';
import TasArea from '../../../models/TasArea.js';
import { 
  successResponse, 
  errorResponse, 
  createdResponse, 
  badRequestResponse,
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get all shifts
export const getShifts = async (req, res) => {
  try {
    console.log('=== GETTING TAS SHIFTS ===');
    const shifts = await TasShift.find({})
      .populate('area', 'projectNumber projectName siteName')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${shifts.length} shifts`);
    return successResponse(res, shifts, `Successfully retrieved ${shifts.length} shifts`);
  } catch (error) {
    console.error('Error getting shifts:', error);
    return errorResponse(res, error.message, 'GET_SHIFTS_ERROR');
  }
};

// Create new shift
export const createShift = async (req, res) => {
  try {
    console.log('=== CREATING TAS SHIFT ===');
    const { code, startTime, endTime, area, title, description } = req.body;
    
    if (!code || !startTime || !endTime) {
      return badRequestResponse(res, 'Code, start time, and end time are required');
    }
    
    const existingShift = await TasShift.findOne({ code: code.trim() });
    if (existingShift) {
      return badRequestResponse(res, 'Shift with this code already exists');
    }
    
    const shift = new TasShift({
      code: code.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      area: area || null,
      title: title?.trim(),
      description: description?.trim()
    });
    
    await shift.save();
    await shift.populate('area', 'projectNumber projectName siteName');
    
    return createdResponse(res, shift, 'Shift created successfully');
  } catch (error) {
    console.error('Error creating shift:', error);
    return errorResponse(res, error.message, 'CREATE_SHIFT_ERROR');
  }
};

// Update shift
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await TasShift.findById(id);
    if (!shift) return notFoundResponse(res, 'Shift not found');
    
    const updatedShift = await TasShift.findByIdAndUpdate(
      id, req.body, { new: true, runValidators: true }
    ).populate('area', 'projectNumber projectName siteName').select('-__v');
    
    return successResponse(res, updatedShift, 'Shift updated successfully');
  } catch (error) {
    console.error('Error updating shift:', error);
    return errorResponse(res, error.message, 'UPDATE_SHIFT_ERROR');
  }
};

// Delete shift
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await TasShift.findById(id);
    if (!shift) return notFoundResponse(res, 'Shift not found');
    
    await TasShift.findByIdAndDelete(id);
    return successResponse(res, null, 'Shift deleted successfully');
  } catch (error) {
    console.error('Error deleting shift:', error);
    return errorResponse(res, error.message, 'DELETE_SHIFT_ERROR');
  }
};

// Get all areas
export const getAreas = async (req, res) => {
  try {
    console.log('=== GETTING TAS AREAS ===');
    const areas = await TasArea.find({}).select('-__v').sort({ createdAt: -1 });
    console.log(`Found ${areas.length} areas`);
    return successResponse(res, areas, `Successfully retrieved ${areas.length} areas`);
  } catch (error) {
    console.error('Error getting areas:', error);
    return errorResponse(res, error.message, 'GET_AREAS_ERROR');
  }
};

// Create new area
export const createArea = async (req, res) => {
  try {
    console.log('=== CREATING TAS AREA ===');
    const { projectNumber, projectName, siteName, location } = req.body;
    
    if (!projectNumber || !projectName || !siteName || !location) {
      return badRequestResponse(res, 'All fields are required');
    }
    
    const existingArea = await TasArea.findOne({ projectNumber: projectNumber.trim() });
    if (existingArea) {
      return badRequestResponse(res, 'Area with this project number already exists');
    }
    
    const area = new TasArea({
      projectNumber: projectNumber.trim(),
      projectName: projectName.trim(),
      siteName: siteName.trim(),
      location: location.trim()
    });
    
    await area.save();
    return createdResponse(res, area, 'Area created successfully');
  } catch (error) {
    console.error('Error creating area:', error);
    return errorResponse(res, error.message, 'CREATE_AREA_ERROR');
  }
};

// Update area
export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await TasArea.findById(id);
    if (!area) return notFoundResponse(res, 'Area not found');
    
    const updatedArea = await TasArea.findByIdAndUpdate(
      id, req.body, { new: true, runValidators: true }
    ).select('-__v');
    
    return successResponse(res, updatedArea, 'Area updated successfully');
  } catch (error) {
    console.error('Error updating area:', error);
    return errorResponse(res, error.message, 'UPDATE_AREA_ERROR');
  }
};

// Delete area
export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await TasArea.findById(id);
    if (!area) return notFoundResponse(res, 'Area not found');
    
    const shiftsUsingArea = await TasShift.countDocuments({ area: id });
    if (shiftsUsingArea > 0) {
      return badRequestResponse(res, `Cannot delete area. ${shiftsUsingArea} shift(s) are using this area.`);
    }
    
    await TasArea.findByIdAndDelete(id);
    return successResponse(res, null, 'Area deleted successfully');
  } catch (error) {
    console.error('Error deleting area:', error);
    return errorResponse(res, error.message, 'DELETE_AREA_ERROR');
  }
};
