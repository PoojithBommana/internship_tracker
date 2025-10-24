import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Types for Applications
interface Application {
  _id: string;
  companyName: string;
  position: string;
  location: string;
  applicationDate: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected' | 'Withdrawn';
  applicationType: 'Summer' | 'Winter' | 'Fall' | 'Spring' | 'Full-time' | 'Part-time';
  source: string;
  jobLink?: string;
  resumeVersion?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  followUpDate?: string;
  interviewRounds?: InterviewRound[];
  offerDetails?: OfferDetails;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InterviewRound {
  round: string;
  date: string;
  result: 'Pending' | 'Completed' | 'Passed' | 'Failed' | 'Cancelled';
}

interface OfferDetails {
  stipend?: string;
  duration?: string;
  startDate?: string;
}

interface CreateApplicationRequest {
  companyName: string;
  position: string;
  location: string;
  applicationDate: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected' | 'Withdrawn';
  applicationType: 'Summer' | 'Winter' | 'Fall' | 'Spring' | 'Full-time' | 'Part-time';
  source: string;
  jobLink?: string;
  resumeVersion?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  followUpDate?: string;
  interviewRounds?: InterviewRound[];
  offerDetails?: OfferDetails;
}

interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {}

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

interface ApplicationResponse {
  success: boolean;
  data: {
    application: Application;
  };
  message?: string;
}

// Types for Analytics
interface AnalyticsStats {
  totalApplications: number;
  applicationsByStatus: {
    Applied: number;
    'Under Review': number;
    Interview: number;
    Accepted: number;
    Rejected: number;
    Withdrawn: number;
  };
  successRate: number;
  averageResponseTime: number;
}

interface TrendData {
  date: string;
  count: number;
}

interface CompanyData {
  company: string;
  count: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsStats | TrendData[] | CompanyData[];
}

// API Client Class with humanized methods
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Application Management Methods
  async fetchAllApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApplicationsResponse> {
    const response: AxiosResponse<ApplicationsResponse> = await this.axiosInstance.get('/applications', {
      params,
    });
    return response.data;
  }

  async fetchApplicationById(id: string): Promise<ApplicationResponse> {
    const response: AxiosResponse<ApplicationResponse> = await this.axiosInstance.get(`/applications/${id}`);
    return response.data;
  }

  async createNewApplication(applicationData: CreateApplicationRequest): Promise<ApplicationResponse> {
    const response: AxiosResponse<ApplicationResponse> = await this.axiosInstance.post('/applications', applicationData);
    return response.data;
  }

  async updateExistingApplication(id: string, applicationData: UpdateApplicationRequest): Promise<ApplicationResponse> {
    const response: AxiosResponse<ApplicationResponse> = await this.axiosInstance.put(`/applications/${id}`, applicationData);
    return response.data;
  }

  async removeApplication(id: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.axiosInstance.delete(`/applications/${id}`);
    return response.data;
  }

  async clearAllApplications(): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.axiosInstance.delete('/applications');
    return response.data;
  }

  // User-specific Methods
  async fetchUserApplications(userId: string): Promise<ApplicationsResponse> {
    const response: AxiosResponse<ApplicationsResponse> = await this.axiosInstance.get(`/applications/user/${userId}`);
    return response.data;
  }

  // Filtering and Search Methods
  async filterApplicationsByCriteria(params: {
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const response: AxiosResponse<ApplicationsResponse> = await this.axiosInstance.get('/applications/filter', {
      params,
    });
    return response.data;
  }

  async sortApplicationsByField(params: {
    by?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const response: AxiosResponse<ApplicationsResponse> = await this.axiosInstance.get('/applications/sort', {
      params,
    });
    return response.data;
  }

  async searchApplicationsByKeywords(params: {
    company?: string;
    position?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const response: AxiosResponse<ApplicationsResponse> = await this.axiosInstance.get('/applications/search', {
      params,
    });
    return response.data;
  }

  // Analytics Methods
  async fetchApplicationTrends(params?: {
    period?: '1month' | '3months' | '6months' | '1year';
  }): Promise<{ success: boolean; data: any }> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get('/analytics/trends', {
      params,
    });
    return response.data;
  }

  async fetchTopCompanies(params?: {
    limit?: number;
  }): Promise<{ success: boolean; data: any }> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.axiosInstance.get('/analytics/top-companies', {
      params,
    });
    return response.data;
  }

  // Utility Methods
  async getApplicationStats(): Promise<AnalyticsResponse> {
    const response: AxiosResponse<AnalyticsResponse> = await this.axiosInstance.get('/analytics/stats');
    return response.data;
  }

  // Health Check
  async checkApiHealth(): Promise<{ status: string; timestamp: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string }> = await this.axiosInstance.get('/health');
    return response.data;
  }
}

// Create and export instance
export const apiClient = new ApiClient();

// Export types
export type {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationsResponse,
  ApplicationResponse,
  AnalyticsStats,
  TrendData,
  CompanyData,
  AnalyticsResponse,
  InterviewRound,
  OfferDetails
};