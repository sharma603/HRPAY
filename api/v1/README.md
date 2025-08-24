# API v1 Documentation

## Overview
This API provides endpoints for both frontend web applications and mobile apps.

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Structure

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (future)
- `POST /auth/refresh` - Refresh token (future)

### Dashboard (`/dashboard`)
- `GET /dashboard/data` - Get dashboard data for authenticated user
- `GET /dashboard/announcements` - Get user announcements
- `GET /dashboard/holidays` - Get upcoming holidays

### Settings (`/settings`)
- `GET /settings` - Get system settings
- `POST /settings` - Update system settings
- `GET /settings/company` - Get company information
- `POST /settings/company` - Update company information

### Notifications (`/notifications`)
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all as read

### Company (`/company`)
- `GET /company/info` - Get company information
- `POST /company/info` - Update company information
- `GET /company/logo` - Get company logo
- `POST /company/logo` - Upload company logo

## Response Format
All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error 