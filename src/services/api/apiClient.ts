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

// API Client Class
class ApiClient {
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

  // Application APIs
  async getApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/applications?${queryString}` : '/applications';
    
    return this.makeRequest<ApplicationsResponse>(endpoint);
  }

  async getApplicationById(id: string): Promise<ApplicationResponse> {
    return this.makeRequest<ApplicationResponse>(`/applications/${id}`);
  }

  async createApplication(applicationData: CreateApplicationRequest): Promise<ApplicationResponse> {
    return this.makeRequest<ApplicationResponse>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplication(id: string, applicationData: UpdateApplicationRequest): Promise<ApplicationResponse> {
    return this.makeRequest<ApplicationResponse>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async clearAllApplications(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/applications', {
      method: 'DELETE',
    });
  }

  // Get applications for a specific user
  async getUserApplications(userId: string): Promise<ApplicationsResponse> {
    return this.makeRequest<ApplicationsResponse>(`/applications/user/${userId}`);
  }

  // Filter applications by status and month
  async filterApplications(params: {
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.month) queryParams.append('month', params.month.toString());
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/applications/filter?${queryString}` : '/applications/filter';
    
    return this.makeRequest<ApplicationsResponse>(endpoint);
  }

  // Sort applications
  async sortApplications(params: {
    by?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params.by) queryParams.append('by', params.by);
    if (params.order) queryParams.append('order', params.order);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/applications/sort?${queryString}` : '/applications/sort';
    
    return this.makeRequest<ApplicationsResponse>(endpoint);
  }

  // Search applications
  async searchApplications(params: {
    company?: string;
    position?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params.company) queryParams.append('company', params.company);
    if (params.position) queryParams.append('position', params.position);
    if (params.location) queryParams.append('location', params.location);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/applications/search?${queryString}` : '/applications/search';
    
    return this.makeRequest<ApplicationsResponse>(endpoint);
  }

  // Analytics APIs
  async getAnalyticsTrends(params?: {
    period?: '1month' | '3months' | '6months' | '1year';
  }): Promise<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/trends?${queryString}` : '/analytics/trends';
    
    return this.makeRequest<{ success: boolean; data: any }>(endpoint);
  }

  async getTopCompanies(params?: {
    limit?: number;
  }): Promise<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/top-companies?${queryString}` : '/analytics/top-companies';
    
    return this.makeRequest<{ success: boolean; data: any }>(endpoint);
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
