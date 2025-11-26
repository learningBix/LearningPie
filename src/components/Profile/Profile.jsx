import React, { useState, useEffect } from 'react';
import './Profile.css';
import EditProfile from './EditProfile/EditProfile';
import MyStats from './MyStats/MyStats';
import Assessments from './Assessments/Assessments';

const Profile = ({ user, userData: initialUserData, onBack, onLogout, onUserDataUpdate, onNavigateToProfile }) => {
  // Manage userData state internally - Profile is the source of truth for user data
  const [userData, setUserData] = useState(initialUserData || user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showMyStats, setShowMyStats] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);

  // Update userData when initialUserData or user changes
  useEffect(() => {
    if (initialUserData) {
      setUserData(initialUserData);
    } else if (user) {
      setUserData(user);
    }
  }, [initialUserData, user]);

  const handleEditProfileClick = () => {
    setIsEditingProfile(true);
  };

  const handleBackFromEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfileInternal = (updatedData) => {
    // Update internal userData state - Profile is the source of truth for all user data
    const updatedUserData = { ...userData, ...updatedData };
    setUserData(updatedUserData);
    
    // Notify parent component (Dashboard) about the update so it can sync
    // This ensures other Dashboard components (ParentSection, RecordedClasses, etc.) get updated data
    if (onUserDataUpdate) {
      onUserDataUpdate(updatedUserData);
    }
    
    setIsEditingProfile(false);
  };

  const handleViewStatsClick = () => {
    setShowMyStats(true);
  };

  const handleBackFromMyStats = () => {
    setShowMyStats(false);
  };

  const handleSeePerformanceClick = () => {
    setShowAssessments(true);
  };

  const handleBackFromAssessments = () => {
    setShowAssessments(false);
  };

  // Render nested views
  if (showAssessments) {
    return <Assessments onBack={handleBackFromAssessments} />;
  }

  if (showMyStats) {
    return (
      <MyStats 
        user={userData || user}
        onBack={handleBackFromMyStats}
      />
    );
  }

  if (isEditingProfile) {
    return (
      <EditProfile 
        user={userData}
        onBack={handleBackFromEdit}
        onSave={handleSaveProfileInternal}
      />
    );
  }

  // Main profile view
  return (
    <div className="my-profile-section">
      <div className="profile-page-header">
        <div className="profile-page-header-left">
          <button className="profile-back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1 className="profile-page-title">My Profile</h1>
        </div>
        <button className="profile-logout-btn" onClick={onLogout}>
          Logout →
        </button>
      </div>
      
      <div className="profile-header-card">
        <div className="profile-image-placeholder">
          {userData?.profile_image ? (
            <img src={userData.profile_image} alt="Profile" />
          ) : (
            <div className="profile-img-icon">🖼️</div>
          )}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{userData?.name || user?.name || 'Student Name'}</h2>
          <p className="profile-age">Age: {userData?.age || user?.age || 'Not specified'}</p>
        </div>
        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={handleEditProfileClick}>
            Edit Profile
          </button>
          <button className="change-avatar-btn">Change Avatar →</button>
        </div>
      </div>

      <div className="profile-cards-container">
        <div className="my-stats-card">
          <div className="rocket-illustration">🚀</div>
          <h3 className="stats-title">My stats</h3>
          <button className="view-stats-btn" onClick={handleViewStatsClick}>→</button>
        </div>

        <div className="assessments-card">
          <h3 className="assessments-title">Assessments</h3>
          <button className="see-performance-btn" onClick={handleSeePerformanceClick}>See Performance →</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

