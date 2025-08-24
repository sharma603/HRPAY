// Simple test without external dependencies
import http from 'http';

const testConnection = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4000/api/common-codes/types', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('✅ Server is responding!');
        console.log('📄 Status:', res.statusCode);
        console.log('📄 Response:', data);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Connection failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Request timed out');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

console.log('🔍 Testing API connection...');
testConnection().catch(() => console.log('Failed to connect'));