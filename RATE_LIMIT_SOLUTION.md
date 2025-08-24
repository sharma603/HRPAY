# Rate Limiting Solution for Mobile Apps

## Problem
Mobile apps were experiencing "Too many requests" errors during login due to restrictive rate limiting (100 requests per 15 minutes).

## Solution Implemented

### 1. Separate Rate Limiting for Authentication
- **Authentication endpoints** (`/api/v1/auth/*`): 2000 requests per 15 minutes
- **General API endpoints** (`/api/*`): 1000 requests per 15 minutes
- **Development mode**: 5000 requests per 15 minutes

### 2. Configuration Files Created
- `config/rate-limit-config.js` - Centralized rate limiting configuration
- `setup-rate-limit.bat` - Windows batch script for setup
- `setup-rate-limit.ps1` - PowerShell script for setup

### 3. Code Changes Made
- Updated `app.js` to use different rate limiters for different route groups
- Authentication routes now have more lenient limits
- General API routes maintain reasonable security limits

## How to Apply the Solution

### Option 1: Environment Variables (Recommended)
Create a `.env` file in the backend directory:

```env
# Rate Limiting - Mobile App Friendly
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
RATE_LIMIT_WHITELIST=127.0.0.1,::1
RATE_LIMIT_DISABLED=false
```

### Option 2: Command Line
Set environment variables before starting the server:

**Windows (Command Prompt):**
```cmd
set RATE_LIMIT_MAX=1000
set RATE_LIMIT_WINDOW_MS=900000
npm start
```

**Windows (PowerShell):**
```powershell
$env:RATE_LIMIT_MAX='1000'
$env:RATE_LIMIT_WINDOW_MS='900000'
npm start
```

### Option 3: Use the Setup Scripts
Run either:
- `setup-rate-limit.bat` (Command Prompt)
- `setup-rate-limit.ps1` (PowerShell)

## Rate Limiting Details

| Route Type | Requests per 15 min | Purpose |
|------------|---------------------|---------|
| Authentication | 2000 | Mobile app login, registration |
| General API | 1000 | Employee, company, other endpoints |
| Development | 5000 | Local development and testing |

## Benefits

1. **Mobile App Friendly**: Authentication endpoints allow more login attempts
2. **Security Maintained**: General API still protected against abuse
3. **Configurable**: Easy to adjust limits through environment variables
4. **Development Friendly**: Higher limits for local development

## Testing the Solution

1. Restart your backend server after applying changes
2. Try logging in multiple times from mobile apps
3. Check that "Too many requests" errors are reduced
4. Monitor server logs for rate limiting activity

## Troubleshooting

### Still Getting Rate Limited?
1. Check that environment variables are set correctly
2. Verify the server was restarted after changes
3. Check server logs for rate limiting messages
4. Ensure mobile apps aren't making excessive requests

### Need Higher Limits?
Adjust the values in `config/rate-limit-config.js`:
```javascript
export const mobileAppRateLimitConfig = {
  max: 5000, // Increase this value
  // ... other settings
};
```

## Security Considerations

- Rate limits are per IP address
- Whitelist trusted IP addresses if needed
- Monitor for abuse patterns
- Consider implementing exponential backoff in mobile apps

## Mobile App Recommendations

Implement retry logic with exponential backoff:
```javascript
const loginWithRetry = async (credentials, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) { // Rate limited
        if (attempt === maxRetries) throw error;
        
        // Wait with exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

This solution should resolve the "too many requests" issue for your mobile apps while maintaining security for your API.
