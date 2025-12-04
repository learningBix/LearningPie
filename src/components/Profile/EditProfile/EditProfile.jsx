import React, { useState, useEffect } from 'react';
import { profileAPI, ageGroupsAPI } from '../../../services/apiService';
import './EditProfile.css';

const EditProfile = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    schoolName: '',
    age: '',
    address: '',
    parentName: '',
    phoneNumber: '',
    gender: '',
    gstNumber: '',
    state: ''
  });

  const [states] = useState([
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]);

  // Age groups now come dynamically from backend (/age_group_list)
  const [ageGroups, setAgeGroups] = useState([]);
  const [ageGroupsLoading, setAgeGroupsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load age groups from backend once on mount
  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        setAgeGroupsLoading(true);
        const response = await ageGroupsAPI.getAgeGroups();
        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data.map(group => ({
            id: String(group.id),
            label: `${group.title} (${group.age_from} yr. - ${group.age_to} yr.)`,
          }));
          setAgeGroups(mapped);
        } else {
          console.warn('Failed to load age groups:', response);
        }
      } catch (error) {
        console.error('Error fetching age groups:', error);
      } finally {
        setAgeGroupsLoading(false);
      }
    };

    fetchAgeGroups();
  }, []);

  // Map numeric gender to text value
  const mapNumericToGender = (gender) => {
    if (!gender) return '';
    const genderMap = {
      '1': 'Male',
      '2': 'Female',
      '3': 'Other'
    };
    // If it's already text, return as is; if numeric, map it
    return genderMap[gender] || gender;
  };

  useEffect(() => {
    // Load user data into form
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || user.dob || '',
        schoolName: user.schoolName || user.school_name || '',
        // Prefer age_group_id; fall back to age if needed
        age: user.age_group_id || user.age || '',
        address: user.address || '',
        parentName: user.parentName || user.parents_name || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        gender: mapNumericToGender(user.gender || ''),
        gstNumber: user.gstNumber || user.gst || '',
        state: user.state || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Map gender text to numeric value
  const mapGenderToNumeric = (gender) => {
    if (!gender) return '';
    const genderMap = {
      'Male': '1',
      'Female': '2',
      'Other': '3'
    };
    return genderMap[gender] || gender;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      // Safely resolve the correct student ID (some payloads use different keys)
      const studentId =
        user?.id ||
        user?.student_id ||
        user?.user_id;

      if (!studentId) {
        alert('Unable to identify student ID. Please re-login and try again.');
        return;
      }

      // Prepare payload with proper field mappings
      const payload = {
        name: formData.name,
        address: formData.address,
        gender: mapGenderToNumeric(formData.gender),
        time_zone: '0', // Default time zone
        dob: formData.dateOfBirth, // Already in YYYY-MM-DD format from date input
        gst: formData.gstNumber || '',
        parents_name: formData.parentName || '',
        school_name: formData.schoolName || '',
        state: formData.state || '',
        // Send selected age group ID to backend
        age_group_id: formData.age || '',
        // Keep age for backward compatibility if needed
        age: formData.age || ''
      };

      const response = await profileAPI.updateProfile(studentId, payload);

      if (response.success || response.raw?.replyCode === 'success') {
        setSuccessMessage('Profile updated successfully!');
        // Update the user data with the saved values
        const updatedUserData = {
          ...formData,
          name: formData.name // Ensure name is included
        };
        if (onSave) {
          onSave(updatedUserData);
        }
        // Clear success message after 2 seconds
        setTimeout(() => {
          setSuccessMessage('');
          if (onBack) {
            onBack();
          }
        }, 2000);
      } else {
        alert(response.message || response.raw?.replyMsg || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.oldPassword.trim()) {
      errors.oldPassword = 'This Field is required';
    }
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'This Field is required';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    const sid =
      user?.sid ||
      localStorage.getItem('sid') ||
      sessionStorage.getItem('sid');

    if (!sid) {
      alert('Unable to identify session. Please re-login and try again.');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await profileAPI.changePassword({
        sid,
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success || response.raw?.replyCode === 'success') {
        alert('Password changed successfully.');
        setShowChangePasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '' });
        setPasswordErrors({ oldPassword: '', newPassword: '' });
      } else {
        const msg =
          response.message ||
          response.raw?.replyMsg ||
          'Unable to change password. Please try again.';
        alert(msg);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      {/* Header */}
      <div className="edit-profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Form */}
      <div className="edit-profile-form-wrapper">
        <h2 className="form-section-title">Details</h2>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-field">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-field">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="schoolName">School Name</label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="age">Age</label>
                <select
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                >
                  <option value="">Select age group</option>
                  {ageGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-field">
                <label htmlFor="parentName">Parent Name</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Enter parent name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-field">
                <label htmlFor="gender">Select Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="gstNumber">GST Number</label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST number (optional)"
                />
              </div>

              <div className="form-field">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="">Select state</option>
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Details'}
            </button>
            <button 
              type="button" 
              className="change-password-link"
              onClick={() => setShowChangePasswordModal(true)}
            >
              Click here to Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="change-password-modal-overlay">
          <div className="change-password-modal">
            <button
              className="change-password-modal-close"
              onClick={() => setShowChangePasswordModal(false)}
            >
              ×
            </button>
            <h2 className="change-password-title">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="change-password-form">
              <div className="change-password-fields">
                <div className="change-password-field">
                  <label htmlFor="oldPassword">Old Password</label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordInputChange}
                  />
                  {passwordErrors.oldPassword && (
                    <span className="change-password-error">{passwordErrors.oldPassword}</span>
                  )}
                </div>
                <div className="change-password-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                  />
                  {passwordErrors.newPassword && (
                    <span className="change-password-error">{passwordErrors.newPassword}</span>
                  )}
                </div>
              </div>
              <div className="change-password-actions">
                <button
                  type="button"
                  className="change-password-close-btn"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="change-password-save-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;