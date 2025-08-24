import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import CompanyInfo from '../models/CompanyInfo.js';
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/company';
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created uploads directory:', uploadDir);
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('File upload attempt:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      console.log('File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname, 'MIME type:', file.mimetype);
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET - Get company information
router.get('/', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne().sort({ createdAt: -1 });
    
    if (!companyInfo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company information not found' 
      });
    }

    // Convert file paths to URLs
    const response = {
      ...companyInfo.toObject(),
      logo: companyInfo.logo ? {
        ...companyInfo.logo,
        url: `/uploads/company/${companyInfo.logo.filename}`
      } : null,
      letterhead: companyInfo.letterhead ? {
        ...companyInfo.letterhead,
        url: `/uploads/company/${companyInfo.letterhead.filename}`
      } : null
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST - Create or update company information
router.post('/', (req, res, next) => {
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'letterhead', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.',
          error: 'FILE_SIZE_ERROR'
        });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed for logo and letterhead.',
          error: 'FILE_TYPE_ERROR'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message,
        error: 'FILE_UPLOAD_ERROR'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('=== Company Info Save Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        console.log(`${key}:`, req.files[key].map(f => f.originalname));
      });
    }
    console.log('================================');

    const {
      legalName,
      taxId,
      registrationNumber,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      fiscalYearStart,
      fiscalYearEnd,
      smtpServer,
      smtpPort,
      username,
      password,
      fromEmail,
      fromName,
      enableSSL,
      enableTLS
    } = req.body;

    // Validate required fields with better error messages
    const requiredFields = [];
    if (!legalName || legalName.trim() === '') requiredFields.push('Legal Company Name');

    if (requiredFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${requiredFields.join(', ')}`,
        error: 'VALIDATION_ERROR',
        missingFields: requiredFields
      });
    }

    // Check if company info already exists
    let companyInfo = await CompanyInfo.findOne().sort({ createdAt: -1 });

    if (companyInfo) {
      // Update existing record
      const updateData = {
        legalName: legalName.trim(),
        taxId: taxId ? taxId.trim() : '',
        registrationNumber: registrationNumber ? registrationNumber.trim() : '',
        address: address ? address.trim() : '',
        city: city ? city.trim() : '',
        state: state ? state.trim() : '',
        zipCode: zipCode ? zipCode.trim() : '',
        country: country ? country.trim() : '',
        phone: phone ? phone.trim() : '',
        email: email ? email.trim().toLowerCase() : '',
        website: website ? website.trim() : '',
        fiscalYearStart: fiscalYearStart ? new Date(fiscalYearStart) : null,
        fiscalYearEnd: fiscalYearEnd ? new Date(fiscalYearEnd) : null,
        emailSettings: {
          smtpServer: smtpServer ? smtpServer.trim() : '',
          smtpPort: smtpPort ? smtpPort.trim() : '',
          username: username ? username.trim() : '',
          password: password ? password.trim() : '',
          fromEmail: fromEmail ? fromEmail.trim().toLowerCase() : '',
          fromName: fromName ? fromName.trim() : '',
          enableSSL: enableSSL === 'true' || enableSSL === true,
          enableTLS: enableTLS === 'true' || enableTLS === true
        }
      };

      // Handle file uploads
      if (req.files && req.files.logo && req.files.logo[0]) {
        updateData.logo = {
          filename: req.files.logo[0].filename,
          originalName: req.files.logo[0].originalname,
          path: req.files.logo[0].path.replace(/\\/g, '/'), // Normalize path to forward slashes
          mimetype: req.files.logo[0].mimetype,
          size: req.files.logo[0].size
        };
      }

      if (req.files && req.files.letterhead && req.files.letterhead[0]) {
        updateData.letterhead = {
          filename: req.files.letterhead[0].filename,
          originalName: req.files.letterhead[0].originalname,
          path: req.files.letterhead[0].path.replace(/\\/g, '/'), // Normalize path to forward slashes
          mimetype: req.files.letterhead[0].mimetype,
          size: req.files.letterhead[0].size
        };
      }

      console.log('Updating company info with data:', updateData);

      companyInfo = await CompanyInfo.findByIdAndUpdate(
        companyInfo._id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new record
      const companyData = {
        legalName: legalName.trim(),
        taxId: taxId ? taxId.trim() : '',
        registrationNumber: registrationNumber ? registrationNumber.trim() : '',
        address: address ? address.trim() : '',
        city: city ? city.trim() : '',
        state: state ? state.trim() : '',
        zipCode: zipCode ? zipCode.trim() : '',
        country: country ? country.trim() : '',
        phone: phone ? phone.trim() : '',
        email: email ? email.trim().toLowerCase() : '',
        website: website ? website.trim() : '',
        fiscalYearStart: fiscalYearStart ? new Date(fiscalYearStart) : null,
        fiscalYearEnd: fiscalYearEnd ? new Date(fiscalYearEnd) : null,
        emailSettings: {
          smtpServer: smtpServer ? smtpServer.trim() : '',
          smtpPort: smtpPort ? smtpPort.trim() : '',
          username: username ? username.trim() : '',
          password: password ? password.trim() : '',
          fromEmail: fromEmail ? fromEmail.trim().toLowerCase() : '',
          fromName: fromName ? fromName.trim() : '',
          enableSSL: enableSSL === 'true' || enableSSL === true,
          enableTLS: enableTLS === 'true' || enableTLS === true
        }
      };

      // Handle file uploads
      if (req.files && req.files.logo && req.files.logo[0]) {
        companyData.logo = {
          filename: req.files.logo[0].filename,
          originalName: req.files.logo[0].originalname,
          path: req.files.logo[0].path.replace(/\\/g, '/'), // Normalize path to forward slashes
          mimetype: req.files.logo[0].mimetype,
          size: req.files.logo[0].size
        };
      }

      if (req.files && req.files.letterhead && req.files.letterhead[0]) {
        companyData.letterhead = {
          filename: req.files.letterhead[0].filename,
          originalName: req.files.letterhead[0].originalname,
          path: req.files.letterhead[0].path.replace(/\\/g, '/'), // Normalize path to forward slashes
          mimetype: req.files.letterhead[0].mimetype,
          size: req.files.letterhead[0].size
        };
      }

      console.log('Creating new company info with data:', companyData);

      companyInfo = new CompanyInfo(companyData);
      await companyInfo.save();
    }

    // Convert file paths to URLs for response
    const response = {
      ...companyInfo.toObject(),
      logo: companyInfo.logo ? {
        ...companyInfo.logo,
        url: `/uploads/company/${companyInfo.logo.filename}`
      } : null,
      letterhead: companyInfo.letterhead ? {
        ...companyInfo.letterhead,
        url: `/uploads/company/${companyInfo.letterhead.filename}`
      } : null
    };

    console.log('Company info saved successfully:', response);

    // Add additional debugging
    console.log('Sending response to client...');
    console.log('Response status: 200');
    console.log('Response data:', {
      success: true,
      message: 'Company information saved successfully',
      data: response
    });

    res.json({
      success: true,
      message: 'Company information saved successfully',
      data: response
    });

  } catch (error) {
    console.error('Error saving company info:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        errors: validationErrors
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_ERROR'
      });
    }

    // Handle multer file upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
        error: 'FILE_SIZE_ERROR'
      });
    }

    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for logo and letterhead.',
        error: 'FILE_TYPE_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    });
  }
});

// DELETE - Delete company information
router.delete('/:id', async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findById(req.params.id);
    
    if (!companyInfo) {
      return res.status(404).json({
        success: false,
        message: 'Company information not found'
      });
    }

    // Delete uploaded files
    if (companyInfo.logo && companyInfo.logo.path) {
      if (fs.existsSync(companyInfo.logo.path)) {
        fs.unlinkSync(companyInfo.logo.path);
      }
    }

    if (companyInfo.letterhead && companyInfo.letterhead.path) {
      if (fs.existsSync(companyInfo.letterhead.path)) {
        fs.unlinkSync(companyInfo.letterhead.path);
      }
    }

    await CompanyInfo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Company information deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router; 