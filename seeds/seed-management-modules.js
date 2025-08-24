import mongoose from 'mongoose';
import Department from '../models/Department.js';
import Designation from '../models/Designation.js';
import Division from '../models/Division.js';
import SubDepartment from '../models/SubDepartment.js';
import Company from '../models/Company.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get a default user for createdBy field
const getDefaultUser = async () => {
  try {
    let user = await User.findOne();
    if (!user) {
      // Create a default user if none exists
      user = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Created default user:', user.username);
    }
    return user;
  } catch (error) {
    console.error('Error getting default user:', error);
    throw error;
  }
};

// Seed Companies
const seedCompanies = async (defaultUser) => {
  try {
    const companies = [
      {
        code: 'MAIN',
        name: 'Main Company Ltd.',
        description: 'Primary business entity',
        type: 'Parent',
        address: {
          street: '123 Business Street',
          city: 'Business City',
          state: 'Business State',
          country: 'Business Country',
          zipCode: '12345'
        },
        contact: {
          phone: '+1-555-0123',
          email: 'info@maincompany.com',
          website: 'www.maincompany.com'
        },
        registrationNumber: 'REG123456',
        taxId: 'TAX789012',
        ceo: 'John Smith',
        foundedYear: 2020,
        industry: 'Technology',
        createdBy: defaultUser._id
      },
      {
        code: 'SUBS',
        name: 'Subsidiary Corp.',
        description: 'Subsidiary company',
        type: 'Subsidiary',
        address: {
          street: '456 Subsidiary Ave',
          city: 'Subsidiary City',
          state: 'Subsidiary State',
          country: 'Subsidiary Country',
          zipCode: '67890'
        },
        contact: {
          phone: '+1-555-0456',
          email: 'info@subsidiary.com',
          website: 'www.subsidiary.com'
        },
        registrationNumber: 'REG789012',
        taxId: 'TAX345678',
        ceo: 'Jane Doe',
        foundedYear: 2021,
        industry: 'Manufacturing',
        parentCompany: null, // Will be set after main company is created
        createdBy: defaultUser._id
      }
    ];

    const createdCompanies = await Company.insertMany(companies);
    console.log(`Created ${createdCompanies.length} companies`);

    // Update subsidiary with parent company reference
    if (createdCompanies.length > 1) {
      await Company.findByIdAndUpdate(createdCompanies[1]._id, {
        parentCompany: createdCompanies[0]._id
      });
      console.log('Updated subsidiary with parent company reference');
    }

    return createdCompanies;
  } catch (error) {
    console.error('Error seeding companies:', error);
    throw error;
  }
};

// Seed Divisions
const seedDivisions = async (defaultUser, companies) => {
  try {
    const divisions = [
      {
        code: 'TECH',
        name: 'Technology Division',
        description: 'Handles all technology-related operations',
        divisionHead: 'Tech Director',
        location: 'Tech Building',
        budget: '$2,000,000',
        company: companies[0]._id,
        createdBy: defaultUser._id
      },
      {
        code: 'OPS',
        name: 'Operations Division',
        description: 'Manages day-to-day operations',
        divisionHead: 'Operations Manager',
        location: 'Operations Center',
        budget: '$1,500,000',
        company: companies[0]._id,
        createdBy: defaultUser._id
      },
      {
        code: 'ADMIN',
        name: 'Administration Division',
        description: 'Handles administrative functions',
        divisionHead: 'Admin Director',
        location: 'Admin Building',
        budget: '$800,000',
        company: companies[0]._id,
        createdBy: defaultUser._id
      }
    ];

    const createdDivisions = await Division.insertMany(divisions);
    console.log(`Created ${createdDivisions.length} divisions`);

    return createdDivisions;
  } catch (error) {
    console.error('Error seeding divisions:', error);
    throw error;
  }
};

