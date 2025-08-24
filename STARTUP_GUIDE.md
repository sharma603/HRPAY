# 🚀 ScriptQube HRPAY Backend - Startup Guide

## ✅ Current Status: WORKING PERFECTLY!

Your backend is now fully configured and ready to use with both `node` and `nodemon`.

## 🎯 Quick Start

### 1. Start the Backend Server

**Option A: Development Mode (Recommended)**
```bash
npm run dev
```
- ✅ Uses nodemon for auto-restart
- ✅ Watches all file changes
- ✅ Automatically restarts when you save files

**Option B: Production Mode**
```bash
npm start
# or
node server.js
```

### 2. Server Information
- **Port**: 4000
- **URL**: http://localhost:4000
- **API Base**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## 🔧 Project Structure

```
backend/
├── server.js          ← Main server file (entry point)
├── app.js            ← Express app configuration
├── package.json      ← Dependencies and scripts
├── .env              ← Environment variables
├── routes/           ← API routes
├── api/v1/           ← New structured API
├── controllers/      ← Business logic
├── models/           ← Database models
└── middleware/       ← Custom middleware
```

## 🌐 Frontend Connection

Your frontend is already configured to connect to the backend:

**Frontend API Configuration** (`frontend/src/services/api.js`):
```javascript
const api = axios.create({
  baseURL: 'http://localhost:4000/api',  // ✅ Connected to backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 📱 Available API Endpoints

### Legacy API (Backward Compatibility)
- `POST /api/login` - User login
- `GET /api/users` - User management
- `GET /api/employees` - Employee management
- `GET /api/dashboard` - Dashboard data
- `GET /api/company-info` - Company information
- `GET /api/notifications` - Notifications
- `GET /api/system-settings` - System settings

### New API v1 (Structured)
- `GET /api/v1/health` - API health check
- `POST /api/v1/auth/login` - Authentication
- `GET /api/v1/dashboard` - Dashboard
- `GET /api/v1/settings` - Settings
- `GET /api/v1/notifications` - Notifications
- `GET /api/v1/company` - Company
- `GET /api/v1/attendance` - Attendance

## 🚀 How to Run the Complete Project

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Start Frontend (in new terminal)
```bash
cd frontend
npm start
```

### Step 3: Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Backend Health**: http://localhost:4000/health

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **CORS Protection** - Frontend-backend communication
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **Helmet Security** - HTTP security headers
- ✅ **Input Validation** - Request sanitization

## 📊 Database

- ✅ **MongoDB** - Primary database (when connected)
- ✅ **Local JSON** - Fallback database (currently active)
- ✅ **Mongoose ODM** - Database management

## 🛠️ Development Features

- ✅ **Hot Reload** - nodemon auto-restart
- ✅ **Environment Variables** - .env configuration
- ✅ **Structured Logging** - Professional logging
- ✅ **Error Handling** - Global error management
- ✅ **API Versioning** - Future-proof structure

## 🚨 Troubleshooting

### If server won't start:
1. Check if port 4000 is free
2. Ensure `.env` file exists with `JWT_SECRET`
3. Run `npm install` to install dependencies

### If frontend can't connect:
1. Ensure backend is running on port 4000
2. Check CORS configuration in `app.js`
3. Verify frontend API base URL

## 🎉 Success!

Your backend is now:
- ✅ **Running successfully** with nodemon
- ✅ **Connected to frontend** via CORS
- ✅ **Secure and optimized** with best practices
- ✅ **Ready for development** with hot reload

## 📞 Next Steps

1. **Test the API**: Visit http://localhost:4000/health
2. **Start Frontend**: Run `npm start` in frontend directory
3. **Build Features**: Your backend is ready for development!
4. **Monitor Logs**: Watch terminal for real-time updates

---

**🎯 Your project is now running perfectly with nodemon auto-restart!**
