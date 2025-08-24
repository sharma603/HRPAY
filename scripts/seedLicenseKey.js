import mongoose from 'mongoose';
import config from '../config/config.js';
import LicenseKey from '../models/LicenseKey.js';

const key = (process.argv[2] || '').toUpperCase();
if (!key) {
  console.error('Usage: node scripts/seedLicenseKey.js <LICENSE_KEY>');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('✅ Connected to MongoDB');

    const existing = await LicenseKey.findOne({ key }).lean();
    if (existing) {
      console.log(`ℹ️  License key already exists: ${key}`);
      process.exit(0);
    }

    await LicenseKey.create({ key, isActive: true });
    console.log(`✅ Inserted license key: ${key}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to insert license key:', e);
    process.exit(1);
  }
}

run();


