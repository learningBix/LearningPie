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
  timeout: 60000, // ⚠️ Increased to 60 seconds for slow queries
  headers: API_CONFIG.headers,
  withCredentials: API_CONFIG.withCredentials,
});

apiClient.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log('📤 API Request:', {
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
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
  registerStudent: (studentData) => {
    return apiCall('/register_student', studentData);
  },
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
  updateProfile: (userId, profileData) => {
    // Map form data to API payload format
    const payload = {
      id: userId,
      name: profileData.name || '',
      address: profileData.address || '',
      profile_image: profileData.profile_image || profileData.profileImage || '',
      gender: profileData.gender || '',
      time_zone: profileData.time_zone || '0',
      dob: profileData.dob || profileData.dateOfBirth || '',
      gst: profileData.gst || profileData.gstNumber || '',
      parents_name: profileData.parents_name || profileData.parentName || '',
      school_name: profileData.school_name || profileData.schoolName || '',
      state: profileData.state || '',
      // Use age_group_id as the source of truth for age selection
      age_group_id:
        profileData.age_group_id ||
        profileData.ageGroupId ||
        profileData.age ||
        '',
      // Keep age for backward compatibility if any API still uses it
      age: profileData.age || ''
    };
    return apiCall('/update_student_profile', payload);
  },
  // Update only profile image (used by avatar change flow)
  updateProfileImage: (userId, imageUrl) => {
    return apiCall('/update_profile_image', {
      id: userId,
      image: imageUrl,
    });
  },
  // Fetch user profile data from backend
  // NOTE: This requires backend to have a getProfile endpoint or return profile_image in login response
  // Currently, we don't have a dedicated getProfile API, so this is a placeholder
  // For now, profile_image should come from login response or localStorage
  // TODO: Backend team should add a getProfile endpoint or include profile_image in login response
  getProfile: async (userId) => {
    // For now, return null since we don't have a proper getProfile endpoint
    // Calling updateProfile with empty values would overwrite user's profile data (DANGEROUS)
    // Backend should provide a dedicated endpoint like: GET /get_student_profile?student_id={userId}
    console.warn('⚠️ getProfile API not available - backend needs to provide getProfile endpoint or include profile_image in login response');
    return {
      success: false,
      data: null,
      profile_image: null
    };
  },
  changePassword: ({ sid, currentPassword, newPassword }) => {
    return apiCall('/change_password', {
      sid,
      current_password: currentPassword,
      password: newPassword
    });
  },
};

/**
 * AGE GROUPS
 * Used for dynamic age group dropdowns (e.g. Edit Profile)
 */
export const ageGroupsAPI = {
  getAgeGroups: ({ keyword = '', learning = '1' } = {}) => {
    return apiCall('/age_group_list', { keyword, learning });
  },
  getAgeGroupsDropdown: ({ learning = '1' } = {}) => {
    return apiCall('/age_group_list_dropdown', { learning });
  },
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
  
  // Update student lesson status for assessment pie (stories, rhymes, bonus, recorded, live, diy)
  updateCourseStatusPie: ({
    student_id,
    type,
    lesson_id = '0',
    chapter_id = '0',
    ref_id = '0',
    percentage = '100',
    duration = '0'
  }) => {
    return apiCall('/update_course_status_pie', {
      student_id,
      lesson_id,
      chapter_id,
      ref_id,
      type,
      percentage,
      duration
    });
  },
  
  getGroupPostList: ({ group_id = '', keyword = '', learning = '1', user_id = '' } = {}) => {
    // Convert user_id to number if it's a string
    const numericUserId = typeof user_id === 'string' ? parseInt(user_id, 10) : user_id;
    
    console.log('🔍 Calling group_post_list with user_id:', numericUserId);
    
    return apiCall('/group_post_list', { 
      group_id, 
      keyword, 
      learning, 
      user_id: numericUserId 
    });
  },
  
  fetchAssessmentReport: async (studentId) => {
    // Convert to number if string
    const numericId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    
    // Validate
    if (!numericId || isNaN(numericId) || numericId <= 0) {
      console.error('❌ Invalid student_id:', studentId);
      return {
        success: false,
        data: null,
        message: 'Invalid student ID'
      };
    }

    console.log('🔍 Calling fetchAssessmentReport with student_id:', numericId);
    console.log('⏱️ This may take 30-60 seconds due to large database...');
    
    try {
      // Try with extended timeout
      const response = await apiCall('/fetch_assesment_report_student', { 
        student_id: numericId 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Assessment API error:', error);
      
      // If timeout, return default empty data instead of failing
      if (error.code === 'ECONNABORTED') {
        console.warn('⚠️ Request timed out, returning default empty data');
        return {
          success: true, // Mark as success so app doesn't break
          data: {
            id: 0,
            stories: 0,
            rhymes: 0,
            bonus: 0,
            recorded_class: 0,
            live_class: 0,
            robotics: 0
          },
          message: 'Data loaded with defaults due to slow response'
        };
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch assessment data'
      };
    }
  },
  
  getDayLiveClassesList: ({ subscription_date, course_id, sid }) => {
    return apiCall('/day_live_classes_list', { subscription_date, course_id, sid });
  },
  
  fetchStudentAssessmentReport: async ({ assessment_id, student_id }) => {
    const numericAssessmentId = typeof assessment_id === 'string' ? parseInt(assessment_id, 10) : assessment_id;
    const numericStudentId = typeof student_id === 'string' ? parseInt(student_id, 10) : student_id;
    
    if (!numericAssessmentId || isNaN(numericAssessmentId) || numericAssessmentId <= 0) {
      return {
        success: false,
        data: null,
        message: 'Invalid assessment ID'
      };
    }
    
    if (!numericStudentId || isNaN(numericStudentId) || numericStudentId <= 0) {
      return {
        success: false,
        data: null,
        message: 'Invalid student ID'
      };
    }
    
    console.log('📊 Fetching student assessment report:', { assessment_id: numericAssessmentId, student_id: numericStudentId });
    
    try {
      const response = await apiCall('/fetchStudentAssessmentReport', {
        assessment_id: numericAssessmentId,
        student_id: numericStudentId
      });
      
      return response;
    } catch (error) {
      console.error('❌ Student Assessment Report API error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch assessment report'
      };
    }
  },
  
  getStudentAssessmentList: async ({ student_id, assessment_id = '', status = '1', learning = '1' }) => {
    const numericStudentId = typeof student_id === 'string' ? parseInt(student_id, 10) : student_id;
    
    if (!numericStudentId || isNaN(numericStudentId) || numericStudentId <= 0) {
      return {
        success: false,
        data: null,
        message: 'Invalid student ID'
      };
    }
    
    console.log('📋 Fetching student assessment list:', { student_id: numericStudentId, assessment_id, status, learning });
    
    try {
      const response = await apiCall('/student_assesment_list', {
        assessment_id: assessment_id || '',
        student_id: numericStudentId,
        status: status,
        learning: learning
      });
      
      return response;
    } catch (error) {
      console.error('❌ Student Assessment List API error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch assessment list'
      };
    }
  },
  
  getStudentTrackInfo: async ({ student_id, course_id }) => {
    const numericStudentId = typeof student_id === 'string' ? parseInt(student_id, 10) : student_id;
    const numericCourseId = typeof course_id === 'string' ? parseInt(course_id, 10) : course_id;
    
    if (!numericStudentId || isNaN(numericStudentId) || numericStudentId <= 0) {
      return {
        success: false,
        data: null,
        message: 'Invalid student ID'
      };
    }
    
    if (!numericCourseId || isNaN(numericCourseId) || numericCourseId <= 0) {
      return {
        success: false,
        data: null,
        message: 'Invalid course ID'
      };
    }
    
    console.log('📊 Fetching student track info:', { student_id: numericStudentId, course_id: numericCourseId });
    
    try {
      const response = await apiCall('/student_track_info', {
        student_id: numericStudentId,
        course_id: numericCourseId
      });
      
      return response;
    } catch (error) {
      console.error('❌ Student Track Info API error:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch course progress'
      };
    }
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
  // NEW METHOD - Add this
  viewCourseInfo: ({ id, student_id } = {}) => {
    return apiCall('/student_view_course_info', { id, student_id });
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