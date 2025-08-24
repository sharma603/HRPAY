import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  uploadEmployeeAvatar,
  uploadEmployeeFingerprint,
  saveEmployeeBiometric,
  getNextEmployeeId,
  setEmployeeBarcode,
  getEmployeeBarcode,
  checkBarcodeExists
} from '../controllers/employee.controller.js';
import Employee from '../models/Employee.js';

const router = express.Router();

// Configure multer for employee avatar uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Base backend dir (one level up from routes folder)
const backendDir = path.join(__dirname, '..');
const employeeUploadsDir = path.join(backendDir, 'uploads', 'employees');
if (!fs.existsSync(employeeUploadsDir)) {
  fs.mkdirSync(employeeUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const subdir = req.uploadSubdirName || 'misc';
      const targetDir = path.join(employeeUploadsDir, subdir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      cb(null, targetDir);
    } catch (err) {
      cb(err, employeeUploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all employees with optional filtering and pagination
router.get('/', getEmployees);
// Get next employee id
router.get('/next-id', getNextEmployeeId);

// Employee barcode management
router.get('/:id/barcode', getEmployeeBarcode);
router.post('/:id/barcode', setEmployeeBarcode);
router.get('/barcode/check', checkBarcodeExists);

// Get employee statistics (must come before /:id route)
router.get('/stats', getEmployeeStats);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create new employee
router.post('/', createEmployee);

// Update employee
router.put('/:id', updateEmployee);

// Upload employee avatar
const toSlug = (value) => (value || '')
  .toString()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const setEmployeeUploadFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    let folder = 'misc';
    if (id) {
      const emp = await Employee.findById(id).lean();
      if (emp) {
        const namePart = toSlug(`${emp.firstName || ''}-${emp.middleName || ''}-${emp.lastName || ''}`);
        const idPart = toSlug(emp.employeeId || '');
        folder = [idPart, namePart].filter(Boolean).join('-') || toSlug(id);
      } else {
        folder = toSlug(id);
      }
    }
    req.uploadSubdirName = folder;
    next();
  } catch (e) {
    // fallback
    req.uploadSubdirName = 'misc';
    next();
  }
};

router.post('/:id/avatar', setEmployeeUploadFolder, upload.single('avatar'), uploadEmployeeAvatar);
router.post('/:id/fingerprint', setEmployeeUploadFolder, upload.single('fingerprint'), uploadEmployeeFingerprint);
router.post('/:id/biometric', saveEmployeeBiometric);

// Delete employee
router.delete('/:id', deleteEmployee);

export default router; 