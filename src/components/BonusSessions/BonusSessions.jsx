import React, { useState, useEffect } from 'react';
import './BonusSessions.css';
import { recordedClassesAPI } from '../../services/apiService';

const BonusSessions = ({ user, userData }) => {
  // Bonus Sessions data - will be populated from API
  const [bonusSessions, setBonusSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // State for quarter detail view
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [quarterSessions, setQuarterSessions] = useState([]);
  const [loadingQuarterSessions, setLoadingQuarterSessions] = useState(false);

  // State for Select Plan view
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // State for Excursions view
  const [showExcursions, setShowExcursions] = useState(false);
  const [excursionSessions, setExcursionSessions] = useState([]);
  const [loadingExcursion, setLoadingExcursion] = useState(false);
  const [selectedExcursionSession, setSelectedExcursionSession] = useState(null);

  // State for DIY Home view
  const [showDIYHome, setShowDIYHome] = useState(false);
  const [diyHomeSessions, setDiyHomeSessions] = useState([]);
  const [loadingDIYHome, setLoadingDIYHome] = useState(false);

  // State for selected session (video detail view)
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch bonus sessions (quarters + DIY Home + Excursions) from API
  const fetchBonusSessions = async () => {
    try {
      setLoadingSessions(true);
      const studentId = userData?.id || userData?.student_id || user?.id;
      
      if (!studentId) {
        console.error('❌ Student ID not found');
        setLoadingSessions(false);
        return;
      }

      // Fetch Quarter 1, Quarter 2, and Quarter 3 dynamically
      const quarter1Id = '521';
      const quarter2Id = '790';
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;

      // Fetch all quarters in parallel
      const [quarter1Response, quarter2Response, quarter3Response] = await Promise.all([
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: quarter1Id,
          student_id: studentId,
          type: '0'
        }),
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: quarter2Id,
          student_id: studentId,
          type: '0'
        }),
        recordedClassesAPI.fetchTermsCourses({ 
          age_group_id: ageGroupId,
          terms: ['3']
        })
      ]);

      // Map Quarter 1
      let quarter1 = {
        id: 1,
        title: 'Quarter 1',
        description: 'Browse through unlocked sessions for better understanding.',
        image: null,
        isPurchasable: false,
        course_chapter_id: quarter1Id,
        type: 'quarter',
      };
      
      if (quarter1Response.success && quarter1Response.raw?.data?.[0]) {
        const chapterData = quarter1Response.raw.data[0];
        let imageUrl = null;
        if (chapterData.image) {
          if (chapterData.image.startsWith('http')) {
            imageUrl = chapterData.image;
          } else {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
            imageUrl = `${baseUrl}/public/uploads/course_chapter_image/${chapterData.image}`;
          }
        }
        quarter1 = {
          id: 1,
          title: chapterData.chapter_title || 'Quarter 1',
          description: chapterData.chapter_description || 'Browse through unlocked sessions for better understanding.',
          image: imageUrl,
          isPurchasable: false,
          course_chapter_id: quarter1Id,
          type: 'quarter',
        };
      }

      // Map Quarter 2
      let quarter2 = {
        id: 2,
        title: 'Quarter 2',
        description: 'Browse through unlocked sessions for better understanding.',
        image: null,
        isPurchasable: false,
        course_chapter_id: quarter2Id,
        type: 'quarter',
      };
      
      if (quarter2Response.success && quarter2Response.raw?.data?.[0]) {
        const chapterData = quarter2Response.raw.data[0];
        let imageUrl = null;
        if (chapterData.image) {
          if (chapterData.image.startsWith('http')) {
            imageUrl = chapterData.image;
          } else {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
            imageUrl = `${baseUrl}/public/uploads/course_chapter_image/${chapterData.image}`;
          }
        }
        quarter2 = {
          id: 2,
          title: chapterData.chapter_title || 'Quarter 2',
          description: chapterData.chapter_description || 'Browse through unlocked sessions for better understanding.',
          image: imageUrl,
          isPurchasable: false,
          course_chapter_id: quarter2Id,
          type: 'quarter',
        };
      }

      // Map Quarter 3
      let quarter3 = {
        id: 3,
        title: 'Buy Quarter 3',
        description: null,
        image: null,
        isPurchasable: true,
        type: 'buy_plan',
        terms: ['3'],
      };

      const quarter3Data = (quarter3Response.raw && quarter3Response.raw.data) ? quarter3Response.raw.data : (quarter3Response.data || []);
      if (quarter3Response.success && quarter3Data && quarter3Data.length > 0) {
        const course = quarter3Data[0];
        let imageUrl = null;
        if (course.image) {
          if (course.image.startsWith('http')) {
            imageUrl = course.image;
          } else {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
            imageUrl = `${baseUrl}/uploads/${course.image}`;
          }
        }
        // Clean description - remove Curriculum, Activity Box, and More from Learning Pie sections
        let cleanedDescription = course.description || course.course_detail || null;
        if (cleanedDescription) {
          // Remove Curriculum section
          cleanedDescription = cleanedDescription.replace(/<h4[^>]*>.*?Curriculum.*?<\/h4>.*?(?=<h5|$)/is, '');
          // Remove Activity Box Includes section
          cleanedDescription = cleanedDescription.replace(/<h5>Activity Box Includes.*?<\/h5>.*?(?=<h5|$)/is, '');
          // Remove More from Learning Pie section
          cleanedDescription = cleanedDescription.replace(/<h5>More from Learning Pie.*?<\/h5>.*?(?=<|$)/is, '');
          // Clean up any remaining empty tags and whitespace
          cleanedDescription = cleanedDescription.replace(/<p><\/p>/gi, '').replace(/<p>\s*<\/p>/gi, '').trim();
          // If description is empty after cleaning, set to null
          if (!cleanedDescription || cleanedDescription === '') {
            cleanedDescription = null;
          }
        }
        
        quarter3 = {
          id: course.id || 3,
          title: course.course_name || 'Buy Quarter 3',
          description: cleanedDescription,
          image: imageUrl,
          isPurchasable: true,
          type: 'buy_plan',
          terms: ['3'],
          courseData: {
            amount: course.amount,
            fake_price: course.fake_price,
            discount: course.discount,
            tag: course.tag,
            no_of_classes: course.no_of_classes,
            curriculum: course.curriculum || course.description || '',
            course_detail: course.course_detail || '',
            description: course.description || '',
            hands_on_activities: course.hands_on_activities || ''
          }
        };
      }

      // Static bonus sessions (DIY Home and Excursions)
      const staticSessions = [
        {
          id: 4,
          title: 'DIY Home',
          description: null,
          image: null,
          isPurchasable: false,
          type: 'diy_home',
        },
        {
          id: 5,
          title: 'Excursions',
          description: null,
          image: null,
          isPurchasable: false,
          type: 'excursions',
        }
      ];

      // Combine all sessions: Quarter 1, Quarter 2, Quarter 3, DIY Home, Excursions
      const allSessions = [quarter1, quarter2, quarter3, ...staticSessions];
      setBonusSessions(allSessions);
    } catch (error) {
      console.error('❌ Error fetching bonus sessions:', error);
      // Fallback to mock data on error
      setBonusSessions([
    {
      id: 1,
      title: 'Quarter 1',
      description: 'Browse through unlocked sessions for better understanding.',
      image: null,
      isPurchasable: false,
      course_chapter_id: "521",
      type: 'quarter',
    },
    {
      id: 2,
      title: 'Quarter 2',
      description: 'Browse through unlocked sessions for better understanding.',
      image: null,
      isPurchasable: false,
      course_chapter_id: "790",
      type: 'quarter',
    },
    {
      id: 3,
      title: 'Buy Quarter 3',
      description: null,
      image: null,
      isPurchasable: true,
      type: 'buy_plan',
      terms: ['3'],
    },
    {
      id: 4,
      title: 'DIY Home',
      description: null,
      image: null,
      isPurchasable: false,
      type: 'diy_home',
    },
    {
      id: 5,
      title: 'Excursions',
      description: null,
      image: null,
      isPurchasable: false,
      type: 'excursions',
    }
  ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchBonusSessions();
  }, [userData, user]);

  // Helper to convert HTML strings from API to readable plain text
  const formatRichText = (htmlString) => {
    if (!htmlString) return '';
    return htmlString
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\t+/g, ' ')
      .replace(/\r?\n\s*\r?\n/g, '\n\n')
      .replace(/\s+\n/g, '\n')
      .trim();
  };

  // Helper to parse description HTML and extract sections
  const parseDescriptionSections = (descriptionHtml) => {
    if (!descriptionHtml) {
      return {
        curriculum: '',
        activityBox: '',
        moreFromLearningPie: ''
      };
    }

    // Find the sections using their headings
    const curriculumMatch = descriptionHtml.match(/<h4[^>]*>.*?Curriculum.*?<\/h4>(.*?)(?=Activity Box Includes|<h5|$)/is);
    const activityBoxMatch = descriptionHtml.match(/Activity Box Includes.*?<\/h5>(.*?)(?=More from Learning Pie|<h5|$)/is);
    const moreFromLearningPieMatch = descriptionHtml.match(/More from Learning Pie.*?<\/h5>(.*?)(?=<|$)/is);

    return {
      curriculum: curriculumMatch ? curriculumMatch[1].trim() : '',
      activityBox: activityBoxMatch ? activityBoxMatch[1].trim() : '',
      moreFromLearningPie: moreFromLearningPieMatch ? moreFromLearningPieMatch[1].trim() : ''
    };
  };

  /**
   * Fetch plan data for purchasable quarters
   * Uses courseData from the session object if available (from API response)
   */
  const fetchPlanData = async (session) => {
    setLoadingPlan(true);
    try {
      // If session has courseData from API, use it directly
      if (session.courseData) {
        const courseData = session.courseData;
        // Parse the description to extract the three sections
        const descriptionSections = parseDescriptionSections(courseData.description || courseData.curriculum || '');
        
        const planData = {
          courseName: session.title || 'Quarter 3',
          tag: courseData.tag || '(3 months)',
          amount: courseData.amount || 0,
          fakePrice: courseData.fake_price || courseData.amount || 0,
          image: session.image || null,
          // Use parsed sections from description, with fallbacks
          curriculum: descriptionSections.curriculum || courseData.curriculum || courseData.description || '',
          activityBox: descriptionSections.activityBox || courseData.hands_on_activities || '',
          moreFromLearningPie: descriptionSections.moreFromLearningPie || courseData.course_detail || ''
        };
        setPlanData(planData);
      } else {
        // Fallback if courseData not available
        console.warn('No courseData available for session, using fallback');
        setPlanData(null);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
      setPlanData(null);
    } finally {
      setLoadingPlan(false);
    }
  };


  /**
   * Fetch quarter sessions (lessons) from API
   */
  const fetchQuarterSessions = async (quarterId, type = '0') => {
    setLoadingQuarterSessions(true);
    try {
      const studentId = user?.id || userData?.id || userData?.student_id;
      const response = await recordedClassesAPI.viewChapterLessonsInfo({ 
        course_chapter_id: quarterId.toString(),
        student_id: studentId,
        type: type
      });
      
      if (response.success && response.raw) {
        const lessons = response.raw.lessons || [];
        
        // Map lessons to session format
        const mappedSessions = lessons.map((lesson) => {
          const content = lesson.content && lesson.content[0] ? lesson.content[0] : null;
          // Construct image URL
          let thumbnailUrl = null;
          if (lesson.image) {
            if (lesson.image.startsWith('http')) {
              thumbnailUrl = lesson.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              thumbnailUrl = `${baseUrl}/public/uploads/course_chapter_image/${lesson.image}`;
            }
          }
          
          return {
            id: lesson.id,
            title: lesson.lesson_title,
            thumbnail: thumbnailUrl,
            videoUrl: content ? content.video_url : '',
            description: content ? formatRichText(content.class_description) : '',
            requirement: content ? formatRichText(content.class_requirement) : ''
          };
        });
        
        setQuarterSessions(mappedSessions);
      } else {
        console.error('Failed to fetch quarter sessions:', response.message);
        setQuarterSessions([]);
      }
    } catch (error) {
      console.error('Error fetching quarter sessions:', error);
      setQuarterSessions([]);
    } finally {
      setLoadingQuarterSessions(false);
    }
  };

  /**
   * Fetch DIY Home sessions from pix_contents_list API
   * Filters results to only show items with type: 2
   */
  const fetchDIYHomeSessions = async () => {
    setLoadingDIYHome(true);
    try {
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      const response = await recordedClassesAPI.getPixContentsList({ 
        age_group_id: ageGroupId.toString(),
        keyword: ''
      });
      
      if (response.success && response.data) {
        // Filter to only show items with type: 2
        const diyHomeItems = response.data.filter(item => item.type === 2);
        
        // Map items to session format
        const mappedSessions = diyHomeItems.map((item) => {
          // Construct image URL
          let thumbnailUrl = null;
          if (item.image) {
            if (item.image.startsWith('http')) {
              thumbnailUrl = item.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              thumbnailUrl = `${baseUrl}/public/uploads/${item.image}`;
            }
          }
          
          return {
            id: item.id,
            title: item.title,
            thumbnail: thumbnailUrl,
            videoUrl: item.video || '',
            description: item.description || '',
            requirement: '' // PIX contents don't have requirements field
          };
        });
        
        setDiyHomeSessions(mappedSessions);
      } else {
        console.error('Failed to fetch DIY Home sessions:', response.message);
        setDiyHomeSessions([]);
      }
    } catch (error) {
      console.error('Error fetching DIY Home sessions:', error);
      setDiyHomeSessions([]);
    } finally {
      setLoadingDIYHome(false);
    }
  };

  /**
   * Fetch Excursions sessions from pix_contents_list API
   * Filters results to only show items with type: 4
   */
  const fetchExcursionsSessions = async () => {
    setLoadingExcursion(true);
    try {
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      const response = await recordedClassesAPI.getPixContentsList({ 
        age_group_id: ageGroupId.toString(),
        keyword: ''
      });
      
      if (response.success && response.data) {
        // Filter to only show items with type: 4
        const excursionItems = response.data.filter(item => item.type === 4);
        
        // Map items to session format
        const mappedSessions = excursionItems.map((item) => {
          // Construct image URL
          let thumbnailUrl = null;
          if (item.image) {
            if (item.image.startsWith('http')) {
              thumbnailUrl = item.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              thumbnailUrl = `${baseUrl}/public/uploads/${item.image}`;
            }
          }
          
          return {
            id: item.id,
            title: item.title,
            thumbnail: thumbnailUrl,
            videoUrl: item.video || '',
            description: item.description || '',
            requirement: '' // PIX contents don't have requirements field
          };
        });
        
        setExcursionSessions(mappedSessions);
      } else {
        console.error('Failed to fetch Excursions sessions:', response.message);
        setExcursionSessions([]);
      }
    } catch (error) {
      console.error('Error fetching Excursions sessions:', error);
      setExcursionSessions([]);
    } finally {
      setLoadingExcursion(false);
    }
  };

  const handleCardClick = (session) => {
    console.log('🎯 Card clicked:', { id: session.id, title: session.title, type: session.type, fullSession: session });

    // Use type-based routing instead of string matching (more robust and dynamic)
    switch (session.type) {
      case 'quarter':
        // Handle quarter/chapter cards
        if (session.course_chapter_id) {
          setSelectedQuarter(session);
          setQuarterSessions([]);
          // Use type "1" for Quarter 1 (course_chapter_id: "521") and Quarter 2 (course_chapter_id: "790"), otherwise use "0"
          const quarterType = (session.course_chapter_id === "521" || session.course_chapter_id === "790") ? "1" : "0";
          fetchQuarterSessions(session.course_chapter_id, quarterType);
        } else {
          console.warn('⚠️ Quarter card missing course_chapter_id:', session);
        }
        break;

      case 'buy_plan':
        // Handle buy plan cards - fetch plan data and show plan selection page
        fetchPlanData(session);
        setShowPlanSelection(true);
        break;

      case 'excursions':
        // Handle excursions cards - fetch sessions using pix_contents_list API
        console.log('✅ Excursions card clicked, fetching Excursions sessions');
        setShowExcursions(true);
        setExcursionSessions([]);
        fetchExcursionsSessions();
        break;

      case 'diy_home':
        // Handle DIY Home cards - fetch sessions using pix_contents_list API
        console.log('✅ DIY Home card clicked, fetching DIY Home sessions');
        setShowDIYHome(true);
        setDiyHomeSessions([]);
        fetchDIYHomeSessions();
        break;

      default:
        // Fallback for backward compatibility or unknown types
        if (session.course_chapter_id || session.title === 'Quarter 1' || session.title === 'Quarter 2' || session.id === 1 || session.id === 2) {
          setSelectedQuarter(session);
          setQuarterSessions([]);
        } else if (session.isPurchasable || session.title === 'Buy Quarter 3' || session.id === 3) {
          setShowPlanSelection(true);
        } else if (session.title === 'DIY Home' || session.id === 4) {
          console.log('✅ DIY Home card clicked, fetching DIY Home sessions');
          setShowDIYHome(true);
          setDiyHomeSessions([]);
          fetchDIYHomeSessions();
        } else if (session.title === 'Excursions' || session.id === 5) {
          console.log('✅ Excursions card clicked, fetching Excursions sessions');
          setShowExcursions(true);
          setExcursionSessions([]);
          fetchExcursionsSessions();
        } else {
          console.warn('⚠️ Unknown card type:', session.type, session.title, session.id);
        }
        break;
    }
  };

  const handleBackClick = () => {
    // If we're in session video detail view, go back to quarter/DIY sessions
    if (selectedSession) {
      setSelectedSession(null);
    } else if (selectedExcursionSession) {
      // If we're in excursion video detail view, go back to excursions list
      setSelectedExcursionSession(null);
    } else if (showExcursions) {
      // If we're in excursions view, go back to main list
      setShowExcursions(false);
      setExcursionSessions([]);
    } else if (showDIYHome) {
      // If we're in DIY Home view, go back to main list
      setShowDIYHome(false);
      setDiyHomeSessions([]);
      setLoadingDIYHome(false);
    } else if (showPlanSelection) {
      // If we're in plan selection, go back to main list
      setShowPlanSelection(false);
      setPlanData(null);
    } else {
      // If we're in quarter detail view, go back to main list
      setSelectedQuarter(null);
      setQuarterSessions([]);
      setLoadingQuarterSessions(false);
    }
  };

  const handleExcursionCardClick = (session) => {
    // When excursion card is clicked, open video detail view
    if (session) {
      setSelectedExcursionSession({
        title: session.title,
        description: session.description,
        videoUrl: session.videoUrl,
        thumbnail: session.thumbnail,
      });
    }
  };

  const handleSessionClick = (session) => {
    // Open video detail view when session card is clicked
    console.log('🎬 Session clicked:', {
      id: session.id,
      title: session.title,
      videoUrl: session.videoUrl,
      hasVideoUrl: !!session.videoUrl,
    });
    setSelectedSession(session);
  };

  // Use fetched sessions from API
  const displaySessions = bonusSessions;
  console.log('📊 Display sessions:', {
    bonusSessionsCount: bonusSessions.length,
    displaySessionsCount: displaySessions.length,
    displaySessions: displaySessions.map(s => ({ id: s.id, title: s.title, type: s.type }))
  });

  // If session video detail view should be shown, display the video player
  if (selectedSession) {
    // Log the selected session data for debugging
    console.log('📺 Selected session for video playback:', {
      id: selectedSession.id,
      title: selectedSession.title,
      videoUrl: selectedSession.videoUrl,
      hasVideoUrl: !!selectedSession.videoUrl,
      fullSession: selectedSession,
    });

    return (
      <div className="bonus-session-detail-section">
        <div className="bonus-session-detail-header">
          <h1 className="bonus-session-detail-title">{selectedSession.title}</h1>
          <button
            className="bonus-back-button"
            onClick={handleBackClick}
          >
            Back
          </button>
        </div>
        <div className="bonus-session-detail-container">
          <div className="bonus-session-video-player">
            <div className="bonus-video-player-placeholder">
              {selectedSession.videoUrl ? (
                <iframe
                  src={selectedSession.videoUrl}
                  title={selectedSession.title}
                  className="bonus-video-iframe"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="bonus-video-placeholder-content">
                  <p>Video player will be embedded here</p>
                  <p>Video URL: {selectedSession.videoUrl || 'Not available'}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bonus-session-detail-content">
            <div className="bonus-session-detail-info">
              <div className="bonus-session-info-section">
                <h3 className="bonus-session-info-label">Description</h3>
                <p className="bonus-session-info-text">
                  {selectedSession.description ? formatRichText(selectedSession.description) : 'About the session.'}
                </p>
              </div>
              {selectedSession.requirements && (
                <div className="bonus-session-info-section">
                  <h3 className="bonus-session-info-label">Requirement</h3>
                  <p className="bonus-session-info-text">
                    {formatRichText(selectedSession.requirements)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If excursion video detail view should be shown, display the video player
  if (selectedExcursionSession) {
    return (
      <div className="bonus-session-detail-section">
        <div className="bonus-session-detail-header">
          <h1 className="bonus-session-detail-title">{selectedExcursionSession.title}</h1>
          <button
            className="bonus-back-button"
            onClick={handleBackClick}
          >
            Back
          </button>
        </div>
        <div className="bonus-session-detail-container">
          <div className="bonus-session-video-player">
            <div className="bonus-video-player-placeholder">
              {selectedExcursionSession.videoUrl ? (
                <iframe
                  src={selectedExcursionSession.videoUrl}
                  title={selectedExcursionSession.title}
                  className="bonus-video-iframe"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="bonus-video-placeholder-content">
                  <p>Video player will be embedded here</p>
                  <p>Video URL: {selectedExcursionSession.videoUrl || 'Not available'}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bonus-session-detail-content">
            <div className="bonus-session-detail-info">
              <div className="bonus-session-info-section">
                <h3 className="bonus-session-info-label">Description</h3>
                <p className="bonus-session-info-text">
                  {selectedExcursionSession.description || 'About the excursion.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If excursions view should be shown, display the Excursions page
  if (showExcursions) {
    return (
      <div className="bonus-quarter-detail-section">
        <button
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="bonus-quarter-detail-header">
          <h2 className="bonus-quarter-detail-title">Excursions</h2>
        </div>
        <div className="bonus-sessions-container-grid">
          {loadingExcursion ? (
            <div className="bonus-sessions-loading">
              <div className="loading-spinner">Loading excursions...</div>
            </div>
          ) : excursionSessions.length === 0 ? (
            <div className="no-bonus-sessions">
              <p>No excursions available.</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                {loadingExcursion ? 'Loading excursions...' : 'No excursions found for your age group. Please check back later.'}
              </p>
            </div>
          ) : (
            excursionSessions.map((session) => (
              <div
                key={session.id}
                className="bonus-session-video-card"
                onClick={() => handleExcursionCardClick(session)}
              >
                <div className="bonus-session-video-thumbnail">
                  <div className="bonus-video-player-background">
                    <div className="bonus-video-books-left"></div>
                    <div className="bonus-video-screen">
                      {/* Video thumbnail image will come from session.thumbnail (API) - shown as background */}
                      {session.thumbnail && (
                        <img src={session.thumbnail} alt="" className="bonus-video-thumbnail-image" />
                      )}
                      {/* Always show play button and controls on top */}
                      <div className="bonus-play-button-icon">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                          <circle cx="30" cy="30" r="30" fill="white" opacity="0.9" />
                          <path d="M25 20L25 40L38 30L25 20Z" fill="#9BC4F7" />
                        </svg>
                      </div>
                      <div className="bonus-video-controls">
                        <div className="bonus-progress-bar-container">
                          <div className="bonus-progress-bar"></div>
                          <div className="bonus-progress-scrubber"></div>
                        </div>
                        <div className="bonus-volume-indicator">
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bonus-video-books-right"></div>
                  </div>
                </div>
                <div className="bonus-session-video-content">
                  <h3 className="bonus-session-video-title">{session.title}</h3>
                  {session.description && (
                    <p className="bonus-session-video-description">{session.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // If plan selection should be shown, display the Select Plan page
  if (showPlanSelection) {
    return (
      <div className="bonus-select-plan-section">
        <div className="bonus-select-plan-header">
          <button
            className="bonus-back-button"
            onClick={handleBackClick}
          >
            Back
          </button>
          <h1 className="bonus-select-plan-title">Select Plan</h1>
        </div>
        <div className="bonus-plan-card-container">
          {loadingPlan ? (
            <div className="bonus-plan-loading">
              <div className="loading-spinner">Loading plan details...</div>
            </div>
          ) : planData ? (
            <div className="bonus-plan-card">
              <div className="bonus-plan-header">
                {planData.image ? (
                  <img src={planData.image} alt={planData.courseName} className="bonus-plan-image" />
                ) : (
                  <div className="bonus-plan-image-placeholder"></div>
                )}
                <div className="bonus-plan-header-content">
                  <span className="bonus-plan-duration-badge">{planData.tag}</span>
                  <h2 className="bonus-plan-course-title">{planData.courseName}</h2>
                  <div className="bonus-plan-pricing">
                    <span className="bonus-plan-current-price">₹{planData.amount}</span>
                    <span className="bonus-plan-original-price">₹{planData.fakePrice}</span>
                  </div>
                </div>
              </div>

              <div className="bonus-plan-section">
                <h3 className="bonus-plan-section-title">Curriculum</h3>
                <div 
                  className="bonus-plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.curriculum || 'No curriculum information available.' }}
                />
              </div>

              <div className="bonus-plan-section">
                <h3 className="bonus-plan-section-title">Activity Box Includes</h3>
                <div 
                  className="bonus-plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.activityBox || 'No activity box information available.' }}
                />
              </div>

              <div className="bonus-plan-section">
                <h3 className="bonus-plan-section-title">More from Learning Pie</h3>
                <div 
                  className="bonus-plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.moreFromLearningPie || 'No additional information available.' }}
                />
              </div>

              <button className="bonus-enroll-now-button" onClick={() => console.log('Enroll Now clicked')}>
                Enroll Now
              </button>
            </div>
          ) : (
            <div className="bonus-plan-error">
              <p>Failed to load plan details.</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                {loadingPlan ? 'Loading plan details...' : 'No plan details found. Please check back later or contact support.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If DIY Home view should be shown, display the DIY Home page
  if (showDIYHome) {
    return (
      <div className="bonus-quarter-detail-section">
        <button
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="bonus-quarter-detail-header">
          <h2 className="bonus-quarter-detail-title">DIY Home</h2>
        </div>
        <div className="bonus-sessions-container-grid">
          {loadingDIYHome ? (
            <div className="bonus-sessions-loading">
              <div className="loading-spinner">Loading DIY activities...</div>
            </div>
          ) : diyHomeSessions.length === 0 ? (
            <div className="no-bonus-sessions">
              <p>No DIY activities available.</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                {loadingDIYHome ? 'Loading activities...' : 'No DIY Home activities found for your age group. Please check back later.'}
              </p>
            </div>
          ) : (
            diyHomeSessions.map((session) => (
              <div
                key={session.id}
                className="bonus-session-video-card"
                onClick={() => handleSessionClick(session)}
              >
                <div className="bonus-session-video-thumbnail">
                  <div className="bonus-video-player-background">
                    <div className="bonus-video-books-left"></div>
                    <div className="bonus-video-screen">
                      {/* Video thumbnail image will come from session.thumbnail (API) - shown as background */}
                      {session.thumbnail && (
                        <img src={session.thumbnail} alt="" className="bonus-video-thumbnail-image" />
                      )}
                      {/* Always show play button and controls on top */}
                      <div className="bonus-play-button-icon">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                          <circle cx="30" cy="30" r="30" fill="white" opacity="0.9" />
                          <path d="M25 20L25 40L38 30L25 20Z" fill="#9BC4F7" />
                        </svg>
                      </div>
                      <div className="bonus-video-controls">
                        <div className="bonus-progress-bar-container">
                          <div className="bonus-progress-bar"></div>
                          <div className="bonus-progress-scrubber"></div>
                        </div>
                        <div className="bonus-volume-indicator">
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bonus-video-books-right"></div>
                  </div>
                </div>
                <div className="bonus-session-video-content">
                  <h3 className="bonus-session-video-title">{session.title}</h3>
                  {session.description && (
                    <p className="bonus-session-video-description">{session.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // If a quarter is selected, show the detail view with sessions
  if (selectedQuarter) {
    return (
      <div className="bonus-quarter-detail-section">
        <button
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="bonus-quarter-detail-header">
          <h2 className="bonus-quarter-detail-title">{selectedQuarter.title}</h2>
          {selectedQuarter.description && (
            <p className="bonus-quarter-detail-description">{selectedQuarter.description}</p>
          )}
        </div>
        <div className="bonus-sessions-container-grid">
          {loadingQuarterSessions ? (
            <div className="bonus-sessions-loading">
              <div className="loading-spinner">Loading sessions...</div>
            </div>
          ) : quarterSessions.length === 0 ? (
            <div className="no-bonus-sessions">
              <p>No sessions available for this quarter.</p>
            </div>
          ) : (
            /* 
              This .map() will automatically render ALL cards from API data.
              If API returns 24 sessions, all 24 cards will render automatically.
              No need to hardcode multiple cards - just update quarterSessions state with API data.
            */
            quarterSessions.map((session) => (
              <div
                key={session.id}
                className="bonus-session-video-card"
                onClick={() => handleSessionClick(session)}
              >
                <div className="bonus-session-video-thumbnail">
                  <div className="bonus-video-player-background">
                    <div className="bonus-video-books-left"></div>
                    <div className="bonus-video-screen">
                      {/* Video thumbnail image will come from session.thumbnail (API) - shown as background */}
                      {session.thumbnail && (
                        <img src={session.thumbnail} alt="" className="bonus-video-thumbnail-image" />
                      )}
                      {/* Always show play button and controls on top */}
                      <div className="bonus-play-button-icon">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                          <circle cx="30" cy="30" r="30" fill="white" opacity="0.9" />
                          <path d="M25 20L25 40L38 30L25 20Z" fill="#9BC4F7" />
                        </svg>
                      </div>
                      <div className="bonus-video-controls">
                        <div className="bonus-progress-bar-container">
                          <div className="bonus-progress-bar"></div>
                          <div className="bonus-progress-scrubber"></div>
                        </div>
                        <div className="bonus-volume-indicator">
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                          <div className="bonus-volume-bar"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bonus-video-books-right"></div>
                  </div>
                </div>
                <div className="bonus-session-video-content">
                  <h3 className="bonus-session-video-title">{session.title}</h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bonus-sessions-section">
      <h2 className="section-title">Bonus Sessions</h2>
      {loadingSessions ? (
        <div className="bonus-sessions-loading">
          <div className="loading-spinner">Loading bonus sessions...</div>
        </div>
      ) : displaySessions.length === 0 ? (
        <div className="no-bonus-sessions">
          <p>No bonus sessions available.</p>
        </div>
      ) : (
        <div className="bonus-sessions-container">
          {displaySessions.map((session) => {
            console.log('🃏 Rendering card:', { id: session.id, title: session.title });
            return (
              <div
                key={session.id}
                className={`bonus-session-card ${session.isPurchasable ? 'purchasable' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Card clicked directly:', { id: session.id, title: session.title });
                  handleCardClick(session);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="bonus-session-image-container">
                  {session.image ? (
                    <img src={session.image} alt={session.title} className="bonus-session-image" />
                  ) : (
                    <div className="bonus-session-image-placeholder">
                      <div className="placeholder-icon">🖼️</div>
                    </div>
                  )}
                </div>
                <div className="bonus-session-content">
                  <h3 className="bonus-session-title">{session.title}</h3>
                  {session.description && (
                    <p className="bonus-session-description">{session.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BonusSessions;