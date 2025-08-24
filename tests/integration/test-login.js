import axios from 'axios';

const testLogin = async () => {
  try {
    // Test login with test user
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    console.log('Testing login...');
    const response = await axios.post('http://localhost:4000/api/users/login', loginData);
    
    if (response.data.token) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.token);
      
      // Test dashboard API with token
      console.log('\nTesting dashboard API...');
      const dashboardResponse = await axios.get('http://localhost:4000/api/dashboard/data', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      });
      
      console.log('✅ Dashboard API successful!');
      console.log('Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testLogin(); 