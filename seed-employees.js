import mongoose from 'mongoose';
import config from './config/config.js';

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
import User from './models/user.model.js';
import Employee from './models/Employee.js';

async function seedEmployees() {
  try {
    console.log('=== SEEDING EMPLOYEES ===');
    
    // First, get a user to use as createdBy
    const user = await User.findOne({});
    if (!user) {
      console.log('No users found. Please create a user first.');
      return;
    }
    
    console.log('Using user as creator:', user.username);
    
    // Sample employee data
    const sampleEmployees = [
      {
        name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1-555-0101',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        joinDate: new Date('2023-01-15'),
        salary: 85000,
        status: 'active',
        personalInfo: {
          dateOfBirth: new Date('1990-05-15'),
          gender: 'male',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001'
          },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'Spouse',
            phone: '+1-555-0102'
          }
        },
        workInfo: {
          location: 'New York Office',
          workType: 'full-time',
          shift: 'Day'
        },
        createdBy: user._id
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0103',
        department: 'Marketing',
        designation: 'Marketing Manager',
        joinDate: new Date('2022-08-20'),
        salary: 75000,
        status: 'active',
        personalInfo: {
          dateOfBirth: new Date('1988-12-10'),
          gender: 'female',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            postalCode: '90210'
          },
          emergencyContact: {
            name: 'Mike Johnson',
            relationship: 'Spouse',
            phone: '+1-555-0104'
          }
        },
        workInfo: {
          location: 'Los Angeles Office',
          workType: 'full-time',
          shift: 'Day'
        },
        createdBy: user._id
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        phone: '+1-555-0105',
        department: 'Finance',
        designation: 'Financial Analyst',
        joinDate: new Date('2023-03-10'),
        salary: 70000,
        status: 'active',
        personalInfo: {
          dateOfBirth: new Date('1992-07-22'),
          gender: 'male',
          address: {
            street: '789 Pine St',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            postalCode: '94102'
          },
          emergencyContact: {
            name: 'Lisa Chen',
            relationship: 'Sister',
            phone: '+1-555-0106'
          }
        },
        workInfo: {
          location: 'San Francisco Office',
          workType: 'full-time',
          shift: 'Day'
        },
        createdBy: user._id
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        phone: '+1-555-0107',
        department: 'Human Resources',
        designation: 'HR Specialist',
        joinDate: new Date('2022-11-05'),
        salary: 65000,
        status: 'active',
        personalInfo: {
          dateOfBirth: new Date('1991-03-18'),
          gender: 'female',
          address: {
            street: '321 Elm St',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
            postalCode: '60601'
          },
          emergencyContact: {
            name: 'Robert Davis',
            relationship: 'Father',
            phone: '+1-555-0108'
          }
        },
        workInfo: {
          location: 'Chicago Office',
          workType: 'full-time',
          shift: 'Day'
        },
        createdBy: user._id
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        phone: '+1-555-0109',
        department: 'Sales',
        designation: 'Sales Representative',
        joinDate: new Date('2023-06-12'),
        salary: 60000,
        status: 'active',
        personalInfo: {
          dateOfBirth: new Date('1989-09-30'),
          gender: 'male',
          address: {
            street: '654 Maple Dr',
            city: 'Boston',
            state: 'MA',
            country: 'USA',
            postalCode: '02101'
          },
          emergencyContact: {
            name: 'Patricia Wilson',
            relationship: 'Mother',
            phone: '+1-555-0110'
          }
        },
        workInfo: {
          location: 'Boston Office',
          workType: 'full-time',
          shift: 'Day'
        },
        createdBy: user._id
      }
    ];
    
    // Check if employees already exist
    const existingCount = await Employee.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing employees. Skipping seeding.`);
      return;
    }
    
    // Create employees
    const createdEmployees = await Employee.insertMany(sampleEmployees);
    
    console.log(`Successfully created ${createdEmployees.length} employees:`);
    createdEmployees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.employeeId}) - ${emp.department}`);
    });
    
  } catch (error) {
    console.error('Error seeding employees:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedEmployees();
