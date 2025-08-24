import mongoose from 'mongoose';
import Department from '../models/Department.js';

// Sample departments data
const departmentsData = [
  {
    code: 'IT',
    name: 'Information Technology',
    description: 'Handles all IT infrastructure, software development, and technical support',
    erpCode: 'DEPT001',
    isActive: true,
    manager: 'John Smith',
    location: 'Building A, Floor 3',
    budget: '$500,000',
    employeeCount: 25
  },
  {
    code: 'HR',
    name: 'Human Resources',
    description: 'Manages employee relations, recruitment, and HR policies',
    erpCode: 'DEPT002',
    isActive: true,
    manager: 'Sarah Johnson',
    location: 'Building B, Floor 1',
    budget: '$200,000',
    employeeCount: 12
  },
  {
    code: 'FIN',
    name: 'Finance',
    description: 'Handles financial planning, accounting, and budget management',
    erpCode: 'DEPT003',
    isActive: true,
    manager: 'Mike Davis',
    location: 'Building A, Floor 2',
    budget: '$300,000',
    employeeCount: 18
  },
  {
    code: 'OPS',
    name: 'Operations',
    description: 'Manages day-to-day business operations and process improvement',
    erpCode: 'DEPT004',
    isActive: true,
    manager: 'Lisa Wilson',
    location: 'Building C, Floor 1',
    budget: '$400,000',
    employeeCount: 30
  },
  {
    code: 'MKT',
    name: 'Marketing',
    description: 'Handles brand management, advertising, and market research',
    erpCode: 'DEPT005',
    isActive: true,
    manager: 'Tom Brown',
    location: 'Building B, Floor 2',
    budget: '$350,000',
    employeeCount: 22
  },
  {
    code: 'SAL',
    name: 'Sales',
    description: 'Manages customer relationships, sales strategies, and revenue generation',
    erpCode: 'DEPT006',
    isActive: true,
    manager: 'Emma Wilson',
    location: 'Building D, Floor 1',
    budget: '$450,000',
    employeeCount: 28
  },
  {
    code: 'ENG',
    name: 'Engineering',
    description: 'Handles product development, research, and technical innovation',
    erpCode: 'DEPT007',
    isActive: true,
    manager: 'Alex Chen',
    location: 'Building A, Floor 4',
    budget: '$600,000',
    employeeCount: 35
  },
  {
    code: 'QA',
    name: 'Quality Assurance',
    description: 'Ensures product quality and compliance with standards',
    erpCode: 'DEPT008',
    isActive: true,
    manager: 'David Kim',
    location: 'Building C, Floor 2',
    budget: '$250,000',
    employeeCount: 15
  }
];

// Seed function
export const seedDepartments = async () => {
  try {
    console.log('🌱 Seeding departments...');
    
    // Clear existing departments
    await Department.deleteMany({});
    console.log('✅ Cleared existing departments');
    
    // Create new departments
    const departments = await Department.insertMany(departmentsData);
    console.log(`✅ Created ${departments.length} departments`);
    
    // Log created departments
    departments.forEach(dept => {
      console.log(`   - ${dept.code}: ${dept.name}`);
    });
    
    console.log('🎉 Department seeding completed successfully!');
    return departments;
    
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    throw error;
  }
};

// Export for use in other seed files
export default seedDepartments;
