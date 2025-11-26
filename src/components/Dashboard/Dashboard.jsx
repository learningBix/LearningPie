import React, { useState, useEffect } from 'react';
import { coursesAPI, dashboardAPI, subjectsAPI } from '../../services/apiService';
import './Dashboard.css';
import ParentSection from '../ParentSection/ParentSection';
import HindiSessions from '../HindiSessions/HindiSessions';
import MythologicalTales from '../MythologicalTales/MythologicalTales';
import RhymeTime from '../RhymeTime/RhymeTime';
import StoryTime from '../StoryTime/StoryTime';
import MyCourses from '../MyCourses/MyCourses';
import EditProfile from '../EditProfile/EditProfile';
import RecordedClasses from '../RecordedClasses/RecordedClasses';
import BonusSessions from '../BonusSessions/BonusSessions';
import logoPie from '../../assets/logo-pie.png';
import Community from '../Community/Community';
import Invite from '../invite/invite';
import MyStats from '../MyStats/MyStats';

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showMyStats, setShowMyStats] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);
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

  // Get student ID with proper fallback
  const getStudentId = () => {
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

  // Get session ID from storage
  const getSid = () => {
    return localStorage.getItem('sid') || sessionStorage.getItem('sid') || '';
  };

  useEffect(() => {
    const studentId = getStudentId();
    if (studentId) {
      localStorage.setItem('student_id', studentId.toString());
      sessionStorage.setItem('student_id', studentId.toString());
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
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

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    const studentId = getStudentId();
    const sid = getSid();

    if (!studentId) {
      console.error('Cannot fetch data: Student ID not found');
      return;
    }

    // Fetch Assessment Report (runs in background)
    fetchAssessmentData(studentId);

    // Fetch Student Subscriptions (runs in background)
    if (sid) {
      fetchSubscriptionData(sid);
    }

    // Fetch Group Posts (runs in background)
    fetchGroupPostsData(studentId);
  };

  // Separate function for assessment data
  const fetchAssessmentData = async (studentId) => {
    try {
      const assessmentResponse = await dashboardAPI.fetchAssessmentReport(studentId);

      if (assessmentResponse.success && assessmentResponse.data) {
        // Helper to safely convert to number
        const toNumber = (val) => {
          if (val === null || val === undefined || val === '') return 0;
          const num = typeof val === 'string' ? parseInt(val, 10) : val;
          return isNaN(num) ? 0 : num;
        };

        const assessmentData = {
          stories: toNumber(assessmentResponse.data.stories),
          rhymes: toNumber(assessmentResponse.data.rhymes),
          bonus: toNumber(assessmentResponse.data.bonus),
          recorded_class: toNumber(assessmentResponse.data.recorded_class),
          live_class: toNumber(assessmentResponse.data.live_class),
          robotics: toNumber(assessmentResponse.data.robotics)
        };

        console.log('Assessment Report Response:', assessmentResponse.data);
        console.log('Processed Assessment Data:', assessmentData);

        setAssessmentData(assessmentData);

        setCourseProgress(prev => ({
          ...prev,
          liveClasses: assessmentData.live_class,
          bonusSessions: assessmentData.bonus
        }));

        console.log('✅ Assessment data loaded');
      } else {
        console.warn('Assessment report fetch failed or returned no data:', assessmentResponse);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  };

  // Separate function for subscription data
  const fetchSubscriptionData = async (sid) => {
    try {
      const subscriptionResponse = await subjectsAPI.checkStudentSubscription(sid);

      if (subscriptionResponse.success && subscriptionResponse.data) {
        const subscriptions = subscriptionResponse.data || [];
        setStudentSubscriptions(subscriptions);

        setCourseProgress(prev => ({
          ...prev,
          courseTaken: subscriptions.length,
          totalCourses: Math.max(subscriptions.length, 3)
        }));

        // Fetch live classes
        if (subscriptions.length > 0) {
          const subscriptionDate = subscriptions[0]?.course_start_date ||
            user?.subscription_date ||
            new Date().toISOString().split('T')[0];

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
            const allLiveClasses = liveClassesResponses
              .filter(response => response.success && response.data)
              .flatMap(response => response.data || []);

            setLiveClassesList(allLiveClasses);
          } catch (error) {
            console.error('Error fetching live classes:', error);
          }
        }

        console.log('✅ Subscriptions loaded');
      }

      // Fetch demo class details
      const demoClassResponse = await dashboardAPI.getDemoClassDetails(sid);
      if (demoClassResponse.success) {
        setDemoClassDetails(demoClassResponse.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  // Separate function for group posts
  const fetchGroupPostsData = async (studentId) => {
    try {
      const groupPostsResponse = await dashboardAPI.getGroupPostList({
        group_id: '',
        keyword: '',
        learning: '1',
        user_id: studentId
      });

      if (groupPostsResponse.success && groupPostsResponse.data) {
        setGroupPosts(groupPostsResponse.data || []);
        console.log('✅ Group posts loaded');
      }
    } catch (error) {
      console.error('Error fetching group posts:', error);
    }
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
  };

  const handleSidebarClick = (title) => {
    setActiveSection(title);
  };

  const handleMyProfileClick = () => {
    setShowUserDropdown(false);
    setIsEditingProfile(false);
    setActiveSection('My Profile');
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleBackToDashboard = () => {
    setActiveSection('Dashboard');
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

  // Function to track video watch and update stats
  const handleVideoWatch = async (videoType) => {
    console.log('🎥 handleVideoWatch called with videoType:', videoType);
    
    try {
      const studentIdRaw = user?.id || userData?.id || user?.student_id || user?.user_id;
      if (!studentIdRaw) {
        console.warn('⚠️ Cannot track video watch: Student ID not found', { user, userData });
        return;
      }

      const studentId = typeof studentIdRaw === 'string' ? parseInt(studentIdRaw, 10) : studentIdRaw;
      console.log('👤 Tracking video watch for student:', studentId, 'type:', videoType);

      // Map video types to assessment data keys
      const videoTypeMap = {
        'recorded_class': 'recorded_class',
        'live_class': 'live_class',
        'stories': 'stories',
        'rhymes': 'rhymes',
        'bonus': 'bonus',
        'robotics': 'robotics',
        'diy_home': 'robotics'
      };

      const assessmentKey = videoTypeMap[videoType] || videoType;
      console.log('📊 Assessment key:', assessmentKey);

      // Optimistically update local state immediately (don't wait for API)
      setAssessmentData(prev => {
        const newCount = (prev[assessmentKey] || 0) + 1;
        console.log(`✅ Updated ${assessmentKey} from ${prev[assessmentKey]} to ${newCount}`);
        return {
          ...prev,
          [assessmentKey]: newCount
        };
      });

      // Refresh assessment data from server to ensure accuracy
      try {
        const assessmentResponse = await dashboardAPI.fetchAssessmentReport(studentId);
        if (assessmentResponse.success && assessmentResponse.data) {
          const toNumber = (val) => {
            if (val === null || val === undefined || val === '') return 0;
            const num = typeof val === 'string' ? parseInt(val, 10) : val;
            return isNaN(num) ? 0 : num;
          };

          const updatedData = {
            stories: toNumber(assessmentResponse.data.stories),
            rhymes: toNumber(assessmentResponse.data.rhymes),
            bonus: toNumber(assessmentResponse.data.bonus),
            recorded_class: toNumber(assessmentResponse.data.recorded_class),
            live_class: toNumber(assessmentResponse.data.live_class),
            robotics: toNumber(assessmentResponse.data.robotics)
          };
          
          console.log('🔄 Refreshed assessment data from server:', updatedData);
          setAssessmentData(updatedData);
        }
      } catch (apiError) {
        console.warn('⚠️ Error refreshing assessment data:', apiError);
      }
    } catch (error) {
      console.error('❌ Error in handleVideoWatch:', error);
    }
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
              <span className="user-name">Hi, {userData.name || user.name || 'Student'} ▼</span>
              <div className="user-avatar">
                {userData.profile_image || user.profile_image ? (
                  <img src={userData.profile_image || user.profile_image} alt="User" />
                ) : (
                  <div className="avatar-placeholder">{(userData.name || user.name || 'S')[0]}</div>
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

        {/* Main Content */}
        <main className={`main-content ${
          activeSection === 'Parent Section' ||
          activeSection === 'My Courses' ||
          activeSection === 'My Profile' ||
          activeSection === 'Recorded Classes' ||
          activeSection === 'Bonus Sessions' ||
          activeSection === 'Story Time' ||
          activeSection === 'Rhyme Time' ||
          activeSection === 'Mythological Tales' ||
          activeSection === 'Hindi Sessions' ||
          activeSection === 'Community' ||
          activeSection === 'Invite & Earn'
            ? 'full-width'
            : ''
        }`}>
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
            <RecordedClasses user={userData} userData={userData} onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'Bonus Sessions' ? (
            <BonusSessions user={userData} userData={userData} onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'My Profile' ? (
            showAssessments ? (
              <div>Assessments Component</div>
            ) : showMyStats ? (
              <MyStats 
                statsData={assessmentData}
                onBack={handleBackFromMyStats}
              />
            ) : isEditingProfile ? (
              <EditProfile 
                user={userData}
                onBack={handleBackFromEdit}
                onSave={handleSaveProfile}
              />
            ) : (
              <div className="my-profile-section">
                <div className="profile-page-header">
                  <div className="profile-page-header-left">
                    <button className="profile-back-btn" onClick={handleBackToDashboard}>
                      ← Back
                    </button>
                    <h1 className="profile-page-title">My Profile</h1>
                  </div>
                  <button className="profile-logout-btn" onClick={handleLogoutClick}>
                    Logout →
                  </button>
                </div>
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
                    <button className="view-stats-btn" onClick={handleViewStatsClick}>→</button>
                  </div>

                  <div className="assessments-card">
                    <h3 className="assessments-title">Assessments</h3>
                    <button className="see-performance-btn" onClick={handleSeePerformanceClick}>See Performance →</button>
                  </div>
                </div>
              </div>
            )
          ) : activeSection === 'Story Time' ? (
            <StoryTime onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'Rhyme Time' ? (
            <RhymeTime onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'Mythological Tales' ? (
            <MythologicalTales />
          ) : activeSection === 'Hindi Sessions' ? (
            <HindiSessions />
          ) : activeSection === 'Community' ? (
            <Community user={user} />
          ) : activeSection === 'Invite & Earn' ? (
            <Invite />
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

        {/* Right Sidebar with Live Assessment Data */}
        {activeSection !== 'Parent Section' &&
          activeSection !== 'My Courses' &&
          activeSection !== 'My Profile' &&
          activeSection !== 'Recorded Classes' &&
          activeSection !== 'Bonus Sessions' &&
          activeSection !== 'Story Time' &&
          activeSection !== 'Rhyme Time' &&
          activeSection !== 'Mythological Tales' &&
          activeSection !== 'Hindi Sessions' &&
          activeSection !== 'Community' &&
          activeSection !== 'Invite & Earn' && (
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
                      style={{
                        width: `${courseProgress.totalCourses > 0 ? (courseProgress.courseTaken / courseProgress.totalCourses) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <span className="progress-label">
                    {assessmentData.live_class} Live classes Taken
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${assessmentData.live_class > 0 ? Math.min((assessmentData.live_class / 10) * 100, 100) : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <span className="progress-label">
                    {assessmentData.bonus} Bonus Sessions Taken
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${assessmentData.bonus > 0 ? Math.min((assessmentData.bonus / 10) * 100, 100) : 0}%`
                      }}
                    ></div>
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