# ScriptQube HRPAY Backend

A robust, secure Node.js/Express backend for the HRPAY system with comprehensive error handling, logging, validation, and security features.

## 🚀 Features

- **🔒 Security First**: JWT authentication, rate limiting, helmet.js security headers
- **📊 Advanced Logging**: Structured logging with file rotation and performance monitoring
- **✅ Input Validation**: Comprehensive validation utilities for all API endpoints
- **🛡️ Error Handling**: Robust error management with custom error classes
- **📁 File Uploads**: Secure file upload handling with validation
- **🗄️ Database**: MongoDB with Mongoose ODM
- **⚡ Performance**: Compression, caching, and optimized queries
- **🧪 Testing**: Organized test structure (unit, integration, e2e)

## 📁 Project Structure

```
backend/
├── api/                    # API versioning
│   └── v1/                # API v1 routes
│       ├── auth/          # Authentication routes
│       ├── dashboard/     # Dashboard routes
│       ├── settings/      # Settings routes
│       ├── notifications/ # Notification routes
│       ├── company/       # Company routes
│       └── attendance/    # Attendance routes
├── config/                # Configuration files
│   ├── config.js         # Main configuration
│   └── db.js             # Database connection
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
│   └── auth.js           # Authentication middleware
├── models/               # Database models
├── routes/               # Legacy API routes
├── scripts/              # Utility scripts
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── utils/                # Utility functions
│   ├── errorHandler.js   # Error handling utilities
│   ├── logger.js         # Logging utilities
│   ├── validation.js     # Validation utilities
│   └── asyncHandler.js   # Async error handler
├── uploads/              # File uploads directory
├── logs/                 # Application logs
├── app.js                # Express app configuration
├── server.js             # Server entry point
└── env.example           # Environment variables example
```

## 🛠️ Setup

### Prerequisites

- Node.js v18+ 
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HRPAY/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Required Environment Variables**
   ```bash
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # Database Configuration
   DB_URL=mongodb://127.0.0.1:27017/hrpay
   
   # Security Configuration (REQUIRED)
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   
   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure password hashing with bcryptjs
- Token expiration and refresh

### API Security
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input sanitization and validation
- XSS protection

### Data Protection
- Environment variable configuration
- Secure file upload handling
- Database connection security
- Error message sanitization

## 📊 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

### Dashboard Endpoints
- `GET /dashboard` - Get dashboard data (protected)
- `GET /dashboard/announcements` - Get announcements
- `GET /dashboard/holidays` - Get holidays

### Settings Endpoints
- `GET /settings` - Get system settings (protected)
- `PUT /settings` - Update system settings (protected)
- `GET /company` - Get company information
- `PUT /company` - Update company information (protected)

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### Test Structure
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing

## 📝 Logging

### Log Levels
- `ERROR`: Application errors and exceptions
- `WARN`: Warning messages
- `INFO`: General information
- `DEBUG`: Debug information (development only)

### Log Files
- `logs/error.log` - Error logs
- `logs/info.log` - Information logs
- `logs/debug.log` - Debug logs

## 🔧 Development

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for complex functions
- Use meaningful variable names

### Best Practices
1. **Error Handling**: Always use try-catch blocks
2. **Validation**: Validate all inputs
3. **Logging**: Log important events and errors
4. **Security**: Never expose sensitive information
5. **Performance**: Optimize database queries

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET`
- [ ] Set up proper `DB_URL`
- [ ] Configure `CORS_ORIGINS`
- [ ] Set up logging
- [ ] Configure rate limiting
- [ ] Set up monitoring

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=4000
DB_URL=mongodb://your-production-db-url
JWT_SECRET=your-production-jwt-secret
CORS_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=ERROR
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the ISC License. 