import LicenseKey from '../models/LicenseKey.js';

export default async function requireLicense(req, res, next) {
  try {
    const headerKey = String(req.headers['x-license-key'] || '').trim().toUpperCase();
    if (!headerKey) {
      return res.status(403).json({ success: false, error: 'Missing license key', code: 'LICENSE_MISSING' });
    }
    const lic = await LicenseKey.findOne({ key: headerKey }).lean();
    if (!lic) return res.status(403).json({ success: false, error: 'Invalid license key', code: 'LICENSE_INVALID' });
    if (!lic.isActive) return res.status(403).json({ success: false, error: 'License inactive', code: 'LICENSE_INACTIVE' });
    if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) {
      return res.status(403).json({ success: false, error: 'License expired', code: 'LICENSE_EXPIRED' });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, error: 'License verification failed', code: 'LICENSE_ERROR' });
  }
}


