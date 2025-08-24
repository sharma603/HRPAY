import mongoose from 'mongoose';

const companyInfoSchema = new mongoose.Schema({
  // Legal Information
  legalName: {
    type: String,
    required: true,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },

  // Address Information
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },

  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },

  // Fiscal Year Settings
  fiscalYearStart: {
    type: Date
  },
  fiscalYearEnd: {
    type: Date
  },

  // File Uploads
  logo: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  },
  letterhead: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  },

  // Email Settings
  emailSettings: {
    smtpServer: {
      type: String,
      trim: true
    },
    smtpPort: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      trim: true
    },
    fromEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    fromName: {
      type: String,
      trim: true
    },
    enableSSL: {
      type: Boolean,
      default: true
    },
    enableTLS: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
companyInfoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('CompanyInfo', companyInfoSchema); 