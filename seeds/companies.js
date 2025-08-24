import mongoose from 'mongoose';
import Company from '../models/Company.js';

// Sample companies data
const companiesData = [
  {
    code: 'MAIN',
    name: 'HypeBridge Technologies',
    description: 'Main technology company specializing in innovative software solutions',
    erpCode: 'COMP001',
    isActive: true,
    type: 'Parent',
    address: {
      street: '123 Innovation Drive',
      city: 'Tech City',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    },
    contact: {
      phone: '+1-555-0123',
      email: 'info@hypebridge.com',
      website: 'https://hypebridge.com'
    },
    registrationNumber: 'REG123456',
    taxId: 'TAX789012',
    parentCompany: null,
    ceo: 'John Smith',
    foundedYear: 2020,
    employeeCount: 150,
    industry: 'Technology'
  },
  {
    code: 'SUBS',
    name: 'HypeBridge Solutions',
    description: 'Subsidiary company focused on enterprise solutions and consulting',
    erpCode: 'COMP002',
    isActive: true,
    type: 'Subsidiary',
    address: {
      street: '456 Enterprise Way',
      city: 'Business District',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    contact: {
      phone: '+1-555-0456',
      email: 'solutions@hypebridge.com',
      website: 'https://solutions.hypebridge.com'
    },
    registrationNumber: 'REG789012',
    taxId: 'TAX345678',
    parentCompany: null, // Will be set to MAIN company
    ceo: 'Sarah Johnson',
    foundedYear: 2021,
    employeeCount: 75,
    industry: 'Consulting'
  },
  {
    code: 'PART',
    name: 'HypeBridge Partners',
    description: 'Partnership company for joint ventures and strategic alliances',
    erpCode: 'COMP003',
    isActive: true,
    type: 'Partner',
    address: {
      street: '789 Partnership Plaza',
      city: 'Alliance City',
      state: 'TX',
      country: 'USA',
      zipCode: '75001'
    },
    contact: {
      phone: '+1-555-0789',
      email: 'partners@hypebridge.com',
      website: 'https://partners.hypebridge.com'
    },
    registrationNumber: 'REG345678',
    taxId: 'TAX901234',
    parentCompany: null,
    ceo: 'Mike Wilson',
    foundedYear: 2022,
    employeeCount: 45,
    industry: 'Partnerships'
  },
  {
    code: 'INTL',
    name: 'HypeBridge International',
    description: 'International subsidiary for global operations and expansion',
    erpCode: 'COMP004',
    isActive: true,
    type: 'Subsidiary',
    address: {
      street: '321 Global Street',
      city: 'London',
      state: '',
      country: 'UK',
      zipCode: 'SW1A 1AA'
    },
    contact: {
      phone: '+44-20-7123-4567',
      email: 'international@hypebridge.com',
      website: 'https://international.hypebridge.com'
    },
    registrationNumber: 'REG901234',
    taxId: 'TAX567890',
    parentCompany: null, // Will be set to MAIN company
    ceo: 'Lisa Chen',
    foundedYear: 2023,
    employeeCount: 60,
    industry: 'Technology'
  }
];

export const seedCompanies = async () => {
  try {
    console.log('🌱 Seeding companies...');
    
    // Clear existing companies
    await Company.deleteMany({});
    console.log('✅ Cleared existing companies');
    
    // Insert main company first
    const mainCompany = await Company.create(companiesData[0]);
    console.log(`✅ Inserted main company: ${mainCompany.name}`);
    
    // Update subsidiary companies with parent references
    const subsidiaryData = [
      { ...companiesData[1], parentCompany: mainCompany._id },
      { ...companiesData[3], parentCompany: mainCompany._id }
    ];
    
    const subsidiaries = await Company.insertMany(subsidiaryData);
    console.log(`✅ Inserted ${subsidiaries.length} subsidiary companies`);
    
    // Insert partner company (no parent)
    const partnerCompany = await Company.create(companiesData[2]);
    console.log(`✅ Inserted partner company: ${partnerCompany.name}`);
    
    return [mainCompany, ...subsidiaries, partnerCompany];
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    throw error;
  }
};

export default seedCompanies;
