import mongoose from "mongoose";

const attendanceEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  type: { type: String, enum: ['check-in', 'check-out'], required: true },
  time: { type: Date, required: true, default: Date.now },
  method: { type: String, enum: ['face', 'fingerprint', 'barcode', 'manual'], required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    appVersion: String,
    // capture any additional device metadata
    meta: mongoose.Schema.Types.Mixed
  },
  payload: mongoose.Schema.Types.Mixed, // faceData, fingerprintData, barcode, etc
  attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

attendanceEventSchema.index({ userId: 1, time: -1 });
attendanceEventSchema.index({ employeeId: 1, time: -1 });
attendanceEventSchema.index({ type: 1, time: -1 });
attendanceEventSchema.index({ location: '2dsphere' });

const AttendanceEvent = mongoose.model('AttendanceEvent', attendanceEventSchema);
export default AttendanceEvent;

