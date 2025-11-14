/**
 * API Service
 * Centralized service for making API calls with consistent error handling
 */

import axios from 'axios';
import { API_BASE_URL, API_CONFIG } from '../config/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  // For development with self-signed certificates on localhost
  // This is automatically handled by the browser's fetch API
  withCredentials: false,
});

// Request interceptor - no authentication required (login removed)
apiClient.interceptors.request.use(
  (config) => {
    // No token needed - authentication removed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - please login again');
          // Optionally redirect to login
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - please try again later');
          break;
        default:
          console.error('An error occurred:', error.response.statusText);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - unable to connect to server');
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API call wrapper with consistent error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} data - Request data
 * @param {object} options - Additional axios options
 * @returns {Promise} - API response
 */
export const apiCall = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, options);
    return {
      success: response.data.replyCode === 'success',
      data: response.data.data,
      message: response.data.replyMsg,
      sid: response.data.sid,
      raw: response.data,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error),
      error: error,
    };
  }
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  } else if (error.response) {
    return error.response.data?.replyMsg || 'An error occurred. Please try again.';
  } else if (error.request) {
    return 'Unable to connect to server. Please check your connection and try again.';
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

// Specific API methods
export const authAPI = {
  login: (email, password, roleId = '3') => {
    return apiCall('/login', { email, password, role_id: roleId });
  },
};

export const subjectsAPI = {
  getSubjectsList: () => {
    return apiCall('/subjects_list', {});
  },
  getActivitiesList: () => {
    return apiCall('/activities_list', {});
  },
};

export const coursesAPI = {
  getCoursesList: (userId) => {
    return apiCall('/self_page_courses_list', { user_id: userId });
  },
};

export const profileAPI = {
  updateProfile: (userId, profileData) => {
    return apiCall('/update_profile', { user_id: userId, ...profileData });
  },
};

export default {
  apiCall,
  authAPI,
  subjectsAPI,
  coursesAPI,
  profileAPI,
};

