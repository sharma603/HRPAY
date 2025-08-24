import fetch from 'node-fetch';

const testCompanyAPI = async () => {
  try {
    console.log('Testing Company Info API endpoint...');
    
    // Test GET request
    console.log('\n1. Testing GET /api/company-info...');
    const getResponse = await fetch('http://localhost:4000/api/company-info');
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    
    // Test POST request
    console.log('\n2. Testing POST /api/company-info...');
    const postData = {
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
      fiscalYearStart: '2024-01-01',
      fiscalYearEnd: '2024-12-31',
      smtpServer: 'smtp.test.com',
      smtpPort: '587',
      username: 'test@company.com',
      password: 'testpassword',
      fromEmail: 'test@company.com',
      fromName: 'Test Company',
      enableSSL: 'true',
      enableTLS: 'false'
    };
    
    const postResponse = await fetch('http://localhost:4000/api/company-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    
    const postResult = await postResponse.json();
    console.log('POST Response:', postResult);
    
    if (postResult.success) {
      console.log('✅ Company info API is working correctly!');
    } else {
      console.log('❌ Company info API failed:', postResult.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Make sure the backend server is running on port 4000');
  }
};

// Wait a bit for server to start
setTimeout(testCompanyAPI, 2000); 