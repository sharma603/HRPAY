import mongoose from 'mongoose';
import config from './config/config.js';
import CompanyInfo from './models/CompanyInfo.js';

const testCompanyInfo = async () => {
  try {
    console.log('Testing Company Info API...');
    console.log('Connection URL:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating company info
    const testCompanyData = {
      legalName: 'Test Company Ltd',
      taxId: 'TAX123456',
      registrationNumber: 'REG789012',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
      phone: '+1-555-123-4567',
      email: 'test@company.com',
      website: 'https://testcompany.com',
      fiscalYearStart: new Date('2024-01-01'),
      fiscalYearEnd: new Date('2024-12-31'),
      emailSettings: {
        smtpServer: 'smtp.test.com',
        smtpPort: '587',
        username: 'test@company.com',
        password: 'testpassword',
        fromEmail: 'test@company.com',
        fromName: 'Test Company',
        enableSSL: true,
        enableTLS: false
      }
    };
    
    console.log('Creating test company info...');
    const companyInfo = new CompanyInfo(testCompanyData);
    await companyInfo.save();
    
    console.log('✅ Company info created successfully!');
    console.log('Company ID:', companyInfo._id);
    console.log('Legal Name:', companyInfo.legalName);
    
    // Test retrieving company info
    const retrieved = await CompanyInfo.findById(companyInfo._id);
    console.log('✅ Company info retrieved successfully!');
    console.log('Retrieved Legal Name:', retrieved.legalName);
    
    // Clean up test data
    await CompanyInfo.findByIdAndDelete(companyInfo._id);
    console.log('✅ Test data cleaned up successfully!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    console.log('🎉 Company Info API is working correctly!');
    
  } catch (error) {
    console.error('❌ Company Info test failed:', error.message);
    console.error('Error details:', error);
  }
};

testCompanyInfo(); 