import config from './config/config.js';

console.log('🔍 Checking Database Configuration...\n');

console.log('Environment Variables:');
console.log('DB_URL:', process.env.DB_URL);
console.log('USE_LOCAL_DB:', process.env.USE_LOCAL_DB);

console.log('\nConfig Values:');
console.log('config.mongoUri:', config.mongoUri);
console.log('config.useLocalDB:', config.useLocalDB);

console.log('\nFinal Database URL:', config.mongoUri); 