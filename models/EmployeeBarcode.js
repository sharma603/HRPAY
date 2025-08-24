import mongoose from 'mongoose';

const employeeBarcodeSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  format: {
    type: String,
    trim: true,
    default: 'barcode', // e.g., 'barcode', 'qr'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
  },
  notes: String,
}, {
  timestamps: true,
});

employeeBarcodeSchema.index({ code: 1 }, { unique: true });
employeeBarcodeSchema.index({ employeeId: 1, isActive: 1 });

const EmployeeBarcode = mongoose.model('EmployeeBarcode', employeeBarcodeSchema);
export default EmployeeBarcode;


