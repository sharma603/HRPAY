// Simple in-memory database for testing without MongoDB
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty database if file doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));
}

class SimpleDB {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading database:', error);
      return { users: [] };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // User methods
  async findUser(query) {
    const users = this.data.users;
    if (query.name) {
      return users.find(user => user.name === query.name);
    }
    if (query.email) {
      return users.find(user => user.email === query.email);
    }
    if (query.id) {
      return users.find(user => user.id === query.id);
    }
    return null;
  }

  async createUser(userData) {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  async findUsers() {
    return this.data.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async updateUser(id, updateData) {
    const userIndex = this.data.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveData();
    return this.data.users[userIndex];
  }

  async deleteUser(id) {
    const userIndex = this.data.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.data.users.splice(userIndex, 1);
    this.saveData();
    return true;
  }
}

export default new SimpleDB(); 