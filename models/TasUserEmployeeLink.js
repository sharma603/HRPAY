import mongoose from 'mongoose';

const tasUserEmployeeLinkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  accessLevel: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  linkedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('TasUserEmployeeLink', tasUserEmployeeLinkSchema);


