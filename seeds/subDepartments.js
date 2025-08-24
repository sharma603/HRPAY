import mongoose from 'mongoose';
import SubDepartment from '../models/SubDepartment.js';

// Sample sub-departments data
const subDepartmentsData = [
  {
    code: 'IT-DEV',
    name: 'IT Development Team',
    description: 'Software development team responsible for custom applications and systems',
    erpCode: 'SUBD001',
    isActive: true,
    manager: 'Lisa Chen',
    location: 'Building A, Floor 4',
    budget: '$400,000',
    employeeCount: 15,
    parentDepartment: null, // Will be set dynamically
    division: null, // Will be set dynamically
    company: null, // Will be set dynamically
    type: 'Team',
    specialization: 'Software Development'
  },
  {
    code: 'IT-SUPP',
    name: 'IT Support Team',
    description: 'Technical support team for end-user assistance and system maintenance',
    erpCode: 'SUBD002',
    isActive: true,
    manager: 'David Brown',
    location: 'Building A, Floor 2',
    budget: '$200,000',
    employeeCount: 10,
    parentDepartment: null,
    division: null,
    company: null,
    type: 'Team',
    specialization: 'Technical Support'
  },
  {
    code: 'HR-REC',
    name: 'HR Recruitment Team',
    description: 'Human resources team focused on talent acquisition and recruitment',
    erpCode: 'SUBD003',
    isActive: true,
    manager: 'Emily Davis',
    location: 'Building B, Floor 1',
    budget: '$150,000',
    employeeCount: 8,
    parentDepartment: null,
    division: null,
    company: null,
    type: 'Team',
    specialization: 'Recruitment'
  },
  {
    code: 'HR-ADMIN',
    name: 'HR Administration Team',
    description: 'Human resources team handling employee relations and HR policies',
    erpCode: 'SUBD004',
    isActive: true,
    manager: 'Sarah Johnson',
    location: 'Building B, Floor 1',
    budget: '$120,000',
    employeeCount: 6,
    parentDepartment: null,
    division: null,
    company: null,
    type: 'Team',
    specialization: 'HR Administration'
  },
  {
    code: 'FIN-ACC',
    name: 'Finance Accounting Team',
    description: 'Financial team responsible for accounting, reporting, and compliance',
    erpCode: 'SUBD005',
    isActive: true,
    manager: 'Mike Wilson',
    location: 'Building C, Floor 1',
    budget: '$180,000',
    employeeCount: 8,
    parentDepartment: null,
    division: null,
    company: null,
    type: 'Team',
    specialization: 'Accounting'
  },
  {
    code: 'FIN-ANAL',
    name: 'Finance Analysis Team',
    description: 'Financial team focused on analysis, budgeting, and strategic planning',
    erpCode: 'SUBD006',
    isActive: true,
    manager: 'John Smith',
    location: 'Building C, Floor 2',
    budget: '$250,000',
    employeeCount: 12,
    parentDepartment: null,
    division: null,
    company: null,
    type: 'Team',
    specialization: 'Financial Analysis'
  }
];

export const seedSubDepartments = async () => {
  try {
    console.log('🌱 Seeding sub-departments...');
    
    // Clear existing sub-departments
    await SubDepartment.deleteMany({});
    console.log('✅ Cleared existing sub-departments');
    
    // Note: This seed function assumes that departments, divisions, and companies
    // have already been seeded. The parentDepartment, division, and company
    // references will need to be set after those entities are created.
    
    const subDepartments = await SubDepartment.insertMany(subDepartmentsData);
    console.log(`✅ Inserted ${subDepartments.length} sub-departments`);
    
    return subDepartments;
  } catch (error) {
    console.error('❌ Error seeding sub-departments:', error);
    throw error;
  }
};

export default seedSubDepartments;
