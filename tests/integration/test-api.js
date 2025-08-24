import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test system settings (no auth required)
    console.log('\n1. Testing system settings...');
    const settingsResponse = await axios.get(`${API_BASE_URL}/system-settings`);
    console.log('System settings response:', settingsResponse.data);
    
    // Test registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, {
      name: 'Test User',
      email: 'test2@example.com',
      username: 'testuser3',
      password: 'password123',
      role: 'employee'
    });
    console.log('Registration response:', registerResponse.data);
    
    // Test login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username: 'testuser3',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.token;
    
    // Test dashboard endpoint with token
    console.log('\n4. Testing dashboard endpoint...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard response:', dashboardResponse.data);
    
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
  }
}

testAPI(); 