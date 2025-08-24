import mongoose from 'mongoose';

const divisionSchema = new mongoose.Schema({
  // Division Code (e.g., TECH, OPS, ADMIN)
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  
  // Division Name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Division Description
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  // ERP Code for integration
  erpCode: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Division Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Division Head
  divisionHead: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Division Location
  location: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Budget Information
  budget: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Employee Count
  employeeCount: {
    type: Number,
    default: 0
  },
  
  // Parent Division (for hierarchical structure)
  parentDivision: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    default: null
  },
  
  // Company this division belongs to
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
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

// Indexes for better query performance
divisionSchema.index({ code: 1 }, { unique: true });
divisionSchema.index({ name: 1 });
divisionSchema.index({ isActive: 1 });
divisionSchema.index({ parentDivision: 1 });
divisionSchema.index({ company: 1 });

// Update the updatedAt field before saving
divisionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full division path
divisionSchema.virtual('fullPath').get(function() {
  if (this.parentDivision) {
    return `${this.parentDivision.name} > ${this.name}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
divisionSchema.set('toJSON', { virtuals: true });
divisionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Division', divisionSchema);
