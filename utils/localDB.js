import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

class LocalDB {
  constructor() {
    this.dbPath = path.resolve(config.localDBPath);
    this.ensureDataDirectory();
    this.initDB();
  }

  ensureDataDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  initDB() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        users: [],
        lastId: 0
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2));
    }
  }

  readDB() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading local DB:', error);
      return { users: [], lastId: 0 };
    }
  }

  writeDB(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to local DB:', error);
      return false;
    }
  }

  async findUser(query) {
    const db = this.readDB();
    return db.users.find(user => {
      if (query.name) return user.name === query.name;
      if (query.username) return user.username === query.username;
      if (query.email) return user.email === query.email;
      if (query.id) return user.id === query.id;
      return false;
    });
  }

  async createUser(userData) {
    const db = this.readDB();
    const newId = db.lastId + 1;
    
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const newUser = {
      id: newId.toString(),
      name: userData.name,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'employee',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.lastId = newId;
    
    if (this.writeDB(db)) {
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }
    return null;
  }

  async getAllUsers() {
    const db = this.readDB();
    return db.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async updateUser(id, updateData) {
    const db = this.readDB();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    if (this.writeDB(db)) {
      const { password, ...userWithoutPassword } = db.users[userIndex];
      return userWithoutPassword;
    }
    return null;
  }

  async deleteUser(id) {
    const db = this.readDB();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return false;
    
    db.users.splice(userIndex, 1);
    return this.writeDB(db);
  }

  async comparePassword(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password);
  }
}

export default LocalDB; 