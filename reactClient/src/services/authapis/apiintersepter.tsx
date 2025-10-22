import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const url = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: url,
  withCredentials: true,
});

// Track ongoing refresh attempts to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
    Cookies.set('accessToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } else {
    delete axiosInstance.defaults.headers.Authorization;
    Cookies.remove('accessToken');
  }
};

// Initialize axios with stored token on app load
const initializeAuth = () => {
  const storedToken = Cookies.get('accessToken');
  if (storedToken) {
    setAuthToken(storedToken);
  }
};
initializeAuth();

// -- Auth Helpers --
export async function logout() {
  try {
    await axios.post(`${url}/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    setAuthToken(null);
    isRefreshing = false;
    failedQueue = [];
    window.location.href = '/login';
  }
}

export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    // If already refreshing, wait for the current refresh to complete
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    console.log('Attempting to refresh token...');
    const response = await axios.post(
      `${url}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      }
    );

    console.log('Refresh response:', response.data);
    const accessToken = response.data?.data?.accessToken || response.data?.accessToken;

    if (!accessToken) {
      throw new Error('No access token returned from refresh endpoint');
    }

    setAuthToken(accessToken);
    processQueue(null, accessToken);
    console.log('Token refreshed successfully');

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    processQueue(error, null);
    setAuthToken(null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

// -- Response Interceptor --
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response) {
      const { status, data } = error.response;
      const pathname = window.location.pathname;

      console.log('Interceptor error:', { status, data, pathname });

      // Case 1: Token is missing or refresh is invalid
      const dataMessage =
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as { message: string }).message
          : undefined;

     if (
  status === 401 &&
  dataMessage &&
  (
    dataMessage.toLowerCase().includes('no token') ||
    dataMessage.toLowerCase().includes('not logged in') ||
    dataMessage.toLowerCase().includes('unauthorized')
  )
) {
  if (!pathname.includes('/login') && !pathname.includes('/signup')) {
    console.log('No token or not logged in — logging out...');
    await logout();
  }
  return Promise.reject(error);
}

      console.log('Interceptor error:', { status, data,  });
      // Case 2: Access Token expired, try to refresh once
      if (
        status === 401 &&
        (dataMessage === 'Token is not valid.' ||
          dataMessage === 'Access token expired' ||
          dataMessage === 'jwt expired' ||
          dataMessage === 'Invalid token or token type.' ||
          dataMessage === 'Invalid token. Please log in again.' ||
          dataMessage === 'Token expired') &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;


        try {
          console.log('Token expired, attempting refresh...');

          // Prevent infinite loop: skip if already retried
          if (originalRequest._retry) {
            console.log('Already retried once, logging out...');
            if (!pathname.includes('/login')) await logout();
            return Promise.reject(error);
          }

          originalRequest._retry = true; // mark as retried
          const newToken = await refreshAccessToken(); // plain axios call

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('Retrying original request with new token');
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Refresh failed, logging out:', refreshError);
          if (!pathname.includes('/login')) {
            await logout();
          }
          return Promise.reject(refreshError);
        }
      }

      // Case 3: Other 401 errors that shouldn't trigger refresh
      if (status === 401 && originalRequest._retry) {
        console.log('Request already retried, logging out...');
        if (!pathname.includes('/login')) {
          await logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;