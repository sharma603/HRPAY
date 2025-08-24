import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_super_secret_jwt_key_here_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Local database
const DB_PATH = './data/users.json';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], lastId: 0 }));
}

// Database functions
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], lastId: 0 };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to DB:', error);
    return false;
  }
};

const findUser = (query) => {
  const db = readDB();
  return db.users.find(user => {
    if (query.name) return user.name === query.name;
    if (query.email) return user.email === query.email;
    if (query.id) return user.id === query.id;
    return false;
  });
};

const createUser = async (userData) => {
  const db = readDB();
  const newId = db.lastId + 1;
  
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  const newUser = {
    id: newId.toString(),
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'employee',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.lastId = newId;
  
  if (writeDB(db)) {
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  return null;
};

const getAllUsers = () => {
  const db = readDB();
  return db.users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

const comparePassword = async (user, candidatePassword) => {
  return bcrypt.compare(candidatePassword, user.password);
};

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'SYNERGY ERP HR SOLUTION API is running!' });
});

// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Registration attempt:', { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const existingUserByName = findUser({ name: name.trim() });
    if (existingUserByName) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    const existingUserByEmail = findUser({ email: email.toLowerCase().trim() });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "employee"
    };
    
    const user = await createUser(userData);
    if (!user) {
      throw new Error('Failed to create user');
    }
    
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    console.log('Registration successful for:', user.name);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    console.log('Login attempt for user:', name);
    
    const user = findUser({ name });
    if (!user) {
      console.log('User not found:', name);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log('User found, comparing password...');
    const isMatch = await comparePassword(user, password);
    if (!isMatch) {
      console.log('Password mismatch for user:', name);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log('Password match, generating token...');
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    console.log('Login successful for user:', name);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all users (protected)
app.get('/api/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SYNERGY ERP HR SOLUTION Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔗 Authentication endpoints:`);
  console.log(`   POST /api/users/register - Register new user`);
  console.log(`   POST /api/users/login - Login user`);
  console.log(`   GET /api/users - Get all users`);
}); 