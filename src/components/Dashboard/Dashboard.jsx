import React, { useState, useEffect, act } from 'react';
import { coursesAPI } from '../../services/apiService';
import './Dashboard.css';
import ParentSection from '../ParentSection/ParentSection';
import HindiSessions from '../HindiSessions/HindiSessions';
import MythologicalTales from '../MythologicalTales/MythologicalTales';
import RhymeTime from '../RhymeTime/RhymeTime';
import StoryTime from '../StoryTime/StoryTime';
import MyCourses from '../MyCourses/MyCourses';
import EditProfile from '../EditProfile/EditProfile';
import logoPie from '../../assets/logo-pie.png';
import Community from '../Community/Community';
import Invite from '../invite/invite';


const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userData, setUserData] = useState(user);
  const [courseProgress, setCourseProgress] = useState({
    courseTaken: 0,
    totalCourses: 3,
    liveClasses: 0,
    bonusSessions: 0
  });

  useEffect(() => {
    // Fetch user's course progress
    fetchCourseProgress();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-menu-wrapper')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const fetchCourseProgress = async () => {
    try {
      const response = await coursesAPI.getCoursesList(user.id);
      if (response.success) {
        // Update progress based on API response
        const courses = response.data || [];
        setCourseProgress({
          courseTaken: courses.length,
          totalCourses: 3,
          liveClasses: 0,
          bonusSessions: 0
        });
      } else {
        console.log('Failed to fetch courses:', response.message);
        // Keep default values - dashboard will still work
        console.log('Using default course progress values');
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
      // Keep default values - dashboard will still work
      console.log('Using default course progress values');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const dashboardCards = [
    { id: 1, title: 'My Courses', icon: '📚', color: '#4CAF50', section: 'My Courses' },
    { id: 2, title: 'About Me', icon: '👤', color: '#8BC34A', section: 'My Profile' },
    { id: 3, title: 'Live Class', icon: '▶️', color: '#FFA726', section: 'Live Class' },
    { id: 4, title: 'Recorded Classes', icon: '📹', color: '#FF7043', section: 'Recorded Classes' },
    { id: 5, title: 'Bonus Sessions', icon: '⭐', color: '#42A5F5', section: 'Bonus Sessions' },
    { id: 6, title: 'Story Time', icon: '📖', color: '#EF5350', section: 'Story Time' },
    { id: 7, title: 'Rhyme Time', icon: '🎵', color: '#AB47BC', section: 'Rhyme Time' },
    { id: 8, title: 'Invite & Earn', icon: '🔗', color: '#66BB6A', section: 'Invite & Earn' },
    { id: 9, title: 'Community', icon: '👥', color: '#29B6F6', section: 'Community' }
  ];

  const sidebarItems = [
    { id: 1, title: 'Dashboard', icon: '▦' },
    { id: 2, title: 'Parent Section', icon: '👨‍👩‍👧' },
    { id: 3, title: 'My Courses', icon: '📚' },
    { id: 4, title: 'Live Class', icon: '▶️' },
    { id: 5, title: 'Recorded Classes', icon: '📹' },
    { id: 6, title: 'Bonus Sessions', icon: '⭐' },
    { id: 7, title: 'Story Time', icon: '☁️' },
    { id: 8, title: 'Rhyme Time', icon: '🎵' },
    { id: 9, title: 'Mythological Tales', icon: '👼' },
    { id: 10, title: 'Hindi Sessions', icon: '💻' },
    { id: 11, title: 'Community', icon: '👥' },
    { id: 12, title: 'Invite & Earn', icon: '🔗' }
  ];

  const handleCardClick = (section) => {
    setActiveSection(section);
    console.log('Navigated to:', section);
  };

  const handleSidebarClick = (title) => {
    setActiveSection(title);
    console.log('Navigated to:', title);
  };

  const handleMyProfileClick = () => {
    setShowUserDropdown(false);
    setIsEditingProfile(false);
    setActiveSection('My Profile');
    console.log('Navigated to: My Profile');
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleEditProfileClick = () => {
    setIsEditingProfile(true);
    setActiveSection('My Profile');
  };

  const handleBackFromEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = (updatedData) => {
    setUserData({ ...userData, ...updatedData });
    setIsEditingProfile(false);
  };


return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="logo">
            <img src={logoPie} alt="Learning Pie" className="logo-image" />
          </div>
        </div>
        
        <div className="header-right">
          <button className="notification-btn">
            🔔
          </button>

          <div className="user-menu-wrapper">
            <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <span className="user-name">Hi, {user.name || 'Student'} ▼</span>
              <div className="user-avatar">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="User" />
                ) : (
                  <div className="avatar-placeholder">{(user.name || 'S')[0]}</div>
                )}
              </div>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleMyProfileClick}>
                  My Profile
                </button>
                <button className="dropdown-item logout-item" onClick={handleLogoutClick}>
                  Logout
                </button>
              </div>
            )}
          </div>

          <span className="greeting">{getGreeting()}</span>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dashboard-body">

        {/* LEFT SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${activeSection === item.title ? 'active' : ''}`}
                onClick={() => handleSidebarClick(item.title)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
       <main
  className={`main-content ${
    activeSection === 'Parent Section' ||
    activeSection === 'My Courses' ||
    activeSection === 'My Profile' ||
    activeSection === 'Story Time' ||                    
    activeSection === 'Rhyme Time' || 
    activeSection === 'Mythological Tales' ||
    activeSection === 'Hindi Sessions' ||
    activeSection === 'Community' ||
    activeSection === 'Invite & Earn'
   
      ? 'full-width'
      : ''
  }`}
>
  {activeSection === 'Dashboard' ? (
    <div className="dashboard-grid">
      {dashboardCards.map(card => (
        <div
          key={card.id}
          className="dashboard-card"
          onClick={() => handleCardClick(card.section)}
          data-card-color={card.color}
          style={{ '--card-color': card.color }}
        >
          <div className="card-icon">{card.icon}</div>
          <div className="card-footer" style={{ backgroundColor: card.color }}>
            <span className="card-title">{card.title}</span>
          </div>
        </div>
      ))}
    </div>

  ) : activeSection === 'Parent Section' ? (
    <ParentSection />

  ) : activeSection === 'My Courses' ? (
    <MyCourses />
  ) : activeSection === 'Community' ? (
    <Community />

  ) : activeSection === 'My Profile' ? (
    isEditingProfile ? (
      <EditProfile
        user={userData}
        onBack={handleBackFromEdit}
        onSave={handleSaveProfile}
      />
    ) : (
      <div className="my-profile-section">
        {/* your profile UI... */}
      </div>
    )

  ) : activeSection === 'Story Time' ? (
    <StoryTime />


  
  ) : activeSection === 'Invite & Earn' ? (
    <Invite  />


  ) : activeSection === 'Rhyme Time' ? (       // ✅ ADDING RHYME TIME
    <RhymeTime />

    
   
  ) : activeSection === 'Hindi Sessions' ? ( 
    <HindiSessions /> // ✅ ADDING HINDI SESSIONS

  ) : activeSection === 'Mythological Tales' ? (  // ✅ ADDING MYTHOLOGICAL TALES
    <MythologicalTales />

  ) : (
    <div className="section-content">
      <h2 className="section-title">{activeSection}</h2>
      <div className="section-body">
        <p>Welcome to {activeSection} section.</p>
        <p>Content for this section will be available soon.</p>
      </div>
    </div>
  )}
