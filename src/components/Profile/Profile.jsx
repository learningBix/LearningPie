import React, { useState, useEffect } from 'react';
import './Profile.css';
import EditProfile from './EditProfile/EditProfile';
import MyStats from './MyStats/MyStats';
import Assessments from './Assessments/Assessments';
import ChangeAvatar from './Avatar/Avatar';
import { profileAPI } from '../../services/apiService';

const Profile = ({ user, userData: initialUserData, onBack, onLogout, onUserDataUpdate }) => {
  const [userData, setUserData] = useState(initialUserData || user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [showMyStats, setShowMyStats] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);

  useEffect(() => {
    setUserData(initialUserData || user);
  }, [initialUserData, user]);

  const handleSaveProfileInternal = (updatedData) => {
    const updatedUserData = { ...userData, ...updatedData };
    setUserData(updatedUserData);

    if (onUserDataUpdate) {
      onUserDataUpdate(updatedUserData);
    }
    setIsEditingProfile(false);
  };

  const handleAvatarSave = async (avatar) => {
    // Update locally first for instant UI feedback
    const updatedUserData = { ...userData, profile_image: avatar };
    setUserData(updatedUserData);
    if (onUserDataUpdate) {
      onUserDataUpdate(updatedUserData);
    }

    // Persist to server (optional): call profile API to update profile_image
    try {
      const studentId = userData?.id || user?.id || user?.student_id || user?.user_id;
      if (studentId) {
        const res = await profileAPI.updateProfile(studentId, { profile_image: avatar });
        if (!(res && (res.success === true || res.replyCode === 'success'))) {
          console.warn('Failed to persist avatar on server:', res);
        }
      }
    } catch (err) {
      console.error('Error saving avatar to server', err);
    }
    setIsChangingAvatar(false);
  };

  // Render second layer screens
  if (showAssessments) {
    return <Assessments onBack={() => setShowAssessments(false)} user={userData || user} />;
  }

  if (showMyStats) {
    return (
      <MyStats
        user={userData}
        onBack={() => setShowMyStats(false)}
      />
    );
  }

  if (isEditingProfile) {
    return (
      <EditProfile
        user={userData}
        onBack={() => setIsEditingProfile(false)}
        onSave={handleSaveProfileInternal}
      />
    );
  }

  if (isChangingAvatar) {
    return (
      <ChangeAvatar
        currentAvatar={userData?.profile_image}
        onBack={() => setIsChangingAvatar(false)}
        onSave={handleAvatarSave}
      />
    );
  }

  // Main profile screen
  return (
    <div className="my-profile-section">
      {/* Header */}
      <div className="profile-page-header">
        <div className="profile-page-header-left">
          <button className="profile-back-btn" onClick={onBack}>← Back</button>
          <h1 className="profile-page-title">My Profile</h1>
        </div>
        <button className="profile-logout-btn" onClick={onLogout}>
          Logout →
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-header-card">
        <div className="profile-image-placeholder">
          {userData?.profile_image ? (
            <img src={userData.profile_image} alt="Profile" />
          ) : (
            <div className="profile-img-icon">🖼️</div>
          )}
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{userData?.name || "Student Name"}</h2>
          <p className="profile-age">Age: {userData?.age || "Not Specified"}</p>
        </div>

        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
            Edit Profile
          </button>
          <button className="change-avatar-btn" onClick={() => setIsChangingAvatar(true)}>
            Change Avatar →
          </button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="profile-cards-container">
        <div className="my-stats-card">
          <div className="rocket-illustration">🚀</div>
          <h3 className="stats-title">My stats</h3>
          <button className="view-stats-btn" onClick={() => setShowMyStats(true)}>→</button>
        </div>

        <div className="assessments-card">
          <h3 className="assessments-title">Assessments</h3>
          <button className="see-performance-btn" onClick={() => setShowAssessments(true)}>
            See Performance →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
