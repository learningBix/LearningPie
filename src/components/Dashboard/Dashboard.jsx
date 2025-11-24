import React, { useState, useEffect } from 'react';
import { dashboardAPI, subjectsAPI } from '../../services/apiService';
import './Dashboard.css';
import ParentSection from '../ParentSection/ParentSection';
import MyCourses from '../MyCourses/MyCourses';
import EditProfile from '../EditProfile/EditProfile';
import RecordedClasses from '../RecordedClasses/RecordedClasses';
import BonusSessions from '../BonusSessions/BonusSessions';
import logoPie from '../../assets/logo-pie.png';

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
  const [assessmentData, setAssessmentData] = useState({
    stories: 0,
    rhymes: 0,
    bonus: 0,
    recorded_class: 0,
    live_class: 0,
    robotics: 0
  });
  const [liveClassesList, setLiveClassesList] = useState([]);
  const [studentSubscriptions, setStudentSubscriptions] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [demoClassDetails, setDemoClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all dashboard data
    fetchDashboardData();
  }, [user]);

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

  // Get session ID from storage
  const getSid = () => {
    return localStorage.getItem('sid') || sessionStorage.getItem('sid') || '';
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get student ID - try different possible fields
      const studentIdRaw = user?.id || user?.student_id || user?.user_id;
      const sid = getSid();

      if (!studentIdRaw) {
        console.warn('Student ID not found in user object');
        setLoading(false);
        return;
      }

      // Convert student ID to number (API expects number)
      const studentId = typeof studentIdRaw === 'string' ? parseInt(studentIdRaw, 10) : studentIdRaw;

      // Fetch assessment report for statistics
      const assessmentResponse = await dashboardAPI.fetchAssessmentReport(studentId);
      if (assessmentResponse.success && assessmentResponse.data) {
        setAssessmentData({
          stories: assessmentResponse.data.stories || 0,
          rhymes: assessmentResponse.data.rhymes || 0,
          bonus: assessmentResponse.data.bonus || 0,
          recorded_class: assessmentResponse.data.recorded_class || 0,
          live_class: assessmentResponse.data.live_class || 0,
          robotics: assessmentResponse.data.robotics || 0
        });

        // Update course progress with assessment data
        setCourseProgress(prev => ({
          ...prev,
          liveClasses: assessmentResponse.data.live_class || 0,
          bonusSessions: assessmentResponse.data.bonus || 0
        }));
      }

      // Fetch student subscriptions
      if (sid) {
        const subscriptionResponse = await subjectsAPI.checkStudentSubscription(sid);
        if (subscriptionResponse.success && subscriptionResponse.data) {
          const subscriptions = subscriptionResponse.data || [];
          setStudentSubscriptions(subscriptions);
          
          // Update course progress from subscriptions
          setCourseProgress(prev => ({
            ...prev,
            courseTaken: subscriptions.length,
            totalCourses: Math.max(subscriptions.length, 3) // At least 3 or actual count
          }));
          
          console.log('Student subscriptions:', subscriptions);

          // Fetch day live classes list using subscription data
          if (subscriptions.length > 0) {
            // Get subscription_date from first subscription or user data or use current date
            const subscriptionDate = subscriptions[0]?.course_start_date || 
                                     user?.subscription_date || 
                                     user?.subscriptionDate || 
                                     new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            // Fetch live classes for all subscribed courses in parallel
            const liveClassesPromises = subscriptions
              .filter(sub => sub.course_id)
              .map(subscription => {
                return dashboardAPI.getDayLiveClassesList({
                  subscription_date: subscriptionDate,
                  course_id: subscription.course_id,
                  sid: sid
                });
              });
            
            try {
              const liveClassesResponses = await Promise.all(liveClassesPromises);
              // Combine all live classes from all courses
              const allLiveClasses = liveClassesResponses
                .filter(response => response.success && response.data)
                .flatMap(response => response.data || []);
              
              setLiveClassesList(allLiveClasses);
              console.log('Live classes fetched for all courses:', allLiveClasses);
            } catch (error) {
              console.error('Error fetching live classes:', error);
            }
          }
        }
      }

      // Fetch demo class details
      if (sid) {
        const demoClassResponse = await dashboardAPI.getDemoClassDetails(sid);
        if (demoClassResponse.success) {
          setDemoClassDetails(demoClassResponse.data);
          console.log('Demo class details:', demoClassResponse.data);
        }
      }

      // Fetch group posts list (Community posts)
      const groupPostsResponse = await dashboardAPI.getGroupPostList({
        group_id: '',
        keyword: '',
        learning: '1',
        user_id: studentIdRaw || ''
      });
      if (groupPostsResponse.success && groupPostsResponse.data) {
        setGroupPosts(groupPostsResponse.data || []);
        console.log('Group posts fetched:', groupPostsResponse.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
        {/* Left Sidebar */}
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

        {/* Main Content */}
        <main className={`main-content ${activeSection === 'Parent Section' || activeSection === 'My Courses' || activeSection === 'My Profile' || activeSection === 'Recorded Classes' || activeSection === 'Bonus Sessions' ? 'full-width' : ''}`}>
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
            <ParentSection user={userData} />
          ) : activeSection === 'My Courses' ? (
            <MyCourses />
          ) : activeSection === 'Recorded Classes' ? (
            <RecordedClasses user={userData} userData={userData} />
          ) : activeSection === 'Bonus Sessions' ? (
            <BonusSessions user={userData} userData={userData} />
          ) : activeSection === 'My Profile' ? (
            isEditingProfile ? (
              <EditProfile 
                user={userData} 
                onBack={handleBackFromEdit}
                onSave={handleSaveProfile}
              />
            ) : (
              <div className="my-profile-section">
                <div className="profile-header-card">
                  <div className="profile-image-placeholder">
                    {userData.profile_image ? (
                      <img src={userData.profile_image} alt="Profile" />
                    ) : (
                      <div className="profile-img-icon">🖼️</div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h2 className="profile-name">{userData.name || 'Student Name'}</h2>
                    <p className="profile-age">Age: {userData.age || 'Not specified'}</p>
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
                    <button className="view-stats-btn">→</button>
                  </div>
                  
                  <div className="assessments-card">
                    <h3 className="assessments-title">Assessments</h3>
                    <button className="see-performance-btn">See Performance →</button>
                  </div>
                </div>
              </div>
            )
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

        {/* Right Sidebar - Hidden for Parent Section, My Courses, Recorded Classes, and My Profile */}
        {activeSection !== 'Parent Section' && activeSection !== 'My Courses' && activeSection !== 'Recorded Classes' && activeSection !== 'My Profile' && activeSection !== 'Bonus Sessions' && (
          <aside className="right-sidebar">
            {/* Course Progress Card */}
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
                  {assessmentData.live_class} Live classes Taken
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div className="progress-item">
                <span className="progress-label">
                  {assessmentData.bonus} Bonus Sessions Taken
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            {/* DIY STEM Kits Card */}
            <div className="stem-card">
              <h3 className="stem-title">DIY STEM Kits</h3>
              <p className="stem-subtitle">(Coming Soon)</p>
            </div>

            {/* Illustration */}
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

