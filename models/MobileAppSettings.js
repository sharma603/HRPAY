import mongoose from 'mongoose';

const mobileAppSettingsSchema = new mongoose.Schema({
  // App Information
  appName: {
    type: String,
    required: true,
    trim: true,
    default: 'SYNERGY ERP HR'
  },
  version: {
    type: String,
    required: true,
    trim: true,
    default: '1.2.0'
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    default: 'Android'
  },
  downloadUrl: {
    type: String,
    trim: true,
    default: 'https://play.google.com/store/apps/details?id=com.synergy.erp.hr'
  },

  // App Settings & Control
  forceUpdate: {
    type: Boolean,
    default: false
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  silentInstallation: {
    type: Boolean,
    default: false
  },
  autoUpdate: {
    type: Boolean,
    default: true
  },

  // Access Control & Security
  accessControl: {
    requireMFA: {
      type: Boolean,
      default: false
    },
    requireSSO: {
      type: Boolean,
      default: false
    },
    geoFencing: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedCountries: [String],
      blockedCountries: [String]
    },
    timeRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      allowedHours: {
        start: String, // "09:00"
        end: String    // "17:00"
      },
      allowedDays: [Number] // [1,2,3,4,5] for Mon-Fri
    },
    roleBasedAccess: {
      enabled: {
        type: Boolean,
        default: false
      },
      roles: [{
        name: String,
        permissions: [String],
        allowedFeatures: [String]
      }]
    }
  },

  // Security Controls
  security: {
    appLevelVPN: {
      type: Boolean,
      default: false
    },
    dataEncryption: {
      atRest: {
        type: Boolean,
        default: true
      },
      inTransit: {
        type: Boolean,
        default: true
      }
    },
    jailbreakDetection: {
      type: Boolean,
      default: true
    },
    remoteWipe: {
      type: Boolean,
      default: false
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      maxAge: {
        type: Number,
        default: 90 // days
      }
    }
  },

  // Content Management
  contentManagement: {
    secureDocumentSharing: {
      type: Boolean,
      default: true
    },
    contentExpiration: {
      enabled: {
        type: Boolean,
        default: false
      },
      defaultExpiryDays: {
        type: Number,
        default: 30
      }
    },
    digitalRightsManagement: {
      type: Boolean,
      default: false
    },
    allowedFileTypes: [String],
    maxFileSize: {
      type: Number,
      default: 50 // MB
    }
  },

  // Build Information
  currentBuild: {
    version: String,
    buildNumber: String,
    releaseDate: Date,
    downloadUrl: String,
    changelog: String,
    minOSVersion: String,
    targetOSVersion: String,
    buildType: {
      type: String,
      enum: ['debug', 'release', 'beta', 'alpha'],
      default: 'release'
    }
  },

  // App Statistics & Monitoring
  statistics: {
    totalDownloads: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0 // minutes
    },
    dailyActiveUsers: {
      type: Number,
      default: 0
    },
    monthlyActiveUsers: {
      type: Number,
      default: 0
    },
    crashReports: {
      type: Number,
      default: 0
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  },

  // Compliance & Audit
  compliance: {
    gdprCompliant: {
      type: Boolean,
      default: false
    },
    hipaaCompliant: {
      type: Boolean,
      default: false
    },
    auditTrail: {
      enabled: {
        type: Boolean,
        default: true
      },
      retentionDays: {
        type: Number,
        default: 365
      }
    },
    dataResidency: {
      enabled: {
        type: Boolean,
        default: false
      },
      regions: [String]
    }
  },

  // Branding & Customization
  branding: {
    primaryColor: {
      type: String,
      default: '#1976d2'
    },
    secondaryColor: {
      type: String,
      default: '#1565c0'
    },
    logoUrl: String,
    splashScreenUrl: String,
    appIconUrl: String,
    customCSS: String
  },

  // Deployment Settings
  deployment: {
    staging: {
      enabled: {
        type: Boolean,
        default: false
      },
      autoDeploy: {
        type: Boolean,
        default: false
      },
      environment: String
    },
    beta: {
      enabled: {
        type: Boolean,
        default: false
      },
      testUsers: [String],
      autoDeploy: {
        type: Boolean,
        default: false
      }
    },
    production: {
      enabled: {
        type: Boolean,
        default: false
      },
      autoDeploy: {
        type: Boolean,
        default: false
      },
      rollbackEnabled: {
        type: Boolean,
        default: true
      }
    }
  },

  // Performance & Monitoring
  performance: {
    uptime: {
      type: Number,
      default: 99.9
    },
    responseTime: {
      type: Number,
      default: 85 // ms
    },
    crashRate: {
      type: Number,
      default: 0.1
    },
    monitoring: {
      enabled: {
        type: Boolean,
        default: true
      },
      alertThresholds: {
        cpu: {
          type: Number,
          default: 80
        },
        memory: {
          type: Number,
          default: 85
        },
        disk: {
          type: Number,
          default: 90
        }
      }
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
mobileAppSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('MobileAppSettings', mobileAppSettingsSchema);
