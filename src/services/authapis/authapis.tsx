const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasApplicationCreated?: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// API Client Class
class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Signup user
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get current user info
  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    return this.makeRequest<{ success: boolean; data: { user: User } }>('/auth/me');
  }

  // Logout user (clear token from localStorage)
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Note: hasApplicationCreated flag is stored in user object, so it gets cleared automatically
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  // Store auth data
  storeAuthData(user: User, token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Set hasApplicationCreated flag
  setHasApplicationCreated(hasCreated: boolean): void {
    const user = this.getStoredUser();
    if (user) {
      user.hasApplicationCreated = hasCreated;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Get hasApplicationCreated flag
  getHasApplicationCreated(): boolean {
    const user = this.getStoredUser();
    return user?.hasApplicationCreated || false;
  }
}

// Create and export instance
export const authAPI = new AuthAPI();

// Export types
export type { User, AuthResponse, LoginRequest, SignupRequest, ApiError };

// Export utility functions
export const authUtils = {
  // Check if token is expired (basic check)
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Clear all auth data
  clearAuth: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};
