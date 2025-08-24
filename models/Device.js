import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  notes: { type: String, trim: true },
  lastActive: { type: Date, default: Date.now },
  meta: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);


