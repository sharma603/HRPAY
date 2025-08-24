import express from 'express';
import authRoutes from './auth/routes.js';
import dashboardRoutes from './dashboard/routes.js';
import settingsRoutes from './settings/routes.js';
import notificationsRoutes from './notifications/routes.js';
import companyRoutes from './company/routes.js';
import attendanceRoutes from './attendance/routes.js';
import mobileAppRoutes from './mobileApp/routes.js';
import employeeBarcodeRoutes from './employee-barcodes/index.js';
import employeeRoutes from './employees/routes.js';
import designationRoutes from './designation/routes.js';
import departmentRoutes from './department/routes.js';
import subDepartmentRoutes from './subDepartment/routes.js';

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/company', companyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/mobile-app', mobileAppRoutes);
router.use('/employee-barcodes', employeeBarcodeRoutes);
router.use('/employees', employeeRoutes);
router.use('/designations', designationRoutes);
router.use('/departments', departmentRoutes);
router.use('/sub-departments', subDepartmentRoutes);

// API Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router; 