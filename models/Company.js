import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  // Company Code (e.g., MAIN, SUBS, PART)
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  
  // Company Name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Company Description
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
  
  // Company Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Company Type (Parent, Subsidiary, Partner, etc.)
  type: {
    type: String,
    trim: true,
    default: 'Parent'
  },
  
  // Company Address
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' }
  },
  
  // Contact Information
  contact: {
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  
  // Company Details
  registrationNumber: {
    type: String,
    trim: true,
    default: ''
  },
  
  taxId: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Parent Company (for subsidiaries)
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  
  // Company CEO/Manager
  ceo: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Founded Year
  foundedYear: {
    type: Number,
    default: null
  },
  
  // Employee Count
  employeeCount: {
    type: Number,
    default: 0
  },
  
  // Industry
  industry: {
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

// Indexes for better query performance
companySchema.index({ code: 1 }, { unique: true });
companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ parentCompany: 1 });
companySchema.index({ type: 1 });

// Update the updatedAt field before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full company path
companySchema.virtual('fullPath').get(function() {
  if (this.parentCompany) {
    return `${this.parentCompany.name} > ${this.name}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

export default mongoose.model('Company', companySchema);
