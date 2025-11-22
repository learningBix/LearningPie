// Hardcoded API Base URL (works immediately without .env file)
const HARDCODED_API_URL = 'https://api.learningbix.com:8112/';

// Get base URL from environment variables OR use hardcoded URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || HARDCODED_API_URL;
// Azure Blob Base URL (images, videos, thumbnails)
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
  MYTHOLOGICAL_TALES: '/pix_contents_list',

};

// API Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG,
  BLOB_BASE_URL,  
};

