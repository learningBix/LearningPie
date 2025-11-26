import { apiCall } from "./apiService";

export const loginAPI = {
  
  // Step 1 → Send OTP
  sendOtp: async (email) => {
    return await apiCall("/otp_generate_email", { email });
  },

  // Step 2 → Verify OTP
  verifyOtp: async (email, otp) => {
    return await apiCall("/otp_verify_email", { email, otp });
  },

  // Step 3 → Check Subscription
  checkSubscription: async (sid) => {
    return await apiCall("/check_student_subscription", { sid });
  }
};

export default loginAPI;
