import mongoose from 'mongoose';
import CommonCode from '../models/CommonCode.js';
import config from '../config/config.js';

// Create a dummy user ID for seeding
const dummyUserId = new mongoose.Types.ObjectId();

// Sample data for common codes
const sampleCodes = [
  // GENDER codes
  {
    codeType: 'GENDER',
    code: 'M',
    description: 'Male',
    erpCode: 'M',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'GENDER',
    code: 'F',
    description: 'Female',
    erpCode: 'F',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'GENDER',
    code: 'O',
    description: 'Other',
    erpCode: 'O',
    isActive: true,
    createdBy: dummyUserId
  },

  // HRM DIVISION codes
  {
    codeType: 'HRM DIVISION',
    code: 'IT',
    description: 'Information Technology',
    erpCode: 'IT_DIV',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM DIVISION',
    code: 'HR',
    description: 'Human Resources',
    erpCode: 'HR_DIV',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM DIVISION',
    code: 'FIN',
    description: 'Finance',
    erpCode: 'FIN_DIV',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM DIVISION',
    code: 'MKT',
    description: 'Marketing',
    erpCode: 'MKT_DIV',
    isActive: true,
    createdBy: dummyUserId
  },

  // HRM COMPANY codes
  {
    codeType: 'HRM COMPANY',
    code: 'MAIN',
    description: 'Main Company',
    erpCode: 'MAIN_COMP',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM COMPANY',
    code: 'SUB1',
    description: 'Subsidiary 1',
    erpCode: 'SUB1_COMP',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM COMPANY',
    code: 'SUB2',
    description: 'Subsidiary 2',
    erpCode: 'SUB2_COMP',
    isActive: true,
    createdBy: dummyUserId
  },

  // COMPANY DOCS codes
  {
    codeType: 'COMPANY DOCS',
    code: 'POL',
    description: 'Policy Document',
    erpCode: 'POL_DOC',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'COMPANY DOCS',
    code: 'PROC',
    description: 'Procedure Document',
    erpCode: 'PROC_DOC',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'COMPANY DOCS',
    code: 'FORM',
    description: 'Form Document',
    erpCode: 'FORM_DOC',
    isActive: true,
    createdBy: dummyUserId
  },

  // HRM PAYMENT TYPE codes
  {
    codeType: 'HRM PAYMENT TYPE',
    code: 'SAL',
    description: 'Salary',
    erpCode: 'SAL_PAY',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM PAYMENT TYPE',
    code: 'BON',
    description: 'Bonus',
    erpCode: 'BON_PAY',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM PAYMENT TYPE',
    code: 'ALL',
    description: 'Allowance',
    erpCode: 'ALL_PAY',
    isActive: true,
    createdBy: dummyUserId
  },

  // HRM LOCATION codes
  {
    codeType: 'HRM LOCATION',
    code: 'HQ',
    description: 'Headquarters',
    erpCode: 'HQ_LOC',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM LOCATION',
    code: 'BR1',
    description: 'Branch Office 1',
    erpCode: 'BR1_LOC',
    isActive: true,
    createdBy: dummyUserId
  },
  {
    codeType: 'HRM LOCATION',
    code: 'BR2',
    description: 'Branch Office 2',
    erpCode: 'BR2_LOC',
    isActive: true,
    createdBy: dummyUserId
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed the database
const seedCommonCodes = async () => {
  try {
    await connectDB();

    // Clear existing codes
    await CommonCode.deleteMany({});
    console.log('Cleared existing common codes');

    // Insert sample codes
    const createdCodes = await CommonCode.insertMany(sampleCodes);
    console.log(`Successfully created ${createdCodes.length} common codes`);

    // Display summary
    const codeTypes = await CommonCode.distinct('codeType');
    console.log('\nCode types created:');
    codeTypes.forEach(type => {
      const count = createdCodes.filter(code => code.codeType === type).length;
      console.log(`- ${type}: ${count} codes`);
    });

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding common codes:', error);
    process.exit(1);
  }
};

// Run the seeding
seedCommonCodes();
