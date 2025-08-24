import SystemSettings from '../models/systemSettings.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).single('logo');

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SystemSettings({
        companyInfo: {
          companyName: 'HRPAY System',
          brandName: 'HRPAY',
          email: 'admin@hrpay.com',
          phone: '+974 1234 5678',
          website: 'https://hrpay.com',
          address: 'Doha, Qatar',
          city: 'Doha',
          country: 'Qatar'
        },
        systemConfig: {
          systemName: 'HRPAY',
          version: '1.0.0',
          timezone: 'Asia/Dubai',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24',
          language: 'English',
          currency: 'USD'
        }
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting system settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system settings',
      details: error.message
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          details: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type',
          details: err.message
        });
      }

      try {
        let settings = await SystemSettings.findOne();
        
        if (!settings) {
          settings = new SystemSettings();
        }

        // Parse settings data
        const settingsData = JSON.parse(req.body.settings || '{}');
        
        // Update company info
        if (settingsData.companyInfo) {
          settings.companyInfo = {
            ...settings.companyInfo,
            ...settingsData.companyInfo
          };
        }

        // Update system config
        if (settingsData.systemConfig) {
          settings.systemConfig = {
            ...settings.systemConfig,
            ...settingsData.systemConfig
          };
        }

        // Update security settings
        if (settingsData.securitySettings) {
          settings.securitySettings = {
            ...settings.securitySettings,
            ...settingsData.securitySettings
          };
        }

        // Update notification settings
        if (settingsData.notificationSettings) {
          settings.notificationSettings = {
            ...settings.notificationSettings,
            ...settingsData.notificationSettings
          };
        }

        // Handle logo upload
        if (req.file) {
          // Delete old logo if exists
          if (settings.logo && settings.logo.filename) {
            const oldLogoPath = path.join('uploads/logos', settings.logo.filename);
            if (fs.existsSync(oldLogoPath)) {
              fs.unlinkSync(oldLogoPath);
            }
          }

          // Update logo information
          settings.logo = {
            url: `/uploads/logos/${req.file.filename}`,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
          };
        }

        // Validate settings
        const validationErrors = settings.validateSettings();
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: validationErrors
          });
        }

        // Update metadata
        settings.updatedBy = req.user?._id || '000000000000000000000000';

        await settings.save();

        res.json({
          success: true,
      message: 'System settings updated successfully',
          data: settings
        });
      } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update system settings',
          details: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error in updateSystemSettings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update system settings',
      details: error.message
    });
  }
};



export {
  getSystemSettings,
  updateSystemSettings
}; 