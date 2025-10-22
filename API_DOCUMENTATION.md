# Internship Application Tracker API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Applications

#### GET /api/applications
Get all applications for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (default: 'appliedDate')
- `sortOrder` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

#### GET /api/applications/:id
Get a specific application.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "_id": "app_id",
      "company": "Google",
      "position": "Software Engineer",
      "status": "interview",
      "appliedDate": "2024-01-01T00:00:00.000Z",
      "interviewDate": "2024-01-15T00:00:00.000Z",
      "notes": "Great opportunity",
      "salary": 120000,
      "location": "Mountain View, CA",
      "jobType": "full-time",
      "applicationSource": "LinkedIn",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/applications
Create a new application.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "company": "Google",
  "position": "Software Engineer",
  "status": "applied",
  "appliedDate": "2024-01-01T00:00:00.000Z",
  "interviewDate": "2024-01-15T00:00:00.000Z",
  "notes": "Great opportunity",
  "salary": 120000,
  "location": "Mountain View, CA",
  "jobType": "full-time",
  "applicationSource": "LinkedIn"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "application": {...}
  }
}
```

#### PUT /api/applications/:id
Update an application.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Same as POST, all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "application": {...}
  }
}
```

#### DELETE /api/applications/:id
Delete a specific application.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

#### DELETE /api/applications
Clear all applications for the user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully deleted X applications"
}
```

### Filtering and Search

#### GET /api/applications/filter
Filter applications by various criteria.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `jobType` (optional): Filter by job type
- `location` (optional): Filter by location (partial match)
- `page` (optional): Page number
- `limit` (optional): Items per page

#### GET /api/applications/sort
Sort applications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `by` (optional): Sort field (appliedDate, company, position, status, createdAt, updatedAt)
- `order` (optional): Sort order (asc, desc)
- `page` (optional): Page number
- `limit` (optional): Items per page

#### GET /api/applications/search
Search applications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `company` (optional): Search by company name
- `position` (optional): Search by position
- `keyword` (optional): Search across company, position, notes, location
- `page` (optional): Page number
- `limit` (optional): Items per page

### Analytics

#### GET /api/analytics/trends
Get application trends over time.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): Time period (week, month, year)
- `year` (optional): Specific year

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2024-01-01",
        "count": 5,
        "statuses": ["applied", "interview", "rejected"]
      }
    ],
    "statusBreakdown": [
      {"_id": "applied", "count": 10},
      {"_id": "interview", "count": 5}
    ],
    "period": "month",
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/analytics/top-companies
Get top companies by application count.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of companies to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "topCompanies": [
      {
        "company": "Google",
        "count": 5,
        "statuses": ["applied", "interview", "accepted"],
        "positions": ["Software Engineer", "Product Manager"],
        "successRate": 0.2
      }
    ],
    "totalCompanies": 10
  }
}
```

#### GET /api/analytics/stats
Get overall statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 50,
    "statusCounts": [
      {"_id": "applied", "count": 30},
      {"_id": "interview", "count": 15},
      {"_id": "accepted", "count": 5}
    ],
    "monthlyApplications": [
      {"_id": {"year": 2024, "month": 1}, "count": 10}
    ],
    "jobTypeDistribution": [
      {"_id": "full-time", "count": 30},
      {"_id": "internship", "count": 20}
    ],
    "successRate": 10.0,
    "avgApplicationsPerMonth": 8.33
  }
}
```

### User-Specific Data

#### GET /api/applications/user/:id
Get applications for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...]
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

## Data Models

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "createdAt": "date"
}
```

### Application
```json
{
  "id": "string",
  "user": "user_id",
  "company": "string",
  "position": "string",
  "status": "applied|interview|rejected|accepted|pending",
  "appliedDate": "date",
  "interviewDate": "date|null",
  "notes": "string",
  "salary": "number|null",
  "location": "string",
  "jobType": "full-time|part-time|internship|contract|remote",
  "applicationSource": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```
