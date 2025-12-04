import React, { useState, useEffect } from 'react';
import { coursesAPI, dashboardAPI, subjectsAPI } from '../../services/apiService';
import { getStudentId, getSid, toNumber } from '../../utils/userUtils';
import './Dashboard.css';
import ParentSection from '../ParentSection/ParentSection';
import HindiSessions from '../HindiSessions/HindiSessions';
import MythologicalTales from '../MythologicalTales/MythologicalTales';
import RhymeTime from '../RhymeTime/RhymeTime';
import StoryTime from '../StoryTime/StoryTime';
import MyCourses from '../MyCourses/MyCourses';
import RecordedClasses from '../RecordedClasses/RecordedClasses';
import BonusSessions from '../BonusSessions/BonusSessions';
import LiveClass from '../LiveClasses/LiveClass';
import logoPie from '../../assets/logo-pie.png';
import Community from '../Community/Community';
import Invite from '../invite/invite';
import Profile from '../Profile/Profile';



const Dashboard = ({ user, onLogout }) => {
  // Initialize activeSection from localStorage or default to 'Dashboard'
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const savedSection = localStorage.getItem('dashboard_active_section') || 
                          sessionStorage.getItem('dashboard_active_section');
      return savedSection || 'Dashboard';
    } catch (err) {
      console.warn('Error reading saved section:', err);
      return 'Dashboard';
    }
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
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
  const [journeyCourseType, setJourneyCourseType] = useState('jkg');


  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dashboard_active_section', activeSection);
      sessionStorage.setItem('dashboard_active_section', activeSection);
    } catch (err) {
      console.warn('Error saving active section:', err);
    }
  }, [activeSection]);

  useEffect(() => {
    const studentId = getStudentId(user);
    if (studentId) {
      localStorage.setItem('student_id', studentId.toString());
      sessionStorage.setItem('student_id', studentId.toString());
      
      // Restore profile_image from persistent storage if user object doesn't have it
      if (user && !user.profile_image) {
        try {
          const savedAvatar = localStorage.getItem(`profile_image_${studentId}`) || 
                             sessionStorage.getItem(`profile_image_${studentId}`);
          if (savedAvatar) {
            const updatedUser = { ...user, profile_image: savedAvatar };
            setUserData(updatedUser);
            // Update localStorage user object too
            localStorage.setItem('user', JSON.stringify(updatedUser));
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('✅ Restored profile_image in Dashboard:', savedAvatar);
          }
        } catch (err) {
          console.warn('Error restoring profile_image:', err);
        }
      }
      
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
    const studentId = getStudentId(user);
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

  // Separate function for assessment data (used for Dashboard right sidebar)
  // Note: MyStats component now fetches its own data, but we still need this for the sidebar
  const fetchAssessmentData = async (studentId) => {
    try {
      const assessmentResponse = await dashboardAPI.fetchAssessmentReport(studentId);

      if (assessmentResponse.success && assessmentResponse.data) {
        const assessmentData = {
          stories: toNumber(assessmentResponse.data.stories),
          rhymes: toNumber(assessmentResponse.data.rhymes),
          bonus: toNumber(assessmentResponse.data.bonus),
          recorded_class: toNumber(assessmentResponse.data.recorded_class),
          live_class: toNumber(assessmentResponse.data.live_class),
          robotics: toNumber(assessmentResponse.data.robotics)
        };

        console.log('Dashboard - Assessment data loaded for sidebar:', assessmentData);

        setAssessmentData(assessmentData);

        setCourseProgress(prev => ({
          ...prev,
          liveClasses: assessmentData.live_class,
          bonusSessions: assessmentData.bonus
        }));

        console.log('✅ Dashboard assessment data loaded');
      } else {
        console.warn('Dashboard - Assessment report fetch failed:', assessmentResponse);
      }
    } catch (error) {
      console.error('Dashboard - Error fetching assessment:', error);
    }
  };

  // Separate function for subscription data
  const fetchSubscriptionData = async (sid) => {
    try {
      const subscriptionResponse = await subjectsAPI.checkStudentSubscription(sid);

      if (subscriptionResponse.success && subscriptionResponse.data) {
        const subscriptions = subscriptionResponse.data || [];
        setStudentSubscriptions(subscriptions);

        // Derive course type for Journey (pg, nursery, jkg, skg) from subscription data
        if (subscriptions.length > 0) {
          const primarySub = subscriptions[0];
          const rawName = (primarySub.course_name || primarySub.course || '').toString().toLowerCase();

          let derivedType = 'jkg';
          if (rawName.includes('senior') || rawName.includes('skg')) {
            derivedType = 'skg';
          } else if (rawName.includes('junior') || rawName.includes('jkg')) {
            derivedType = 'jkg';
          } else if (rawName.includes('nursery')) {
            derivedType = 'nursery';
          } else if (rawName.includes('playgroup') || rawName.includes('pg') || rawName.includes('play group')) {
            derivedType = 'pg';
          }

          setJourneyCourseType(derivedType);
        }

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
    { id: 8, title: 'Parent Section', icon: '👨‍👩‍👧', color: '#E91E63', section: 'Parent Section' },
    { id: 9, title: 'Mythological Tales', icon: '👼', color: '#9C27B0', section: 'Mythological Tales' },
    { id: 10, title: 'Hindi Sessions', icon: '💻', color: '#00BCD4', section: 'Hindi Sessions' },
    { id: 11, title: 'Invite & Earn', icon: '🔗', color: '#66BB6A', section: 'Invite & Earn' },
    { id: 12, title: 'Community', icon: '👥', color: '#29B6F6', section: 'Community' }
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
    setActiveSection('My Profile');
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    // Clear saved section on logout
    try {
      localStorage.removeItem('dashboard_active_section');
      sessionStorage.removeItem('dashboard_active_section');
    } catch (err) {
      console.warn('Error clearing saved section:', err);
    }
    if (onLogout) {
      onLogout();
    }
  };

  const handleBackToDashboard = () => {
    setActiveSection('Dashboard');
  };

  // Callback to sync userData from Profile component
  // Profile component manages userData internally and notifies Dashboard when it changes
  // This ensures other Dashboard components (ParentSection, RecordedClasses, etc.) get updated data
  const handleUserDataUpdate = (updatedUserData) => {
    setUserData(updatedUserData);
    try {
      const stored = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const merged = { ...stored, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      sessionStorage.setItem('user', JSON.stringify(merged));
      
      // Also store profile_image in persistent storage if it exists
      if (updatedUserData.profile_image) {
        const studentId = getStudentId(userData || user);
        if (studentId) {
          localStorage.setItem(`profile_image_${studentId}`, updatedUserData.profile_image);
          sessionStorage.setItem(`profile_image_${studentId}`, updatedUserData.profile_image);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  // Function to track video watch and update stats
  const handleVideoWatch = async (videoType) => {
    console.log('🎥 handleVideoWatch called with videoType:', videoType);
    
    try {
      const studentId = getStudentId(userData || user);
      if (!studentId) {
        console.warn('⚠️ Cannot track video watch: Student ID not found', { user, userData });
        return;
      }
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
          <div className="user-menu-wrapper">
            <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <span className="user-name">{userData.name || user.name || 'Student'} ▼</span>
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
          activeSection === 'Parent Section' ||
          activeSection === 'My Courses' ||
          activeSection === 'My Profile' ||
          activeSection === 'Live Class' ||
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
            <ParentSection user={userData} courseType={journeyCourseType} />
          ) : activeSection === 'My Courses' ? (
            <MyCourses courseType={journeyCourseType} />
          ) : activeSection === 'Live Class' ? (
            <LiveClass />
          ) : activeSection === 'Recorded Classes' ? (
            <RecordedClasses user={userData} userData={userData} onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'Bonus Sessions' ? (
            <BonusSessions user={userData} userData={userData} onVideoWatch={handleVideoWatch} />
          ) : activeSection === 'My Profile' ? (
            <Profile
              user={user}
              userData={userData}
              onBack={handleBackToDashboard}
              onLogout={handleLogoutClick}
              onUserDataUpdate={handleUserDataUpdate}
              onNavigateToProfile={handleMyProfileClick}
            />
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
          ) : activeSection === 'Live Class' ? (
            <LiveClass />
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
          activeSection !== 'Live Class' &&
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