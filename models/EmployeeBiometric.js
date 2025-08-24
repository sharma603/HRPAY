import mongoose from 'mongoose';

const biometricSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['fingerprint', 'face'], required: true },
  format: { type: String, default: 'unknown' }, // e.g., ISO, ANSI, embedding
  dataEnc: { type: String, required: false }, // base64 of encrypted template
  iv: { type: String },
  tag: { type: String },
  size: { type: Number, default: 0 },
  verifiedAt: { type: Date },
  deviceInfo: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('EmployeeBiometric', biometricSchema);


