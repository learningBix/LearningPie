/**
 * Utility functions for user-related operations
 */

/**
 * Get student ID from various sources with proper fallback
 * @param {Object} user - User object
 * @returns {number|null} Student ID or null if not found
 */
export const getStudentId = (user = null) => {
  const sources = [
    user?.id,
    user?.student_id,
    user?.user_id,
    localStorage.getItem('student_id'),
    sessionStorage.getItem('student_id')
  ];

  for (const source of sources) {
    if (source && source !== 'undefined' && source !== 'null' && source !== '') {
      const parsed = typeof source === 'string' ? parseInt(source, 10) : source;
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
};

/**
 * Get session ID from storage
 * @returns {string} Session ID or empty string
 */
export const getSid = () => {
  return localStorage.getItem('sid') || sessionStorage.getItem('sid') || '';
};

/**
 * Helper to safely convert value to number
 * @param {any} val - Value to convert
 * @returns {number} Converted number or 0
 */
export const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'string' ? parseInt(val, 10) : val;
  return isNaN(num) ? 0 : num;
};

