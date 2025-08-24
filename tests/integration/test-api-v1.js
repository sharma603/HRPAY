import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

async function testAPIv1() {
  try {
    console.log('🧪 Testing API v1 endpoints...\n');
    
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test authentication
    console.log('\n2. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'API Test User',
      email: 'apitest@example.com',
      username: 'apitestuser',
      password: 'password123',
      role: 'employee'
    });
    console.log('✅ Registration:', registerResponse.data.message);
    
    // Test login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'apitestuser',
      password: 'password123'
    });
    console.log('✅ Login:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    
    // Test dashboard data
    console.log('\n4. Testing dashboard data...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Dashboard data:', dashboardResponse.data.message);
    
    // Test announcements
    console.log('\n5. Testing announcements...');
    const announcementsResponse = await axios.get(`${API_BASE_URL}/dashboard/announcements`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Announcements:', announcementsResponse.data.message);
    
    // Test holidays
    console.log('\n6. Testing holidays...');
    const holidaysResponse = await axios.get(`${API_BASE_URL}/dashboard/holidays`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Holidays:', holidaysResponse.data.message);
    
    // Test system settings
    console.log('\n7. Testing system settings...');
    const settingsResponse = await axios.get(`${API_BASE_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ System settings:', settingsResponse.data.message);
    
    // Test notifications
    console.log('\n8. Testing notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Notifications:', notificationsResponse.data.message);
    
    // Test unread count
    console.log('\n9. Testing unread count...');
    const unreadResponse = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Unread count:', unreadResponse.data.message);
    
    // Test company info
    console.log('\n10. Testing company info...');
    const companyResponse = await axios.get(`${API_BASE_URL}/company/info`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Company info:', companyResponse.data.message);
    
    console.log('\n🎉 All API v1 tests completed successfully!');
    console.log('📊 API Structure:');
    console.log('   - Authentication: ✅');
    console.log('   - Dashboard: ✅');
    console.log('   - Settings: ✅');
    console.log('   - Notifications: ✅');
    console.log('   - Company: ✅');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPIv1(); 