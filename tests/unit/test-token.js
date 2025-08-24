import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGRmZjhhYTYyZGUxNzE5ZmMzYjgxYyIsIm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NDEzNjU5MiwiZXhwIjoxNzU0MjIyOTkyfQ.R0Rkdhok1YMvewtCZTFH6i";

console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***HIDDEN***' : 'undefined');

try {
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
} 