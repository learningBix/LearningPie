import React, { useState } from 'react';
import { apiCall } from '../../services/apiService';
import loginImg from "../../assets/LearningPieLogin.jpg";

const Login = ({ onLoginSuccess, onBack }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(''); // OTP received from API (for display)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!email || email.trim() === '') {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setSuccessMsg('');
    setServerOtp('');
    setLoading(true);

    try {
      console.log('📧 Sending OTP to:', email);
      
      const response = await apiCall('/otp_generate_email', { 
        email: email.trim(),
        role_id: '2'
      });

      console.log('📥 OTP Response:', response);

      if (response.success) {
        setSuccessMsg(response.message || 'OTP sent successfully! Please check your email.');
        // Try to pick OTP from different possible locations in the API response
        const possibleOtp =
          (response.data && (response.data.otp || response.data.OTP)) ||
          (response.raw && (response.raw.otp || response.raw.OTP || (response.raw.data && (response.raw.data.otp || response.raw.data.OTP))));

        if (possibleOtp) {
          console.log('✅ OTP from API (for UI display):', possibleOtp);
          setServerOtp(String(possibleOtp));
        } else {
          console.warn('⚠️ OTP not found in API response. Please verify response structure.');
        }

        setStep(2);
        console.log('✅ OTP sent successfully');
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
        console.error('❌ OTP send failed:', response.message);
      }
    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async () => {
    if (!otp || otp.trim() === '') {
      setError('Please enter the OTP');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      console.log('🔐 Verifying OTP:', { email, otp });
      
      const response = await apiCall('/otp_verify_email', { 
        email: email.trim(),
        otp: otp.trim()
      });

      console.log('📥 Verify Response:', response);

      if (response.success && response.data) {
        const userData = response.data;
        const sid = response.sid;

        console.log('✅ OTP verified successfully');
        console.log('User Data:', userData);
        console.log('Session ID:', sid);

        // Check for profile_image in login response (might be in different fields)
        // Backend might return it as profile_image, profileImage, user_profile, image, etc.
        if (!userData.profile_image) {
          userData.profile_image = userData.profileImage || 
                                   userData.user_profile || 
                                   userData.image || 
                                   userData.avatar || 
                                   null;
          if (userData.profile_image) {
            console.log('✅ Found profile_image in login response:', userData.profile_image);
          }
        }

        // Store session data
        const studentId = userData.student_id || userData.id || userData.user_id;
        
        if (studentId) {
          // Always persist studentId so refreshing the page won't log user out
          localStorage.setItem('student_id', String(studentId));
          sessionStorage.setItem('student_id', String(studentId));
          console.log('✅ Student ID stored:', studentId);
        }

        if (sid) {
          // Persist session ID to both storages so the session survives reloads
          localStorage.setItem('sid', sid);
          sessionStorage.setItem('sid', sid);
          console.log('✅ Session ID stored:', sid);
        }

        // Store user data persistently. This ensures the app remains logged in
        // across refreshes/tabs until the logout action clears localStorage.
        // Restore profile_image from persistent storage if login response doesn't have it
        try {
          // Check if we have a saved avatar for this student in persistent storage
          if (!userData.profile_image && studentId) {
            const savedAvatar = localStorage.getItem(`profile_image_${studentId}`) || 
                               sessionStorage.getItem(`profile_image_${studentId}`);
            if (savedAvatar) {
              userData.profile_image = savedAvatar;
              console.log('✅ Restored profile_image from persistent storage:', userData.profile_image);
            }
          }
          
          // Also check existing user object in localStorage (for backward compatibility)
          const existingUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
          if (!userData.profile_image && existingUser.profile_image) {
            userData.profile_image = existingUser.profile_image;
            console.log('✅ Preserved profile_image from localStorage:', userData.profile_image);
          }
        } catch (err) {
          console.warn('Error checking existing user data:', err);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Step 3: Check Subscription (optional)
        if (sid) {
          try {
            const subscriptionResponse = await apiCall('/check_student_subscription', { sid });
            console.log('📚 Subscription Data:', subscriptionResponse.data);
          } catch (subErr) {
            console.warn('⚠️ Could not fetch subscription:', subErr);
          }
        }

        // Step 4: For cross-device support, we need backend to return profile_image in login response
        // Currently, we use localStorage as fallback which is device-specific
        // TODO: Backend should include profile_image in login response for true cross-device support
        if (studentId && !userData.profile_image) {
          // Fallback to localStorage (device-specific, but better than nothing)
          const savedAvatar = localStorage.getItem(`profile_image_${studentId}`) || 
                             sessionStorage.getItem(`profile_image_${studentId}`);
          if (savedAvatar) {
            userData.profile_image = savedAvatar;
            console.log('✅ Using profile_image from localStorage (device-specific):', savedAvatar);
            // Update userData in storage
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('user', JSON.stringify(userData));
          } else {
            console.log('ℹ️ No profile_image found - backend should return it in login response for cross-device support');
          }
        }

        // Success - call parent callback
        if (onLoginSuccess) {
          onLoginSuccess({ ...userData, sid });
        }

      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        console.error('❌ OTP verification failed:', response.message);
      }
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
    setServerOtp('');
    setSuccessMsg('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && !loading) {
      action();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Orange Background */}
   <div className="hidden lg:flex lg:w-[40%]">
  <img 
    src={loginImg} 
    alt="Login Illustration" 
    className="w-full h-screen object-cover"
  />
</div>


      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-orange-500">Learning<span className="text-cyan-400">BIX</span></span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {onBack && (
              <button
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Student Sign In
            </h2>
            
            {step === 2 && (
              <p className="text-sm text-gray-600 text-center mb-6">
                Enter the OTP sent to <span className="font-semibold text-orange-600">{email}</span>
              </p>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                {successMsg}
              </div>
            )}

            <div className="space-y-6">
              {step === 1 ? (
                // Step 1: Email Input
                <>
                  <div>
                   <label className="login text-sm font-medium text-gray-700 mb-2 inline-flex">
                      Email address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleSendOtp)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your email"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </>
              ) : (
                // Step 2: OTP Input
                <>
                  <div>
                    <label className="login text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyPress={(e) => handleKeyPress(e, handleVerifyOtp)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-bold"
                      placeholder="••••"
                      maxLength="4"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please enter the 4-digit OTP sent to your email
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBackToEmail}
                      disabled={loading}
                      className="text-sm text-gray-600 hover:text-orange-500 transition-colors disabled:opacity-50"
                    >
                      ← Change Email
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(e) => setKeepLoggedIn(e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      disabled={loading}
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Keep me logged in
                    </label>
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 4}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default Login;