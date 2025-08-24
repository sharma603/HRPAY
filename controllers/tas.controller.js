import TasShift from '../models/TasShift.js';
import TasUserEmployeeLink from '../models/TasUserEmployeeLink.js';
import TasRamadanPeriod from '../models/TasRamadanPeriod.js';
import TasAttendanceSettings from '../models/TasAttendanceSettings.js';
import TasWeeklyRoster from '../models/TasWeeklyRoster.js';
import TasArea from '../models/TasArea.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Generic helpers
const crudList = (Model) => asyncHandler(async (req, res) => {
  const items = await Model.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

const crudCreate = (Model) => asyncHandler(async (req, res) => {
  try {
    const created = await Model.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate value for a unique field', error: err.keyValue });
    }
    throw err;
  }
});

const crudUpdate = (Model) => asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate value for a unique field', error: err.keyValue });
    }
    throw err;
  }
});

const crudDelete = (Model) => asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Model.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true });
});

// Shifts
export const listShifts = asyncHandler(async (req, res) => {
  const items = await TasShift.find({}).populate('area').sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});
export const createShift = crudCreate(TasShift);
export const updateShift = crudUpdate(TasShift);
export const deleteShift = crudDelete(TasShift);

// User-Employee Links
export const listLinks = crudList(TasUserEmployeeLink);
export const createLink = crudCreate(TasUserEmployeeLink);
export const updateLink = crudUpdate(TasUserEmployeeLink);
export const deleteLink = crudDelete(TasUserEmployeeLink);

// Ramadan Periods
export const listRamadan = crudList(TasRamadanPeriod);
export const createRamadan = crudCreate(TasRamadanPeriod);
export const updateRamadan = crudUpdate(TasRamadanPeriod);
export const deleteRamadan = crudDelete(TasRamadanPeriod);

// Attendance Settings (singleton per org; but expose CRUD for simplicity)
export const listAttendanceSettings = crudList(TasAttendanceSettings);
export const createAttendanceSettings = crudCreate(TasAttendanceSettings);
export const updateAttendanceSettings = crudUpdate(TasAttendanceSettings);
export const deleteAttendanceSettings = crudDelete(TasAttendanceSettings);

// Weekly Rosters
export const listWeeklyRosters = crudList(TasWeeklyRoster);
export const createWeeklyRoster = crudCreate(TasWeeklyRoster);
export const updateWeeklyRoster = crudUpdate(TasWeeklyRoster);
export const deleteWeeklyRoster = crudDelete(TasWeeklyRoster);

// Areas
export const listAreas = crudList(TasArea);
export const createArea = crudCreate(TasArea);
export const updateArea = crudUpdate(TasArea);
export const deleteArea = crudDelete(TasArea);


