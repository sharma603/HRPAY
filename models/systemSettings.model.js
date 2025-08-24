import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  // Company Information
  companyInfo: {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    brandName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
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
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
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
    foundedYear: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },

  // System Configuration
  systemConfig: {
    systemName: {
      type: String,
      default: 'HRPAY',
      trim: true
    },
    version: {
      type: String,
      default: '1.0.0',
      trim: true
    },
    timezone: {
      type: String,
      default: 'Asia/Dubai',
      trim: true
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      trim: true
    },
    timeFormat: {
      type: String,
      default: '24',
      enum: ['12', '24']
    },
    language: {
      type: String,
      default: 'English',
      trim: true
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 4
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 480
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8,
        min: 6,
        max: 20
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      }
    }
  },

  // Security Settings
  securitySettings: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    emailVerification: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 480
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    passwordExpiry: {
      type: Number,
      default: 90,
      min: 0,
      max: 365
    },
    ipWhitelist: [{
      type: String,
      trim: true
    }],
    auditLogging: {
      type: Boolean,
      default: true
    },
    dataEncryption: {
      type: Boolean,
      default: true
    }
  },

  // Notification Settings
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    maintenanceAlerts: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    userActivityLogs: {
      type: Boolean,
      default: true
    }
  },

  // Logo and Branding
  logo: {
    url: {
      type: String,
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    size: {
      type: Number
    },
    mimeType: {
      type: String,
      trim: true
    }
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: '000000000000000000000000'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: '000000000000000000000000'
  }
}, {
  timestamps: true
});

// Index for faster queries
systemSettingsSchema.index({ 'companyInfo.companyName': 1 });

// Virtual for full address
systemSettingsSchema.virtual('companyInfo.fullAddress').get(function() {
  const address = this.companyInfo.address;
  const city = this.companyInfo.city;
  const state = this.companyInfo.state;
  const country = this.companyInfo.country;
  const postalCode = this.companyInfo.postalCode;
  
  const parts = [address, city, state, country, postalCode].filter(Boolean);
  return parts.join(', ');
});

// Method to get formatted company info
systemSettingsSchema.methods.getFormattedCompanyInfo = function() {
  return {
    name: this.companyInfo.companyName,
    brand: this.companyInfo.brandName,
    contact: {
      email: this.companyInfo.email,
      phone: this.companyInfo.phone,
      website: this.companyInfo.website
    },
    address: this.companyInfo.fullAddress,
    legal: {
      taxId: this.companyInfo.taxId,
      registrationNumber: this.companyInfo.registrationNumber
    }
  };
};

// Method to validate settings
systemSettingsSchema.methods.validateSettings = function() {
  const errors = [];
  
  if (!this.companyInfo.companyName) {
    errors.push('Company name is required');
  }
  
  if (this.companyInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.companyInfo.email)) {
    errors.push('Invalid email format');
  }
  
  if (this.systemConfig.sessionTimeout < 5 || this.systemConfig.sessionTimeout > 480) {
    errors.push('Session timeout must be between 5 and 480 minutes');
  }
  
  return errors;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings; 