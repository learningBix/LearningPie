/**
 * API Service
 * Centralized service for making API calls with consistent error handling
 */

import axios from 'axios';
import { API_BASE_URL, API_CONFIG, BLOB_BASE_URL } from '../config/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config; // no token required
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - please login again');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Error:', error.response.statusText);
      }
    } else if (error.request) {
      console.error('Network error - unable to connect to server');
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API call wrapper
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
      error,
    };
  }
};

/**
 * Friendly error message handler
 */
const getErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  } else if (error.response) {
    return (
      error.response.data?.replyMsg ||
      'An error occurred. Please try again.'
    );
  } else if (error.request) {
    return 'Unable to connect to server. Please check your connection.';
  } else {
    return 'An unexpected error occurred.';
  }
};

/**
 * AUTH
 */
export const authAPI = {
  login: (email, password, roleId = '3') =>
    apiCall('/login', { email, password, role_id: roleId }),
};

/**
 * SUBJECTS
 */
export const subjectsAPI = {
  getSubjectsList: () => apiCall('/subjects_list', {}),
  getActivitiesList: () => apiCall('/activities_list', {}),
};

/**
 * COURSES
 */
export const coursesAPI = {
  getCoursesList: (userId) =>
    apiCall('/self_page_courses_list', { user_id: userId }),
};

/**
 * PROFILE
 */
export const profileAPI = {
  updateProfile: (userId, profileData) =>
    apiCall('/update_profile', { user_id: userId, ...profileData }),
};

/**
 * CONTENT (Mythology, Rhymes, Stories)
 */
export const contentsAPI = {
  getMythologyStories: () =>
    apiCall('/pix_contents_list', {
      keyword: '',
      age_group_id: '47',
      start: '0',
      limit: '200',
    }),

  getRhymesList: () =>
    apiCall('/pix_contents_list', {
      keyword: '',
      age_group_id: '47',
      start: '0',
      limit: '200',
    }),

  getStoriesList: () =>
    apiCall('/pix_contents_list', {
      keyword: '',
      age_group_id: '47',
      start: '0',
      limit: '200',
    }),
};

// Exporting blob URL so components can use it
export { BLOB_BASE_URL };

export default {
  apiCall,
  authAPI,
  subjectsAPI,
  coursesAPI,
  profileAPI,
  contentsAPI,
  BLOB_BASE_URL,
};
