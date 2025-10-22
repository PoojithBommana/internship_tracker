// Comprehensive API Usage Examples
// This file demonstrates how to use all the available API endpoints

import { authAPI } from '../services/authapis/authapis';
import { apiClient } from '../services/api/apiClient';

// ============================================================================
// AUTHENTICATION API EXAMPLES
// ============================================================================

// Example 1: User Registration
export const signupExample = async () => {
  try {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const response = await authAPI.signup(userData);
    
    if (response.success) {
      console.log('User created:', response.data.user);
      console.log('Token:', response.data.token);
      
      // Store auth data automatically
      authAPI.storeAuthData(response.data.user, response.data.token);
    }
  } catch (error) {
    console.error('Signup failed:', error.message);
  }
};

// Example 2: User Login
export const loginExample = async () => {
  try {
    const credentials = {
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const response = await authAPI.login(credentials);
    
    if (response.success) {
      console.log('Login successful:', response.data.user);
      // Auth data is automatically stored
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Example 3: Get Current User
export const getCurrentUserExample = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    
    if (response.success) {
      console.log('Current user:', response.data.user);
    }
  } catch (error) {
    console.error('Get user failed:', error.message);
  }
};

// Example 4: Check Authentication Status
export const checkAuthExample = () => {
  const isAuthenticated = authAPI.isAuthenticated();
  console.log('User is authenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    const user = authAPI.getStoredUser();
    console.log('Stored user:', user);
  }
};

// Example 5: Logout
export const logoutExample = () => {
  authAPI.logout();
  console.log('User logged out');
};

// ============================================================================
// APPLICATION API EXAMPLES
// ============================================================================

// Example 6: Get All Applications with Pagination
export const getApplicationsExample = async () => {
  try {
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
  } catch (error) {
    console.error('Get applications failed:', error.message);
  }
};

// Example 7: Get Single Application
export const getApplicationByIdExample = async (applicationId: string) => {
  try {
    const response = await apiClient.getApplicationById(applicationId);
    
    if (response.success) {
      console.log('Application details:', response.data.application);
    }
  } catch (error) {
    console.error('Get application failed:', error.message);
  }
};

// Example 8: Create New Application
export const createApplicationExample = async () => {
  try {
    const applicationData = {
      company: 'Google',
      position: 'Software Engineering Intern',
      status: 'applied' as const,
      appliedDate: new Date().toISOString(),
      interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      notes: 'Applied through company website. Very excited about this opportunity!'
    };

    const response = await apiClient.createApplication(applicationData);
    
    if (response.success) {
      console.log('Application created:', response.data.application);
    }
  } catch (error) {
    console.error('Create application failed:', error.message);
  }
};

// Example 9: Update Application
export const updateApplicationExample = async (applicationId: string) => {
  try {
    const updateData = {
      status: 'interview' as const,
      interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      notes: 'Got an interview! Scheduled for next week.'
    };

    const response = await apiClient.updateApplication(applicationId, updateData);
    
    if (response.success) {
      console.log('Application updated:', response.data.application);
    }
  } catch (error) {
    console.error('Update application failed:', error.message);
  }
};

// Example 10: Delete Application
export const deleteApplicationExample = async (applicationId: string) => {
  try {
    const response = await apiClient.deleteApplication(applicationId);
    
    if (response.success) {
      console.log('Application deleted:', response.message);
    }
  } catch (error) {
    console.error('Delete application failed:', error.message);
  }
};

// Example 11: Clear All Applications
export const clearAllApplicationsExample = async () => {
  try {
    const response = await apiClient.clearAllApplications();
    
    if (response.success) {
      console.log('All applications cleared:', response.message);
    }
  } catch (error) {
    console.error('Clear applications failed:', error.message);
  }
};

// ============================================================================
// ANALYTICS API EXAMPLES
// ============================================================================

// Example 12: Get Analytics Statistics
export const getAnalyticsStatsExample = async () => {
  try {
    const response = await apiClient.getAnalyticsStats();
    
    if (response.success) {
      const stats = response.data;
      console.log('Total Applications:', stats.totalApplications);
      console.log('Success Rate:', stats.successRate);
      console.log('Applications by Status:', stats.applicationsByStatus);
      console.log('Average Response Time:', stats.averageResponseTime);
    }
  } catch (error) {
    console.error('Get analytics failed:', error.message);
  }
};

// Example 13: Get Application Trends
export const getApplicationTrendsExample = async () => {
  try {
    const response = await apiClient.getApplicationTrends();
    
    if (response.success) {
      console.log('Application trends:', response.data);
      // response.data is an array of { date: string, count: number }
    }
  } catch (error) {
    console.error('Get trends failed:', error.message);
  }
};

// Example 14: Get Top Companies
export const getTopCompaniesExample = async () => {
  try {
    const response = await apiClient.getTopCompanies();
    
    if (response.success) {
      console.log('Top companies:', response.data);
      // response.data is an array of { company: string, count: number }
    }
  } catch (error) {
    console.error('Get top companies failed:', error.message);
  }
};

// ============================================================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================================================

// Example 15: Complete User Workflow
export const completeWorkflowExample = async () => {
  try {
    // Step 1: Register a new user
    console.log('Step 1: Registering user...');
    await signupExample();
    
    // Step 2: Check authentication
    console.log('Step 2: Checking authentication...');
    checkAuthExample();
    
    // Step 3: Create multiple applications
    console.log('Step 3: Creating applications...');
    await createApplicationExample();
    
    // Step 4: Get all applications
    console.log('Step 4: Fetching applications...');
    await getApplicationsExample();
    
    // Step 5: Get analytics
    console.log('Step 5: Fetching analytics...');
    await getAnalyticsStatsExample();
    await getApplicationTrendsExample();
    await getTopCompaniesExample();
    
    // Step 6: Update an application (if you have an ID)
    // await updateApplicationExample('application-id-here');
    
    // Step 7: Logout
    console.log('Step 7: Logging out...');
    logoutExample();
    
  } catch (error) {
    console.error('Workflow failed:', error);
  }
};

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

// Example 16: Comprehensive Error Handling
export const errorHandlingExample = async () => {
  try {
    // This will fail if user is not authenticated
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Example 17: Check Token Expiration
export const checkTokenExpiration = () => {
  const token = authAPI.getStoredUser();
  if (token) {
    const isExpired = authAPI.isTokenExpired(token);
    console.log('Token is expired:', isExpired);
  }
};

// Example 18: Clear All Auth Data
export const clearAllAuthData = () => {
  authAPI.logout();
  console.log('All authentication data cleared');
};

// Export all examples for easy importing
export const apiExamples = {
  // Authentication
  signupExample,
  loginExample,
  getCurrentUserExample,
  checkAuthExample,
  logoutExample,
  
  // Applications
  getApplicationsExample,
  getApplicationByIdExample,
  createApplicationExample,
  updateApplicationExample,
  deleteApplicationExample,
  clearAllApplicationsExample,
  
  // Analytics
  getAnalyticsStatsExample,
  getApplicationTrendsExample,
  getTopCompaniesExample,
  
  // Workflows
  completeWorkflowExample,
  errorHandlingExample,
  
  // Utilities
  checkTokenExpiration,
  clearAllAuthData
};