</main>


       
       
       
        {/* RIGHT SIDEBAR */}
        {activeSection !== 'Parent Section' && 
         activeSection !== 'My Courses' && 
         activeSection !== 'My Profile' &&
         activeSection !== 'Live Class' &&
         activeSection !== 'Recorded Classes' &&
         activeSection !== 'Bonus Sessions' && 
         activeSection !== 'Story Time' &&
         activeSection !== 'Rhyme Time' &&
         activeSection !== 'Mythological Tales' &&
         activeSection !== 'Hindi Sessions' &&
         activeSection !== 'Community' &&
         activeSection !== 'Invite & Earn' &&
         activeSection !== 'Story Time' && (
          <aside className="right-sidebar">
            
            <div className="progress-card">
              <h3>Course Progress</h3>

              <div className="progress-item">
                <span className="progress-label">
                  {courseProgress.courseTaken}/{courseProgress.totalCourses} Course Taken
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(courseProgress.courseTaken / courseProgress.totalCourses) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">
                  {courseProgress.liveClasses} Live classes Taken
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="progress-item">
                <span className="progress-label">
                  {courseProgress.bonusSessions} Bonus Sessions Taken
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="stem-card">
              <h3 className="stem-title">DIY STEM Kits</h3>
              <p className="stem-subtitle">(Coming Soon)</p>
            </div>

            <div className="illustration-container">
              <div className="person-illustration">
                <div className="thought-bubbles">
                  <span className="bubble bubble-1">⚙️</span>
                  <span className="bubble bubble-2">💡</span>
                  <span className="bubble bubble-3">⭐</span>
                  <span className="bubble bubble-4">🎓</span>
                </div>

                <div className="person-working">
                  <div className="person-head"></div>
                  <div className="headphones"></div>
                  <div className="laptop-work"></div>
                </div>
              </div>

              <div className="chat-bubble-float">💬</div>
            </div>

          </aside>
        )}

      </div>
    </div>
);


};

export default Dashboard;

