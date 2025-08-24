import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'important', 'urgent', 'holiday', 'event'],
    default: 'general'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'department', 'specific'],
    default: 'all'
  },
  departments: [{
    type: String,
    trim: true
  }],

  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String
  }]
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement; 