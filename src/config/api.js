// Validate that required environment variables are set
const validateEnvVars = () => {
  const required = ['REACT_APP_API_BASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
      'Using default values. Please create a .env file based on .env.example'
    );
  }
  
  return missing.length === 0;
};

// Validate on load (in development)
if (process.env.NODE_ENV === 'development') {
  validateEnvVars();
}

// Get base URL from environment variables (.env file)
// Default fallback for development if .env is not set
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';

// Blob storage base URL
export const BLOB_BASE_URL =
  process.env.REACT_APP_BLOB_BASE_URL ||
  'https://learningbixcom.blob.core.windows.net/learningbixcom/';

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/login',
  SUBJECTS_LIST: '/subjects_list',
  ACTIVITIES_LIST: '/activities_list',
  COURSES_LIST: '/self_page_courses_list',
  UPDATE_PROFILE: '/update_profile',
  CHECK_STUDENT_SUBSCRIPTION: '/check_student_subscription',
  // Dashboard endpoints
  DEMO_CLASS_DETAILS: '/demo_class_details',
  GROUP_POST_LIST: '/group_post_list',
  FETCH_ASSESSMENT_REPORT_STUDENT: '/fetch_assesment_report_student',
  DAY_LIVE_CLASSES_LIST: '/day_live_classes_list',
};

// API Configuration
export const API_CONFIG = {
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials if needed (cookies, authorization headers)
  withCredentials: process.env.REACT_APP_API_WITH_CREDENTIALS === 'true',
};

// Export validation function for external use
export const isAPIConfigured = () => {
  return !!API_BASE_URL && API_BASE_URL.length > 0;
};

export default {
  API_BASE_URL,
  BLOB_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG,
  isAPIConfigured,
};

