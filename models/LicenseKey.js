import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  company: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  activatedAt: { type: Date },
  activatedBy: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('LicenseKey', licenseSchema);


