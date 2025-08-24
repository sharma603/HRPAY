import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const subDepartmentSchema = new mongoose.Schema({
  // Sub-Department Code (e.g., IT-DEV, IT-SUPP, HR-REC)
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  
  // Sub-Department Name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Sub-Department Description
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
  
  // Sub-Department Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Sub-Department Manager
  manager: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Sub-Department Location
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
  
  // Parent Department this sub-department belongs to
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  
  // Division this sub-department belongs to
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    default: null
  },
  
  // Company this sub-department belongs to
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  
  // Sub-Department Type (Team, Unit, Section, etc.)
  type: {
    type: String,
    trim: true,
    default: 'Team'
  },
  
  // Specialization Area
  specialization: {
    type: String,
    trim: true,
    default: ''
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

// Apply pagination plugin
subDepartmentSchema.plugin(mongoosePaginate);

// Indexes for better query performance
subDepartmentSchema.index({ code: 1 }, { unique: true });
subDepartmentSchema.index({ name: 1 });
subDepartmentSchema.index({ isActive: 1 });
subDepartmentSchema.index({ parentDepartment: 1 });
subDepartmentSchema.index({ division: 1 });
subDepartmentSchema.index({ company: 1 });

// Update the updatedAt field before saving
subDepartmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full sub-department path
subDepartmentSchema.virtual('fullPath').get(function() {
  if (this.parentDepartment) {
    return `${this.parentDepartment.name} > ${this.name}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
subDepartmentSchema.set('toJSON', { virtuals: true });
subDepartmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('SubDepartment', subDepartmentSchema);
