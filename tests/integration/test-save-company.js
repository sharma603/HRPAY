import mongoose from 'mongoose';
import config from './config/config.js';
import CompanyInfo from './models/CompanyInfo.js';

const saveShanoonEngineering = async () => {
  try {
    console.log('Saving SHANOON ENGINEERING company info...');
    console.log('Connection URL:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Create SHANOON ENGINEERING company info
    const shanoonData = {
      legalName: 'SHANOON ENGINEERING',
      taxId: 'TAX123456',
      registrationNumber: 'REG789012',
      address: '123 Engineering Street',
      city: 'Engineering City',
      state: 'Engineering State',
      zipCode: '12345',
      country: 'Engineering Country',
      phone: '+1-555-123-4567',
      email: 'info@shanoonengineering.com',
      website: 'https://shanoonengineering.com',
      fiscalYearStart: new Date('2024-01-01'),
      fiscalYearEnd: new Date('2024-12-31'),
      emailSettings: {
        smtpServer: 'smtp.shanoonengineering.com',
        smtpPort: '587',
        username: 'info@shanoonengineering.com',
        password: 'testpassword',
        fromEmail: 'info@shanoonengineering.com',
        fromName: 'SHANOON ENGINEERING',
        enableSSL: true,
        enableTLS: false
      }
    };
    
    // Delete existing company info
    await CompanyInfo.deleteMany({});
    console.log('✅ Cleared existing company info');
    
    // Create new company info
    const companyInfo = new CompanyInfo(shanoonData);
    await companyInfo.save();
    
    console.log('✅ SHANOON ENGINEERING saved successfully!');
    console.log('Company ID:', companyInfo._id);
    console.log('Legal Name:', companyInfo.legalName);
    
    // Verify it was saved
    const retrieved = await CompanyInfo.findOne().sort({ createdAt: -1 });
    console.log('✅ Company info retrieved successfully!');
    console.log('Retrieved Legal Name:', retrieved.legalName);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    console.log('🎉 SHANOON ENGINEERING is now set as the company name!');
    
  } catch (error) {
    console.error('❌ Failed to save company info:', error.message);
    console.error('Error details:', error);
  }
};

saveShanoonEngineering(); 