import express from 'express';
import { 
  checkIn, 
  checkOut, 
  getAttendanceHistory, 
  getTodayAttendance, 
  getAttendanceStats,
  getAdminTodaySummary,
  getAdminOnDutyList,
  publicBarcodeScan,
  publicBarcodeCheck,
  toggleBarcodeAttendance,
  attendanceAnalysis,
  attendanceListByDate,
  attendanceRangeReport,
  streamAttendanceEvents,
  backfillEmployeeUserLinks,
  getTasDailyReport,
  getTasOnDutyReport,
  getTasAbsentSummary,
  getTasLateComeReport
} from './controller.js';
import auth, { requireRole } from '../../../middleware/auth.js';

const router = express.Router();

// Attendance Routes (all require authentication)
router.post('/check-in', auth, checkIn);
router.post('/check-out', auth, checkOut);
router.get('/history', auth, getAttendanceHistory);
router.get('/today', auth, getTodayAttendance);
router.get('/stats', auth, getAttendanceStats);
router.get('/admin/today-summary', auth, requireRole(['admin','superadmin']), getAdminTodaySummary);
// Make on-duty visible to any authenticated user
router.get('/admin/on-duty', auth, getAdminOnDutyList);
// Analysis/Reports
router.get('/analysis', auth, attendanceAnalysis);
router.get('/list-by-date', auth, attendanceListByDate);
router.get('/range-report', auth, attendanceRangeReport);

// Admin utility: ensure employees with barcodes have user links for attendance
router.post('/admin/backfill-links', auth, backfillEmployeeUserLinks);

// Public barcode attendance (no auth)
router.post('/public/barcode-scan', publicBarcodeScan);
router.get('/public/barcode-check', publicBarcodeCheck);

// Authenticated barcode attendance toggle
router.post('/barcode/toggle', auth, toggleBarcodeAttendance);

// Live attendance events stream (SSE)
router.get('/events/stream', streamAttendanceEvents);

// TAS Attendance Report routes
router.get('/tas/daily-report', auth, getTasDailyReport);
router.get('/tas/on-duty-report', auth, getTasOnDutyReport);
router.get('/tas/absent-summary', auth, getTasAbsentSummary);
router.get('/tas/late-come-report', auth, getTasLateComeReport);

export default router; 