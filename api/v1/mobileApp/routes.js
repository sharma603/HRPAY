import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getMobileAppSettings, 
  updateMobileAppSettings, 
  generateAPK, 
  uploadBuild, 
  pushUpdate, 
  testApp,
  deployToEnvironment,
  rollbackDeployment,
  updatePerformanceMetrics,
  getDeploymentStatus,
  updateUserStatistics
} from './controller.js';
import auth from '../../../middleware/auth.js';

const router = express.Router();

// Configure multer for build uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/builds';
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created builds upload directory:', uploadDir);
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating builds upload directory:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for build files
  },
  fileFilter: function (req, file, cb) {
    // Allow APK, AAB, and other build files
    const allowedTypes = [
      'application/vnd.android.package-archive', // APK
      'application/octet-stream', // AAB and other binary files
      'application/zip' // ZIP files
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.apk') || file.originalname.endsWith('.aab')) {
      cb(null, true);
    } else {
      cb(new Error('Only APK, AAB, and build files are allowed!'), false);
    }
  }
});

// Mobile App Routes (all require authentication)
router.get('/settings', auth, getMobileAppSettings);
router.put('/settings', auth, updateMobileAppSettings);
router.post('/generate-apk', auth, generateAPK);
router.post('/upload-build', auth, upload.single('build'), uploadBuild);
router.post('/push-update', auth, pushUpdate);
router.post('/test-app', auth, testApp);

// Deployment Management
router.post('/deploy', auth, deployToEnvironment);
router.post('/rollback', auth, rollbackDeployment);
router.get('/deployment-status', auth, getDeploymentStatus);

// Performance & Monitoring
router.put('/performance-metrics', auth, updatePerformanceMetrics);
router.put('/user-statistics', auth, updateUserStatistics);

export default router;
