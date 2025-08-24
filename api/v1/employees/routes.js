import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee, 
  uploadEmployeeAvatar,
  getEmployeeStats,
  getEmployeeAvatars,
  removeEmployeeAvatar,
  checkBarcodeExists
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { id } = req.params;
      
      // Create a temporary directory first, we'll move the file later
      const tempDir = path.join(process.cwd(), 'uploads', 'temp');
      require('fs').mkdirSync(tempDir, { recursive: true });
      
      console.log('Created temp upload directory:', tempDir);
      cb(null, tempDir);
    } catch (error) {
      console.error('Error creating temp upload directory:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Use original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}_${timestamp}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('=== MULTER FILE FILTER ===');
    console.log('File mimetype:', file.mimetype);
    console.log('File originalname:', file.originalname);
    console.log('File size:', file.size);
    
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      console.log('File accepted');
      cb(null, true);
    } else {
      console.log('File rejected - not an image');
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
  } else if (error) {
    console.error('File upload error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed',
      error: 'FILE_UPLOAD_ERROR'
    });
  }
  next();
};

// All routes require authentication
router.use(auth);

// Employee routes
router.get('/', getEmployees);
router.get('/stats', getEmployeeStats);
router.get('/:id', getEmployeeById);
router.get('/:id/avatars', getEmployeeAvatars);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.post('/:id/avatar', upload.single('avatar'), handleMulterError, uploadEmployeeAvatar);
router.delete('/:id/avatar', removeEmployeeAvatar);
router.get('/barcode/check', checkBarcodeExists);

// Test file upload endpoint (for debugging)
router.post('/test-upload', upload.single('testFile'), handleMulterError, (req, res) => {
  try {
    console.log('=== TEST UPLOAD ===');
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      message: 'Test upload successful',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ success: false, message: 'Test upload failed', error: error.message });
  }
});

export default router;
