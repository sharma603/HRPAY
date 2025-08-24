import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    method: {
      type: String,
      enum: ['face', 'fingerprint', 'barcode', 'manual'],
      required: true
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      appVersion: String
    },
    // Optional payloads captured at check-in time
    faceData: mongoose.Schema.Types.Mixed,
    fingerprintData: mongoose.Schema.Types.Mixed,
    barcodeData: String
  },
  checkOut: {
    time: {
      type: Date
    },
    method: {
      type: String,
      enum: ['face', 'fingerprint', 'barcode', 'manual']
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      appVersion: String
    },
    // Optional payloads captured at check-out time
    faceData: mongoose.Schema.Types.Mixed,
    fingerprintData: mongoose.Schema.Types.Mixed,
    barcodeData: String
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present'
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  indexes: [
    { userId: 1, date: 1 },
    { employeeId: 1, date: 1 },
    { date: 1 },
    { status: 1 }
  ]
});

// Total hours is maintained in controllers to support multiple sessions per day

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance; 