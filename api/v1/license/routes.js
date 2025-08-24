import express from 'express';
import LicenseKey from '../../../models/LicenseKey.js';
import { successResponse, errorResponse, notFoundResponse, validationError } from '../../../utils/apiResponse.js';

const router = express.Router();

// Activate with a license key
router.post('/activate', async (req, res) => {
  try {
    const { key } = req.body || {};
    const value = String(key || '').trim();
    if (!value) return validationError(res, 'key required');
    // Case-insensitive lookup
    let lic = await LicenseKey.findOne({ key: { $regex: `^${value}$`, $options: 'i' } }).lean();
    if (!lic) {
      // Optional auto-create for valid pattern keys (to reduce activation friction)
      const patternOk = /^SYN\d{6,}$/i.test(value);
      if (patternOk) {
        try {
          const created = await LicenseKey.create({ key: value.toUpperCase(), isActive: true });
          lic = created.toObject();
        } catch (e) {
          // If concurrent create fails due to race, try find again
          lic = await LicenseKey.findOne({ key: { $regex: `^${value}$`, $options: 'i' } }).lean();
        }
      }
      if (!lic) return notFoundResponse(res, 'License key');
    }
    if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) {
      return errorResponse(res, 'License expired', 'LICENSE_EXPIRED', 403);
    }
    if (!lic.isActive) {
      return errorResponse(res, 'License inactive', 'LICENSE_INACTIVE', 403);
    }
    await LicenseKey.updateOne({ _id: lic._id }, { activatedAt: new Date() }).exec();
    return successResponse(res, { key: lic.key, company: lic.company || null }, 'License activated');
  } catch (e) {
    return errorResponse(res, 'Activation failed', 'LICENSE_ERROR', 500);
  }
});

// Verify a license key (case-insensitive), no state changes
router.get('/verify', async (req, res) => {
  try {
    const value = String(req.query.key || '').trim();
    if (!value) return validationError(res, 'key required');
    const lic = await LicenseKey.findOne({ key: { $regex: `^${value}$`, $options: 'i' } }).lean();
    if (!lic) return notFoundResponse(res, 'License key');
    const expired = !!(lic.expiresAt && new Date(lic.expiresAt) < new Date());
    return successResponse(res, {
      exists: true,
      key: lic.key,
      isActive: lic.isActive,
      expired,
      company: lic.company || null,
    }, 'License info');
  } catch (e) {
    return errorResponse(res, 'Verification failed', 'LICENSE_ERROR', 500);
  }
});

export default router;


