import mongoose from 'mongoose';

const commonCodeSchema = new mongoose.Schema({
  // Code Type (e.g., GENDER, HRM DIVISION, etc.)
  codeType: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  
  // Individual Code Entry
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  
  // Description of the code
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // ERP Code for integration
  erpCode: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Status of the code (active/inactive)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
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

// Compound index to ensure unique codes within each code type
commonCodeSchema.index({ codeType: 1, code: 1 }, { unique: true });

// Update the updatedAt field before saving
commonCodeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('CommonCode', commonCodeSchema);
