import mongoose from 'mongoose';

const tasRamadanPeriodSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  dailyReduction: { type: Number, default: 0 },
  shifts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TasShift' }]
}, { timestamps: true });

export default mongoose.model('TasRamadanPeriod', tasRamadanPeriodSchema);


