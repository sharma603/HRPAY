import mongoose from 'mongoose';

const breakSchema = new mongoose.Schema({
  description: String,
  startTime: String,
  endTime: String,
  allowedHours: String
}, { _id: false });

const ramadanSchema = new mongoose.Schema({
  description: String,
  startTime: String,
  endTime: String,
  allowedHours: String
}, { _id: false });

const tasShiftSchema = new mongoose.Schema({
  area: { type: mongoose.Schema.Types.ObjectId, ref: 'TasArea' },
  code: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  title: { type: String, trim: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  lateStart: { type: String },
  earlyEnd: { type: String },
  normalHours: { type: String },
  startOtAfter: { type: String },
  shiftEndingNextDay: { type: Boolean, default: false },
  otShift: { type: Boolean, default: false },
  openShift: { type: Boolean, default: false },
  strictTime: { type: Boolean, default: false },
  splitShift: { type: Boolean, default: false },
  breaks: [breakSchema],
  weeklyOff: { type: Map, of: Boolean, default: {} },
  ramadan: [ramadanSchema],
  geoCenter: {
    lat: { type: Number },
    lng: { type: Number }
  },
  geoRadius: { type: Number }
}, { timestamps: true });

export default mongoose.model('TasShift', tasShiftSchema);


