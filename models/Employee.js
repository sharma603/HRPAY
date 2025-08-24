import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'resigned'],
    default: 'active'
  },
  avatar: {
    url: String,
    filename: String,
    path: String
  },
  title: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  company: {
    type: String,
    trim: true
  },
  employer: {
    type: String,
    trim: true
  },
  subDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubDepartment'
  },
  workInfo: {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    location: String,
    workType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern']
    },
    shift: String,
    shiftStart: Date,
    subDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubDepartment'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ subDepartment: 1 });
employeeSchema.index({ status: 1 });

// Pre-save middleware to generate employee ID if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    // Generate employee ID: EMP + current year + 4 digit sequence
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Employee', employeeSchema); 