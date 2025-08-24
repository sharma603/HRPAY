import mongoose from 'mongoose';
import Designation from '../models/Designation.js';

// Sample designations data
const designationsData = [
  {
    code: 'CEO',
    title: 'Chief Executive Officer',
    description: 'Top executive responsible for overall company management and strategic direction',
    erpCode: 'DES001',
    isActive: true,
    level: 'Executive',
    department: null, // Will be set dynamically
    minSalary: 150000,
    maxSalary: 300000,
    requiredSkills: ['Leadership', 'Strategic Planning', 'Business Acumen', 'Communication']
  },
  {
    code: 'CTO',
    title: 'Chief Technology Officer',
    description: 'Senior executive responsible for technology strategy and IT operations',
    erpCode: 'DES002',
    isActive: true,
    level: 'Executive',
    department: null,
    minSalary: 120000,
    maxSalary: 250000,
    requiredSkills: ['Technology Leadership', 'IT Strategy', 'Innovation', 'Team Management']
  },
  {
    code: 'MGR',
    title: 'Manager',
    description: 'Mid-level manager responsible for team leadership and project delivery',
    erpCode: 'DES003',
    isActive: true,
    level: 'Mid',
    department: null,
    minSalary: 60000,
    maxSalary: 120000,
    requiredSkills: ['Team Leadership', 'Project Management', 'Communication', 'Problem Solving']
  },
  {
    code: 'DEV',
    title: 'Software Developer',
    description: 'Professional responsible for designing, coding, and testing software applications',
    erpCode: 'DES004',
    isActive: true,
    level: 'Mid',
    department: null,
    minSalary: 50000,
    maxSalary: 100000,
    requiredSkills: ['Programming', 'Problem Solving', 'Software Design', 'Testing']
  },
  {
    code: 'HR',
    title: 'Human Resources Specialist',
    description: 'Professional responsible for employee relations, recruitment, and HR policies',
    erpCode: 'DES005',
    isActive: true,
    level: 'Mid',
    department: null,
    minSalary: 45000,
    maxSalary: 80000,
    requiredSkills: ['HR Management', 'Recruitment', 'Employee Relations', 'Compliance']
  },
  {
    code: 'INT',
    title: 'Intern',
    description: 'Entry-level position for students or recent graduates gaining work experience',
    erpCode: 'DES006',
    isActive: true,
    level: 'Junior',
    department: null,
    minSalary: 25000,
    maxSalary: 40000,
    requiredSkills: ['Learning Ability', 'Communication', 'Teamwork', 'Basic Skills']
  }
];

export const seedDesignations = async () => {
  try {
    console.log('🌱 Seeding designations...');
    
    // Clear existing designations
    await Designation.deleteMany({});
    console.log('✅ Cleared existing designations');
    
    // Insert new designations
    const designations = await Designation.insertMany(designationsData);
    console.log(`✅ Inserted ${designations.length} designations`);
    
    return designations;
  } catch (error) {
    console.error('❌ Error seeding designations:', error);
    throw error;
  }
};

export default seedDesignations;
