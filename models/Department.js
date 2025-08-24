import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  // Department Code (e.g., IT, HR, FIN)
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  
  // Department Name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Department Description
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
  
  // Department Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Department Manager
  manager: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Department Location
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
  
  // Parent Department (for hierarchical structure)
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
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
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ parentDepartment: 1 });

// Update the updatedAt field before saving
departmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full department path
departmentSchema.virtual('fullPath').get(function() {
  if (this.parentDepartment) {
    return `${this.parentDepartment.name} > ${this.name}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Department', departmentSchema);
