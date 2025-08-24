import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'TasShift' },
  day: { type: String }
}, { _id: false });

const tasWeeklyRosterSchema = new mongoose.Schema({
  weekStartDate: { type: Date, required: true },
  assignments: [assignmentSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('TasWeeklyRoster', tasWeeklyRosterSchema);


