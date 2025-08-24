# Database Setup Guide for ScriptQube HRPAY

## Overview
This guide will help you set up the MongoDB database and connect it to the HRPAY application.

## Prerequisites
- MongoDB installed and running on your system
- Node.js and npm installed
- Backend and frontend applications set up

## Step 1: Database Configuration

### 1.1 MongoDB Setup
1. **Install MongoDB** (if not already installed):
   ```bash
   # For Windows: Download from https://www.mongodb.com/try/download/community
   # For macOS: brew install mongodb-community
   # For Ubuntu: sudo apt-get install mongodb
   ```

2. **Start MongoDB Service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # or
   mongo
   ```

### 1.2 Database Configuration
The application is configured to connect to:
- **Database Name**: `HRPAY`
- **Connection URL**: `mongodb://127.0.0.1:27017/HRPAY`
- **Port**: `4000` (backend API)

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

### 2.2 Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=4000
DB_URL=mongodb://127.0.0.1:27017/HRPAY
JWT_SECRET=your-secret-key-here
USE_LOCAL_DB=false
```

### 2.3 Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 ScriptQube HRPAY ERP Server running on port 4000
📱 API available at http://localhost:4000/api
🔗 ScriptQube - Empowering HR Management
✅ Connected to MongoDB
```

## Step 3: Seed Database with Sample Data

### 3.1 Seed Employees
```bash
cd backend
npm run seed:employees
```

This will:
- Connect to the MongoDB database
- Clear existing employee data
- Insert 5 sample employees
- Display the seeded data

Expected output:
```
✅ Connected to MongoDB
✅ Cleared existing employees
✅ Successfully seeded 5 employees

📋 Seeded Employees:
- IN0551: AAZAD MANSURI SAHEB HUSSAIN MANSURI (CONSTRUCTION)
- EG0152: ABDELHAFEZ MOHAMED (CONSTRUCTION)
- BA0249: ABDUL AZIZ (CONSTRUCTION)
- BA0472: ABDUL HOSSAIN (CONSTRUCTION)
- SL0345: ABDUL LATHIFF MOHAMED ALIYAR LATHIFF (FLEET)

🎉 Database seeding completed successfully!
```

## Step 4: Frontend Setup

### 4.1 Install Dependencies
```bash
cd frontend
npm install
```

### 4.2 Start Frontend Application
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## Step 5: Verify Database Connection

### 5.1 Test API Endpoints
You can test the API endpoints using curl or Postman:

```bash
# Get all employees
curl http://localhost:4000/api/employees

# Get employee statistics
curl http://localhost:4000/api/employees/stats

# Get specific employee
curl http://localhost:4000/api/employees/[employee-id]
```

### 5.2 Expected API Response Format
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "employeeId": "IN0551",
      "firstName": "AAZAD MANSURI SAHEB HUSSAIN",
      "lastName": "MANSURI",
      "department": "CONSTRUCTION",
      "designation": "ELECTRICIAN LABOUR",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 50
  }
}
```

## Step 6: Application Features

### 6.1 Employee Management
- ✅ **View All Employees**: Dynamic loading from database
- ✅ **Create New Employee**: Form with validation
- ✅ **Update Employee**: Edit existing employee data
- ✅ **Delete Employee**: Remove employee with confirmation
- ✅ **Search & Filter**: Find employees by name, ID, department
- ✅ **Pagination**: Handle large datasets

### 6.2 Data Validation
- ✅ **Employee ID**: Unique identifier validation
- ✅ **Required Fields**: All mandatory fields validated
- ✅ **Data Types**: Proper date, number, and string validation
- ✅ **Business Rules**: Age limits, salary ranges, etc.

### 6.3 Error Handling
- ✅ **API Errors**: Proper error messages
- ✅ **Validation Errors**: Field-specific error display
- ✅ **Network Errors**: Connection issue handling
- ✅ **User Feedback**: SweetAlert notifications

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   mongosh
   
   # If not running, start it:
   # Windows: net start MongoDB
   # macOS: brew services start mongodb-community
   # Ubuntu: sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 4000
   netstat -ano | findstr :4000
   
   # Kill the process or change port in .env
   ```

3. **CORS Issues**
   - Ensure frontend is running on `http://localhost:3000`
   - Backend CORS is configured for this origin

4. **Database Not Found**
   ```bash
   # Connect to MongoDB and create database
   mongosh
   use HRPAY
   ```

### Reset Database
```bash
# Clear all data and reseed
cd backend
npm run seed:employees
```

## Production Deployment

### Environment Variables
```env
PORT=4000
DB_URL=mongodb://your-production-mongo-url/HRPAY
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

### Security Considerations
- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify environment variables
3. Check console logs for errors
4. Ensure all dependencies are installed
5. Restart both frontend and backend servers

---

**ScriptQube HRPAY ERP System** - Empowering HR Management 