import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import config from '../config/config.js';

const sampleEmployees = [
  {
    employeeId: 'IN0551',
    title: 'Mr.',
    firstName: 'AAZAD MANSURI SAHEB HUSSAIN',
    lastName: 'MANSURI',
    dob: new Date('1985-03-15'),
    nationality: 'Indian',
    empStatus: 'Working',
    dateOfJoining: new Date('2023-01-15'),
    religion: 'Islam',
    contractType: 'permanent',
    company: 'ScriptQube',
    department: 'CONSTRUCTION',
    employer: 'ScriptQube HR',
    designation: 'ELECTRICIAN LABOUR',
    division: 'North',
    location: 'Site',
    payGroup: 'Group A',
    payThrough: 'Bank Transfer',
    currency: 'Qatari Riyal',
    basicSalary: 85000,
    salaryType: 'Monthly',
    bankName: 'Qatar National Bank',
    email: 'aazad.mansuri@scriptqube.com',
    phone: '+974-555-0123',
    status: 'Active'
  },
  {
    employeeId: 'EG0152',
    title: 'Mr.',
    firstName: 'ABDELHAFEZ',
    lastName: 'MOHAMED',
    dob: new Date('1990-07-22'),
    nationality: 'Egyptian',
    empStatus: 'Working',
    dateOfJoining: new Date('2022-08-20'),
    religion: 'Islam',
    contractType: 'permanent',
    company: 'ScriptQube',
    department: 'CONSTRUCTION',
    employer: 'ScriptQube HR',
    designation: 'TILE MASON',
    division: 'South',
    location: 'Site',
    payGroup: 'Group B',
    payThrough: 'Bank Transfer',
    currency: 'Qatari Riyal',
    basicSalary: 75000,
    salaryType: 'Monthly',
    bankName: 'Commercial Bank',
    email: 'abdelhafez.mohamed@scriptqube.com',
    phone: '+974-555-0124',
    status: 'Active'
  },
  {
    employeeId: 'BA0249',
    title: 'Mr.',
    firstName: 'ABDUL',
    lastName: 'AZIZ',
    dob: new Date('1988-11-10'),
    nationality: 'Bangladeshi',
    empStatus: 'Working',
    dateOfJoining: new Date('2023-03-10'),
    religion: 'Islam',
    contractType: 'permanent',
    company: 'ScriptQube',
    department: 'CONSTRUCTION',
    employer: 'ScriptQube HR',
    designation: 'STEEL FIXER',
    division: 'East',
    location: 'Site',
    payGroup: 'Group C',
    payThrough: 'Bank Transfer',
    currency: 'Qatari Riyal',
    basicSalary: 65000,
    salaryType: 'Monthly',
    bankName: 'Doha Bank',
    email: 'abdul.aziz@scriptqube.com',
    phone: '+974-555-0125',
    status: 'Active'
  },
  {
    employeeId: 'BA0472',
    title: 'Mr.',
    firstName: 'ABDUL',
    lastName: 'HOSSAIN',
    dob: new Date('1987-05-18'),
    nationality: 'Bangladeshi',
    empStatus: 'Working',
    dateOfJoining: new Date('2022-11-05'),
    religion: 'Islam',
    contractType: 'permanent',
    company: 'ScriptQube',
    department: 'CONSTRUCTION',
    employer: 'ScriptQube HR',
    designation: 'SHUTTERING CARPENTER',
    division: 'West',
    location: 'Site',
    payGroup: 'Group B',
    payThrough: 'Bank Transfer',
    currency: 'Qatari Riyal',
    basicSalary: 70000,
    salaryType: 'Monthly',
    bankName: 'Qatar National Bank',
    email: 'abdul.hossain@scriptqube.com',
    phone: '+974-555-0126',
    status: 'Active'
  },
  {
    employeeId: 'SL0345',
    title: 'Mr.',
    firstName: 'ABDUL LATHIFF MOHAMED ALIYAR',
    lastName: 'LATHIFF',
    dob: new Date('1989-09-30'),
    nationality: 'Sri Lankan',
    empStatus: 'Working',
    dateOfJoining: new Date('2023-02-15'),
    religion: 'Islam',
    contractType: 'permanent',
    company: 'ScriptQube',
    department: 'FLEET',
    employer: 'ScriptQube HR',
    designation: 'LIGHT DRIVER',
    division: 'North',
    location: 'Main Office',
    payGroup: 'Group C',
    payThrough: 'Bank Transfer',
    currency: 'Qatari Riyal',
    basicSalary: 60000,
    salaryType: 'Monthly',
    bankName: 'Commercial Bank',
    email: 'abdul.lathiff@scriptqube.com',
    phone: '+974-555-0127',
    status: 'Active'
  }
];

const seedEmployees = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('✅ Cleared existing employees');

    // Insert sample employees
    const result = await Employee.insertMany(sampleEmployees);
    console.log(`✅ Successfully seeded ${result.length} employees`);

    // Display seeded employees
    console.log('\n📋 Seeded Employees:');
    result.forEach(emp => {
      console.log(`- ${emp.employeeId}: ${emp.firstName} ${emp.lastName} (${emp.department})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedEmployees(); 