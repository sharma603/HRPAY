import mongoose from 'mongoose';
import Division from '../models/Division.js';

// Sample divisions data
const divisionsData = [
  {
    code: 'TECH',
    name: 'Technology Division',
    description: 'Handles all technology infrastructure, software development, and technical operations',
    erpCode: 'DIV001',
    isActive: true,
    divisionHead: 'John Smith',
    location: 'Building A, Floor 3',
    budget: '$2,000,000',
    employeeCount: 45,
    parentDivision: null,
    company: null
  },
  {
    code: 'OPS',
    name: 'Operations Division',
    description: 'Manages day-to-day business operations, process optimization, and efficiency',
    erpCode: 'DIV002',
    isActive: true,
    divisionHead: 'Sarah Johnson',
    location: 'Building B, Floor 2',
    budget: '$1,500,000',
    employeeCount: 30,
    parentDivision: null,
    company: null
  },
  {
    code: 'ADMIN',
    name: 'Administration Division',
    description: 'Handles administrative functions, facilities, and support services',
    erpCode: 'DIV003',
    isActive: true,
    divisionHead: 'Mike Wilson',
    location: 'Building C, Floor 1',
    budget: '$800,000',
    employeeCount: 20,
    parentDivision: null,
    company: null
  },
  {
    code: 'TECH-DEV',
    name: 'Technology Development',
    description: 'Sub-division focused on software development and innovation',
    erpCode: 'DIV004',
    isActive: true,
    divisionHead: 'Lisa Chen',
    location: 'Building A, Floor 4',
    budget: '$800,000',
    employeeCount: 25,
    parentDivision: null, // Will be set to TECH division
    company: null
  },
  {
    code: 'TECH-INFRA',
    name: 'Technology Infrastructure',
    description: 'Sub-division focused on IT infrastructure and system administration',
    erpCode: 'DIV005',
    isActive: true,
    divisionHead: 'David Brown',
    location: 'Building A, Floor 2',
    budget: '$600,000',
    employeeCount: 15,
    parentDivision: null, // Will be set to TECH division
    company: null
  },
  {
    code: 'OPS-PROC',
    name: 'Operations Process',
    description: 'Sub-division focused on process optimization and quality management',
    erpCode: 'DIV006',
    isActive: true,
    divisionHead: 'Emily Davis',
    location: 'Building B, Floor 3',
    budget: '$500,000',
    employeeCount: 12,
    parentDivision: null, // Will be set to OPS division
    company: null
  }
];

export const seedDivisions = async () => {
  try {
    console.log('🌱 Seeding divisions...');
    
    // Clear existing divisions
    await Division.deleteMany({});
    console.log('✅ Cleared existing divisions');
    
    // Insert main divisions first
    const mainDivisions = await Division.insertMany(divisionsData.slice(0, 3));
    console.log(`✅ Inserted ${mainDivisions.length} main divisions`);
    
    // Get main division IDs for sub-divisions
    const techDivision = mainDivisions.find(d => d.code === 'TECH');
    const opsDivision = mainDivisions.find(d => d.code === 'OPS');
    
    // Update sub-divisions with parent references
    const subDivisionsData = [
      { ...divisionsData[3], parentDivision: techDivision._id },
      { ...divisionsData[4], parentDivision: techDivision._id },
      { ...divisionsData[5], parentDivision: opsDivision._id }
    ];
    
    const subDivisions = await Division.insertMany(subDivisionsData);
    console.log(`✅ Inserted ${subDivisions.length} sub-divisions`);
    
    return [...mainDivisions, ...subDivisions];
  } catch (error) {
    console.error('❌ Error seeding divisions:', error);
    throw error;
  }
};

export default seedDivisions;
