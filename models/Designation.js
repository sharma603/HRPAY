import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema({
  // Designation Code (e.g., MGR, DEV, HR)
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  
  // Designation Title
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Designation Description
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
  
  // Designation Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Designation Level (Junior, Mid, Senior, etc.)
  level: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Department this designation belongs to
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  
  // Salary Range
  minSalary: {
    type: Number,
    default: 0
  },
  
  maxSalary: {
    type: Number,
    default: 0
  },
  
  // Required Skills
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
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
designationSchema.index({ code: 1 }, { unique: true });
designationSchema.index({ title: 1 });
designationSchema.index({ isActive: 1 });
designationSchema.index({ department: 1 });
designationSchema.index({ level: 1 });

// Update the updatedAt field before saving
designationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full designation path
designationSchema.virtual('fullPath').get(function() {
  if (this.department) {
    return `${this.department.name} > ${this.title}`;
  }
  return this.title;
});

// Ensure virtual fields are serialized
designationSchema.set('toJSON', { virtuals: true });
designationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Designation', designationSchema);