// Seed Departments
const seedDepartments = async (defaultUser, divisions) => {
  try {
    const departments = [
      {
        code: 'IT',
        name: 'Information Technology',
        description: 'Manages IT infrastructure and systems',
        manager: 'IT Manager',
        location: 'IT Department',
        budget: '$500,000',
        parentDepartment: null,
        createdBy: defaultUser._id
      },
      {
        code: 'HR',
        name: 'Human Resources',
        description: 'Manages human resources and employee relations',
        manager: 'HR Manager',
        location: 'HR Department',
        budget: '$300,000',
        parentDepartment: null,
        createdBy: defaultUser._id
      },
      {
        code: 'FIN',
        name: 'Finance',
        description: 'Handles financial operations and accounting',
        manager: 'Finance Manager',
        location: 'Finance Department',
        budget: '$400,000',
        parentDepartment: null,
        createdBy: defaultUser._id
      },
      {
        code: 'MKT',
        name: 'Marketing',
        description: 'Manages marketing and promotional activities',
        manager: 'Marketing Manager',
        location: 'Marketing Department',
        budget: '$250,000',
        parentDepartment: null,
        createdBy: defaultUser._id
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`Created ${createdDepartments.length} departments`);

    return createdDepartments;
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
};

// Seed Sub-Departments
const seedSubDepartments = async (defaultUser, departments, divisions, companies) => {
  try {
    const subDepartments = [
      {
        code: 'IT-DEV',
        name: 'IT Development',
        description: 'Software development team',
        manager: 'Dev Team Lead',
        location: 'Dev Lab',
        budget: '$200,000',
        parentDepartment: departments[0]._id, // IT Department
        division: divisions[0]._id, // Technology Division
        company: companies[0]._id,
        type: 'Team',
        specialization: 'Software Development',
        createdBy: defaultUser._id
      },
      {
        code: 'IT-SUPP',
        name: 'IT Support',
        description: 'Technical support team',
        manager: 'Support Team Lead',
        location: 'Support Center',
        budget: '$150,000',
        parentDepartment: departments[0]._id, // IT Department
        division: divisions[0]._id, // Technology Division
        company: companies[0]._id,
        type: 'Team',
        specialization: 'Technical Support',
        createdBy: defaultUser._id
      },
      {
        code: 'HR-REC',
        name: 'HR Recruitment',
        description: 'Recruitment and talent acquisition',
        manager: 'Recruitment Specialist',
        location: 'Recruitment Office',
        budget: '$100,000',
        parentDepartment: departments[1]._id, // HR Department
        division: divisions[2]._id, // Administration Division
        company: companies[0]._id,
        type: 'Unit',
        specialization: 'Recruitment',
        createdBy: defaultUser._id
      },
      {
        code: 'FIN-ACC',
        name: 'Finance Accounting',
        description: 'Accounting and bookkeeping',
        manager: 'Senior Accountant',
        location: 'Accounting Office',
        budget: '$200,000',
        parentDepartment: departments[2]._id, // Finance Department
        division: divisions[1]._id, // Operations Division
        company: companies[0]._id,
        type: 'Unit',
        specialization: 'Accounting',
        createdBy: defaultUser._id
      }
    ];

    const createdSubDepartments = await SubDepartment.insertMany(subDepartments);
    console.log(`Created ${createdSubDepartments.length} sub-departments`);

    return createdSubDepartments;
  } catch (error) {
    console.error('Error seeding sub-departments:', error);
    throw error;
  }
};

// Seed Designations
const seedDesignations = async (defaultUser, departments) => {
  try {
    const designations = [
      {
        code: 'CEO',
        title: 'Chief Executive Officer',
        description: 'Top executive position',
        level: 'Executive',
        department: departments[0]._id, // IT Department
        minSalary: 150000,
        maxSalary: 300000,
        requiredSkills: ['Leadership', 'Strategic Planning', 'Business Acumen'],
        createdBy: defaultUser._id
      },
      {
        code: 'MGR',
        title: 'Manager',
        description: 'Department or team manager',
        level: 'Senior',
        department: departments[0]._id, // IT Department
        minSalary: 80000,
        maxSalary: 120000,
        requiredSkills: ['Management', 'Communication', 'Problem Solving'],
        createdBy: defaultUser._id
      },
      {
        code: 'DEV',
        title: 'Software Developer',
        description: 'Develops software applications',
        level: 'Mid',
        department: departments[0]._id, // IT Department
        minSalary: 60000,
        maxSalary: 90000,
        requiredSkills: ['Programming', 'Problem Solving', 'Team Work'],
        createdBy: defaultUser._id
      },
      {
        code: 'HR_SP',
        title: 'HR Specialist',
        description: 'Human resources specialist',
        level: 'Mid',
        department: departments[1]._id, // HR Department
        minSalary: 50000,
        maxSalary: 75000,
        requiredSkills: ['HR Management', 'Communication', 'Employee Relations'],
        createdBy: defaultUser._id
      },
      {
        code: 'ACC',
        title: 'Accountant',
        description: 'Financial accounting specialist',
        level: 'Mid',
        department: departments[2]._id, // Finance Department
        minSalary: 55000,
        maxSalary: 80000,
        requiredSkills: ['Accounting', 'Financial Analysis', 'Attention to Detail'],
        createdBy: defaultUser._id
      }
    ];

    const createdDesignations = await Designation.insertMany(designations);
    console.log(`Created ${createdDesignations.length} designations`);

    return createdDesignations;
  } catch (error) {
    console.error('Error seeding designations:', error);
    throw error;
  }
};

// Main seeding function
const seedAll = async () => {
  try {
    await connectDB();
    
    // Check if data already exists
    const existingData = await Company.countDocuments();
    if (existingData > 0) {
      console.log('Data already exists. Skipping seeding.');
      process.exit(0);
    }

    console.log('Starting to seed management modules...');

    // Get default user
    const defaultUser = await getDefaultUser();

    // Seed in order (companies first, then divisions, departments, etc.)
    const companies = await seedCompanies(defaultUser);
    const divisions = await seedDivisions(defaultUser, companies);
    const departments = await seedDepartments(defaultUser, divisions);
    const subDepartments = await seedSubDepartments(defaultUser, departments, divisions, companies);
    const designations = await seedDesignations(defaultUser, departments);

    console.log('✅ All management modules seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Divisions: ${divisions.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Sub-Departments: ${subDepartments.length}`);
    console.log(`   - Designations: ${designations.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll();
}

export { seedAll };
