import mongoose from 'mongoose';

const tasAreaSchema = new mongoose.Schema({
  projectNumber: { type: String, required: true, unique: true, trim: true },
  projectName: { type: String, required: true, trim: true },
  siteName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true }
}, { timestamps: true });

tasAreaSchema.index({ projectNumber: 1 }, { unique: true });

export default mongoose.model('TasArea', tasAreaSchema);


