import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Employee test route
app.get('/api/employees', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Employee endpoint is working'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📱 Test API available at http://localhost:${PORT}/test`);
  console.log(`👥 Employee API available at http://localhost:${PORT}/api/employees`);
}); 