import axios from 'axios';
import { API_BASE_URL, API_CONFIG, BLOB_BASE_URL, isAPIConfigured } from '../config/api';

if (!isAPIConfigured()) {
  console.error(
    '❌ API base URL is not configured!\n' +
    'Please create a .env file with REACT_APP_API_BASE_URL\n' +
    'See .env.example for reference.'
  );
} else if (process.env.NODE_ENV === 'development') {
  console.log('✅ API Base URL loaded from .env:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: API_CONFIG.withCredentials,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const authAPI = {
  login: (email, password, roleId = '3') =>
    apiCall('/login', { email, password, role_id: roleId }),
};

/**
 * SUBJECTS
 */
export const subjectsAPI = {
  getSubjectsList: () => {
    return apiCall('/subjects_list', {});
  },
  getActivitiesList: () => {
    return apiCall('/activities_list', {});
  },
  checkStudentSubscription: (sid) => {
    return apiCall('/check_student_subscription', { sid });
  },
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

export const dashboardAPI = {
  getDemoClassDetails: (sid) => {
    return apiCall('/demo_class_details', { sid });
  },
  getGroupPostList: ({ group_id = '', keyword = '', learning = '1', user_id = '' } = {}) => {
    return apiCall('/group_post_list', { group_id, keyword, learning, user_id });
  },
  fetchAssessmentReport: (studentId) => {
    return apiCall('/fetch_assesment_report_student', { student_id: studentId });
  },
  getDayLiveClassesList: ({ subscription_date, course_id, sid }) => {
    return apiCall('/day_live_classes_list', { subscription_date, course_id, sid });
  },
};

export const recordedClassesAPI = {
  fetchTermsCourses: ({ age_group_id, terms = ['3'] } = {}) => {
    return apiCall('/fetch_terms_courses', { age_group_id, terms });
  },
  viewChapterLessonsInfo: ({ course_chapter_id, student_id, type = '0' } = {}) => {
    return apiCall('/student_view_chapter_lessons_info', { 
      course_chapter_id, 
      student_id, 
      type 
    });
  },
  viewCourseInfo: ({ quarter_id, user_id, sid = '' } = {}) => {
    return apiCall('/student_view_course_info', { quarter_id, user_id, sid });
  },
  getSessionDetails: ({ session_id, user_id, sid = '' } = {}) => {
    return apiCall('/student_view_session_details', { session_id, user_id, sid });
  },
  getPixContentsList: ({ age_group_id, keyword = '' } = {}) => {
    return apiCall('/pix_contents_list', { age_group_id, keyword });
  },
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
  dashboardAPI,
  recordedClassesAPI,
  BLOB_BASE_URL,
};
