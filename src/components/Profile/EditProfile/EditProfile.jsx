import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../../services/apiService';
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

  const [ageGroups] = useState([
    'Jr. KG (3.5 yr. - 4.5 yr.)',
    'Sr. KG (4.5 yr. - 5.5 yr.)',
    'Grade 1 (5.5 yr. - 6.5 yr.)',
    'Grade 2 (6.5 yr. - 7.5 yr.)',
    'Grade 3 (7.5 yr. - 8.5 yr.)',
    'Grade 4 (8.5 yr. - 9.5 yr.)',
    'Grade 5 (9.5 yr. - 10.5 yr.)'
  ]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
        age: user.age || '',
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
        state: formData.state || ''
      };

      const response = await profileAPI.updateProfile(user.id, payload);

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

  return (
    <div className="edit-profile-container">
      {/* Header */}
      <div className="edit-profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Edit Profile
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
                  {ageGroups.map((group, index) => (
                    <option key={index} value={group}>{group}</option>
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
              onClick={() => alert('Change password functionality coming soon!')}
            >
              Click here to Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;

