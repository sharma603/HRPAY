import mongoose from 'mongoose';

const tasAttendanceSettingsSchema = new mongoose.Schema({
  lateThreshold: { type: Number, default: 0 },
  earlyDepartureThreshold: { type: Number, default: 0 },
  requireCheckoutPhoto: { type: Boolean, default: false },
  geoFence: {
    latitude: Number,
    longitude: Number,
    radius: Number
  }
}, { timestamps: true });

export default mongoose.model('TasAttendanceSettings', tasAttendanceSettingsSchema);


