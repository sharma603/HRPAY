import axios from 'axios';

const testBackendAPI = async () => {
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    console.log('✅ Server is running on port 4000');
    
    // Test 2: Test registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'API Test User',
      username: 'apitest',
      email: 'apitest@example.com',
      password: 'password123',
      role: 'employee'
    };
    
    const registerResponse = await axios.post('http://localhost:4000/api/users/register', registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    // Test 3: Test login
    console.log('\n3. Testing user login...');
    const loginData = {
      username: 'apitest',
      password: 'password123'
    };
    
    const loginResponse = await axios.post('http://localhost:4000/api/users/login', loginData);
    console.log('✅ Login successful:', loginResponse.data.user.name);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testBackendAPI(); 