# InternTrack API Usage Guide

This guide provides comprehensive documentation for using all the available API endpoints in the InternTrack application.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Application Management APIs](#application-management-apis)
3. [Analytics APIs](#analytics-apis)
4. [Complete Examples](#complete-examples)
5. [Error Handling](#error-handling)
6. [TypeScript Types](#typescript-types)

## Authentication APIs

### 1. User Registration

```typescript
import { authAPI } from './services/authapis/authapis';

const signupData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123'
};

try {
  const response = await authAPI.signup(signupData);
  if (response.success) {
    console.log('User created:', response.data.user);
    // Auth data is automatically stored
  }
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

### 2. User Login

```typescript
const loginData = {
  email: 'john@example.com',
  password: 'securePassword123'
};

try {
  const response = await authAPI.login(loginData);
  if (response.success) {
    console.log('Login successful:', response.data.user);
  }
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### 3. Get Current User

```typescript
try {
  const response = await authAPI.getCurrentUser();
  if (response.success) {
    console.log('Current user:', response.data.user);
  }
} catch (error) {
  console.error('Get user failed:', error.message);
}
```

### 4. Check Authentication Status

```typescript
const isAuthenticated = authAPI.isAuthenticated();
console.log('User is authenticated:', isAuthenticated);

if (isAuthenticated) {
  const user = authAPI.getStoredUser();
  console.log('Stored user:', user);
}
```

### 5. Logout

```typescript
authAPI.logout();
console.log('User logged out');
```

## Application Management APIs

### 1. Get All Applications

```typescript
import { apiClient } from './services/api/apiClient';

// Get applications with pagination and filtering
const response = await apiClient.getApplications({
  page: 1,
  limit: 10,
  status: 'applied', // optional filter
  sortBy: 'appliedDate',
  sortOrder: 'desc'
});

if (response.success) {
  console.log('Applications:', response.data.applications);
  console.log('Pagination:', response.data.pagination);
}
```

### 2. Get Single Application

```typescript
const applicationId = 'your-application-id';
const response = await apiClient.getApplicationById(applicationId);

if (response.success) {
  console.log('Application details:', response.data.application);
}
```

### 3. Create New Application

```typescript
const applicationData = {
  company: 'Google',
  position: 'Software Engineering Intern',
  status: 'applied',
  appliedDate: new Date().toISOString(),
  interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
  notes: 'Applied through company website. Very excited about this opportunity!'
};

const response = await apiClient.createApplication(applicationData);

if (response.success) {
  console.log('Application created:', response.data.application);
}
```

### 4. Update Application

```typescript
const applicationId = 'your-application-id';
const updateData = {
  status: 'interview',
  interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  notes: 'Got an interview! Scheduled for next week.'
};

const response = await apiClient.updateApplication(applicationId, updateData);

if (response.success) {
  console.log('Application updated:', response.data.application);
}
```

### 5. Delete Application

```typescript
const applicationId = 'your-application-id';
const response = await apiClient.deleteApplication(applicationId);

if (response.success) {
  console.log('Application deleted:', response.message);
}
```

### 6. Clear All Applications

```typescript
const response = await apiClient.clearAllApplications();

if (response.success) {
  console.log('All applications cleared:', response.message);
}
```

## Analytics APIs

### 1. Get Analytics Statistics

```typescript
const response = await apiClient.getAnalyticsStats();

if (response.success) {
  const stats = response.data;
  console.log('Total Applications:', stats.totalApplications);
  console.log('Success Rate:', stats.successRate);
  console.log('Applications by Status:', stats.applicationsByStatus);
  console.log('Average Response Time:', stats.averageResponseTime);
}
```

### 2. Get Application Trends

```typescript
const response = await apiClient.getApplicationTrends();

if (response.success) {
  console.log('Application trends:', response.data);
  // response.data is an array of { date: string, count: number }
}
```

### 3. Get Top Companies

```typescript
const response = await apiClient.getTopCompanies();

if (response.success) {
  console.log('Top companies:', response.data);
  // response.data is an array of { company: string, count: number }
}
```

## Complete Examples

### Full User Workflow

```typescript
import { authAPI } from './services/authapis/authapis';
import { apiClient } from './services/api/apiClient';

const completeWorkflow = async () => {
  try {
    // Step 1: Register a new user
    console.log('Step 1: Registering user...');
    const signupResponse = await authAPI.signup({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    });
    
    if (!signupResponse.success) {
      throw new Error('Signup failed');
    }
    
    // Step 2: Check authentication
    console.log('Step 2: Checking authentication...');
    const isAuthenticated = authAPI.isAuthenticated();
    console.log('User is authenticated:', isAuthenticated);
    
    // Step 3: Create multiple applications
    console.log('Step 3: Creating applications...');
    const applications = [
      {
        company: 'Google',
        position: 'Software Engineering Intern',
        status: 'applied' as const,
        appliedDate: new Date().toISOString(),
        notes: 'Applied through company website'
      },
      {
        company: 'Microsoft',
        position: 'Product Management Intern',
        status: 'interview' as const,
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Phone interview scheduled'
      }
    ];
    
    for (const app of applications) {
      const response = await apiClient.createApplication(app);
      if (response.success) {
        console.log('Application created:', response.data.application);
      }
    }
    
    // Step 4: Get all applications
    console.log('Step 4: Fetching applications...');
    const applicationsResponse = await apiClient.getApplications({
      limit: 10,
      sortBy: 'appliedDate',
      sortOrder: 'desc'
    });
    
    if (applicationsResponse.success) {
      console.log('Total applications:', applicationsResponse.data.pagination.totalItems);
    }
    
    // Step 5: Get analytics
    console.log('Step 5: Fetching analytics...');
    const [statsResponse, trendsResponse, companiesResponse] = await Promise.all([
      apiClient.getAnalyticsStats(),
      apiClient.getApplicationTrends(),
      apiClient.getTopCompanies()
    ]);
    
    if (statsResponse.success) {
      console.log('Analytics stats:', statsResponse.data);
    }
    
    if (trendsResponse.success) {
      console.log('Application trends:', trendsResponse.data);
    }
    
    if (companiesResponse.success) {
      console.log('Top companies:', companiesResponse.data);
    }
    
    // Step 6: Logout
    console.log('Step 6: Logging out...');
    authAPI.logout();
    
  } catch (error) {
    console.error('Workflow failed:', error);
  }
};

// Run the complete workflow
completeWorkflow();
```

## Error Handling

### Comprehensive Error Handling

```typescript
const handleApiCall = async () => {
  try {
    const response = await apiClient.getApplications();
    console.log('Success:', response);
  } catch (error) {
    if (error.message.includes('401')) {
      console.log('User not authenticated, redirecting to login...');
      // Redirect to login page
      window.location.href = '/';
    } else if (error.message.includes('404')) {
      console.log('Resource not found');
    } else if (error.message.includes('500')) {
      console.log('Server error, please try again later');
    } else {
      console.log('Unknown error:', error.message);
    }
  }
};
```

### Authentication Error Handling

```typescript
const checkAuthAndRedirect = () => {
  if (!authAPI.isAuthenticated()) {
    console.log('User not authenticated, redirecting to login...');
    window.location.href = '/';
    return false;
  }
  return true;
};

// Use before making API calls
if (checkAuthAndRedirect()) {
  // Proceed with API calls
  apiClient.getApplications();
}
```

## TypeScript Types

### Available Types

```typescript
// Application types
interface Application {
  _id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Request types
interface CreateApplicationRequest {
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
}

// Analytics types
interface AnalyticsStats {
  totalApplications: number;
  applicationsByStatus: {
    applied: number;
    interview: number;
    rejected: number;
    accepted: number;
    withdrawn: number;
  };
  successRate: number;
  averageResponseTime: number;
}

// Response types
interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
```

## API Endpoints Summary

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Application Endpoints
- `GET /api/applications` - Get all applications (with pagination/filtering)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `DELETE /api/applications` - Clear all applications

### Analytics Endpoints
- `GET /api/analytics/stats` - Get overall statistics
- `GET /api/analytics/trends` - Get application trends over time
- `GET /api/analytics/top-companies` - Get top companies by application count

## Usage Tips

1. **Always check authentication** before making API calls
2. **Handle errors gracefully** with try-catch blocks
3. **Use TypeScript types** for better development experience
4. **Implement loading states** for better UX
5. **Cache data appropriately** to reduce API calls
6. **Use pagination** for large datasets
7. **Validate input data** before sending to API

## Getting Started

1. Import the required services:
   ```typescript
   import { authAPI } from './services/authapis/authapis';
   import { apiClient } from './services/api/apiClient';
   ```

2. Check authentication status:
   ```typescript
   if (!authAPI.isAuthenticated()) {
     // Redirect to login
     window.location.href = '/';
   }
   ```

3. Make API calls:
   ```typescript
   const applications = await apiClient.getApplications();
   ```

4. Handle responses and errors appropriately.

This guide covers all the available API endpoints and provides comprehensive examples for using them in your InternTrack application.
