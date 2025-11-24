import React, { useState, useEffect } from 'react';
import './RecordedClasses.css';
import { recordedClassesAPI } from '../../services/apiService';

const RecordedClasses = ({ user = {}, userData = {} }) => {
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
    // Curriculum: from <h4>Curriculum</h4> until <h5>Activity Box Includes</h5>
    const curriculumMatch = descriptionHtml.match(/<h4[^>]*>.*?Curriculum.*?<\/h4>(.*?)(?=<h5[^>]*>.*?Activity Box Includes|$)/is);
    
    // Activity Box: from <h5>Activity Box Includes</h5> until <h5>More from Learning Pie</h5>
    const activityBoxMatch = descriptionHtml.match(/<h5[^>]*>.*?Activity Box Includes.*?<\/h5>(.*?)(?=<h5[^>]*>.*?More from Learning Pie|$)/is);
    
    // More from Learning Pie: from <h5>More from Learning Pie</h5> to the end
    const moreFromLearningPieMatch = descriptionHtml.match(/<h5[^>]*>.*?More from Learning Pie.*?<\/h5>(.*?)(?=<|$)/is);

    return {
      curriculum: curriculumMatch ? curriculumMatch[1].trim() : '',
      activityBox: activityBoxMatch ? activityBoxMatch[1].trim() : '',
      moreFromLearningPie: moreFromLearningPieMatch ? moreFromLearningPieMatch[1].trim() : ''
    };
  };

  // Quarters data - will be populated from API
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [loadingQuarters, setLoadingQuarters] = useState(false);

  // State to track selected quarter detail view
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  
  // State for sessions (lessons) data
  const [quarterSessions, setQuarterSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);


  // State to track if plan selection view should be shown
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  
  // State for plan data
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // State for selected session detail view
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);

  // Fetch quarters/recorded classes data from API
  useEffect(() => {
    fetchRecordedClasses();
  }, []);

  /**
   * Fetch recorded classes (quarters) from backend
   * Ready for backend integration - just uncomment the API call when endpoint is ready
   */
  const fetchRecordedClasses = async () => {
    setLoadingQuarters(true);
    try {
      // Fetch Quarter 1 and Quarter 2 data dynamically from API
      const studentId = user?.id || userData?.id || userData?.student_id;
      const quarter1Id = '521';
      const quarter2Id = '790';
      
      // Fetch Quarter 1 and Quarter 2 data in parallel
      const [quarter1Response, quarter2Response] = await Promise.all([
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: quarter1Id,
          student_id: studentId,
          type: '0'
        }),
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: quarter2Id,
          student_id: studentId,
          type: '0'
        })
      ]);

      // Map Quarter 1 data
      let quarter1 = {
        id: quarter1Id,
        title: 'Quarter 1',
        image: null,
        description: 'Browse through unlocked sessions for better understanding.',
        isPurchasable: false
      };
      
      if (quarter1Response.success && quarter1Response.raw && quarter1Response.raw.data && quarter1Response.raw.data[0]) {
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
          id: quarter1Id,
          title: chapterData.chapter_title || 'Quarter 1',
          image: imageUrl,
          description: chapterData.chapter_description || 'Browse through unlocked sessions for better understanding.',
          isPurchasable: false
        };
      }

      // Map Quarter 2 data
      let quarter2 = {
        id: quarter2Id,
        title: 'Quarter 2',
        image: null,
        description: 'Browse through unlocked sessions for better understanding.',
        isPurchasable: false
      };
      
      if (quarter2Response.success && quarter2Response.raw && quarter2Response.raw.data && quarter2Response.raw.data[0]) {
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
          id: quarter2Id,
          title: chapterData.chapter_title || 'Quarter 2',
          image: imageUrl,
          description: chapterData.chapter_description || 'Browse through unlocked sessions for better understanding.',
          isPurchasable: false
        };
      }

      const unlockedQuarters = [quarter1, quarter2];

      // Fetch Quarter 3 (purchasable) from API
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47; // Default to 47 if not available
      console.log('Fetching Quarter 3 with age_group_id:', ageGroupId);
      const response = await recordedClassesAPI.fetchTermsCourses({ 
        age_group_id: ageGroupId,
        terms: ['3']
      });
      
      console.log('Quarter 3 API Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response raw:', response.raw);
      
      let purchasableQuarters = [];
      // Handle both response.raw.data and response.data formats
      const responseData = (response.raw && response.raw.data) ? response.raw.data : (response.data || []);
      console.log('ResponseData:', responseData);
      
      if (response.success && responseData && responseData.length > 0) {
        console.log('Successfully fetched Quarter 3 data, mapping courses...');
        // Map API response to quarter format
        purchasableQuarters = responseData.map((course) => {
          // Construct image URL if available
          let imageUrl = null;
          if (course.image) {
            if (course.image.startsWith('http')) {
              imageUrl = course.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              imageUrl = `${baseUrl}/uploads/${course.image}`;
            }
          }

          return {
            id: course.id, // Course ID
            title: course.course_name || 'Buy Quarter 3',
            image: imageUrl,
            description: course.description || course.course_detail || '',
            isPurchasable: true,
            // Store additional course data for plan selection
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
        });
      } else {
        // Fallback if API fails - use mock data
        console.warn('Failed to fetch Quarter 3 from API:', {
          success: response.success,
          hasData: !!responseData,
          dataLength: responseData?.length,
          message: response.message
        });
        purchasableQuarters = [{
          id: 3,
          title: 'Buy Quarter 3',
          image: null,
          description: '',
          isPurchasable: true
        }];
      }
      
      // Combine unlocked and purchasable quarters
      const allQuarters = [...unlockedQuarters, ...purchasableQuarters];
      setRecordedClasses(allQuarters);
    } catch (error) {
      console.error('Error fetching recorded classes:', error);
      // On error, show fallback data for all quarters
      setRecordedClasses([
        {
          id: '521',
          title: 'Quarter 1',
          image: null,
          description: 'Browse through unlocked sessions for better understanding.',
          isPurchasable: false
        },
        {
          id: '790',
          title: 'Quarter 2',
          image: null,
          description: 'Browse through unlocked sessions for better understanding.',
          isPurchasable: false
        },
        {
          id: 3,
          title: 'Buy Quarter 3',
          image: null,
          description: '',
          isPurchasable: true
        }
      ]);
    } finally {
      setLoadingQuarters(false);
    }
  };

  /**
   * Fetch sessions for a specific quarter
   * Integrated with backend API
   */
  const fetchQuarterSessions = async (quarterId) => {
    setLoadingSessions(true);
    try {
      const response = await recordedClassesAPI.viewChapterLessonsInfo({ 
        course_chapter_id: quarterId.toString(), // Convert to string as API expects "521"
        student_id: user?.id || userData?.id || userData?.student_id,
        type: '0'
      });
      
      if (response.success && response.raw) {
        // Response has data array (chapter info) and lessons array (sessions)
        const chapterData = response.raw.data && response.raw.data[0] ? response.raw.data[0] : null;
        const lessons = response.raw.lessons || [];
        
        // Update selected quarter with chapter data if available
        if (chapterData && selectedQuarter) {
          // Construct image URL for chapter
          let chapterImageUrl = null;
          if (chapterData.image) {
            if (chapterData.image.startsWith('http')) {
              chapterImageUrl = chapterData.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              chapterImageUrl = `${baseUrl}/uploads/${chapterData.image}`;
            }
          }
          
          const updatedQuarter = {
            ...selectedQuarter,
            title: chapterData.chapter_title || selectedQuarter.title,
            description: chapterData.chapter_description || selectedQuarter.description,
            image: chapterImageUrl || selectedQuarter.image
          };
          
          setSelectedQuarter(updatedQuarter);
          
          // Also update the quarter in the main list (recordedClasses) with dynamic data
          setRecordedClasses(prevQuarters => 
            prevQuarters.map(quarter => 
              quarter.id === selectedQuarter.id 
                ? {
                    ...quarter,
                    title: chapterData.chapter_title || quarter.title,
                    description: chapterData.chapter_description || quarter.description,
                    image: chapterImageUrl || quarter.image
                  }
                : quarter
            )
          );
        }
        
        // Map lessons to session format
        const mappedSessions = lessons.map((lesson) => {
          const content = lesson.content && lesson.content[0] ? lesson.content[0] : null;
          // Construct image URL - API returns filename like "attachment-1640848847873.jpg"
          let thumbnailUrl = null;
          if (lesson.image) {
            // If image is already a full URL, use it; otherwise construct from base URL
            if (lesson.image.startsWith('http')) {
              thumbnailUrl = lesson.image;
            } else {
              const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112';
              thumbnailUrl = `${baseUrl}/uploads/${lesson.image}`;
            }
          }
          
          return {
            id: lesson.id,
            title: lesson.lesson_title,
            thumbnail: thumbnailUrl,
            videoUrl: content?.video_url || '',
            duration: lesson.duration || '',
            description: lesson.lesson_description || content?.class_description || '',
            requirement: lesson.requirements || content?.class_requirement || '',
            content: content // Store full content for session detail view
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
      setLoadingSessions(false);
    }
  };

  /**
   * Fetch plan data for purchasable quarters
   * Uses courseData from the quarter object if available (from API response)
   */
  const fetchPlanData = async (quarter) => {
    setLoadingPlan(true);
    try {
      // If quarter has courseData from API, use it directly
      if (quarter.courseData) {
        const courseData = quarter.courseData;
        // Map API response to planData format
        // The description field contains HTML with curriculum, activity box, and more from Learning Pie
        // Parse the description to extract the three sections
        const descriptionSections = parseDescriptionSections(courseData.description || courseData.curriculum || '');
        
        const planData = {
          courseName: quarter.title || 'Quarter 3',
          tag: courseData.tag || '(3 months)',
          amount: courseData.amount || 0,
          fakePrice: courseData.fake_price || courseData.amount || 0,
          image: quarter.image || null,
          // Use parsed sections from description, with fallbacks
          curriculum: descriptionSections.curriculum || courseData.curriculum || courseData.description || '',
          activityBox: descriptionSections.activityBox || courseData.hands_on_activities || '',
          moreFromLearningPie: descriptionSections.moreFromLearningPie || courseData.course_detail || ''
        };
        console.log('Setting planData:', planData);
        setPlanData(planData);
      } else {
        // Fallback: Try to fetch from API if courseData not available
        // This would be used if we need to fetch additional details
        console.warn('No courseData available for quarter, using fallback');
        setPlanData(null);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
      setPlanData(null);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleQuarterClick = (quarter) => {
    if (quarter.isPurchasable) {
      // Show plan selection page for purchasable quarters
      // Pass the entire quarter object so fetchPlanData can use courseData
      fetchPlanData(quarter);
      setShowPlanSelection(true);
    } else {
      // Handle navigation to quarter detail view
      setSelectedQuarter(quarter);
      setQuarterSessions([]);
      fetchQuarterSessions(quarter.id);
    }
  };

  /**
   * Fetch session details from backend
   * Session details are already available from the lessons array, so we extract them
   */
  const fetchSessionDetails = async (sessionId) => {
    setLoadingSessionDetails(true);
    try {
      // Find the session in the already fetched sessions
      const session = quarterSessions.find(s => s.id === sessionId);
      
      if (session) {
        // Extract details from session data
        const content = session.content || {};
        const sessionDetails = {
          id: session.id,
          title: session.title,
          videoUrl: session.videoUrl || content.video_url || '',
          description: formatRichText(session.description || content.class_description || ''),
          requirement: formatRichText(session.requirement || content.class_requirement || '')
        };
        
        setSessionDetails(sessionDetails);
      } else {
        console.error('Session not found:', sessionId);
        setSessionDetails(null);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      setSessionDetails(null);
    } finally {
      setLoadingSessionDetails(false);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setSessionDetails(null);
    fetchSessionDetails(session.id);
  };

  const handleBackClick = () => {
    if (selectedSession) {
      // If we're in session detail view, go back to quarter sessions
      setSelectedSession(null);
      setSessionDetails(null);
      setLoadingSessionDetails(false);
    } else if (showPlanSelection) {
      // If we're in plan selection, go back to quarters list
      setShowPlanSelection(false);
    } else {
      // If we're in quarter detail view, go back to quarters list
      setSelectedQuarter(null);
      setQuarterSessions([]);
      setLoadingSessions(false);
    }
  };

  // If plan selection should be shown, display the Select Plan page
  if (showPlanSelection) {
    return (
      <div className="select-plan-section">
        <button 
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <h1 className="select-plan-title">Select Plan</h1>
        <div className="plan-card-container">
          {loadingPlan ? (
            <div className="plan-loading">
              <div className="loading-spinner">Loading plan details...</div>
            </div>
          ) : planData ? (
            <div className="plan-card">
              <div className="plan-header">
                {planData.image ? (
                  <img src={planData.image} alt={planData.courseName} className="plan-image" />
                ) : (
                  <div className="plan-image-placeholder"></div>
                )}
                <div className="plan-header-content">
                  <span className="plan-duration-badge">{planData.tag}</span>
                  <h2 className="plan-course-title">{planData.courseName}</h2>
                  <div className="plan-pricing">
                    <span className="plan-current-price">₹{planData.amount}</span>
                    <span className="plan-original-price">₹{planData.fakePrice}</span>
                  </div>
                </div>
              </div>
              
              <div className="plan-section">
                <h3 className="plan-section-title">Curriculum</h3>
                <div 
                  className="plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.curriculum || 'No curriculum information available.' }}
                />
              </div>

              <div className="plan-section">
                <h3 className="plan-section-title">Activity Box Includes</h3>
                <div 
                  className="plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.activityBox || 'No activity box information available.' }}
                />
              </div>

              <div className="plan-section">
                <h3 className="plan-section-title">More from Learning Pie</h3>
                <div 
                  className="plan-section-content"
                  dangerouslySetInnerHTML={{ __html: planData.moreFromLearningPie || 'No additional information available.' }}
                />
              </div>

              <button className="enroll-now-button" onClick={() => console.log('Enroll Now clicked')}>
                Enroll Now
              </button>
            </div>
          ) : (
            <div className="plan-error">
              <p>Failed to load plan details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If a session is selected, show the session detail view
  if (selectedSession) {
    return (
      <div className="session-detail-section">
        <button 
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div style={{ maxWidth: '1400px', margin: '0 auto 30px auto' }}>
          <h1 className="session-detail-title" style={{ margin: 0 }}>
            {sessionDetails?.title || selectedSession.title}
          </h1>
        </div>
        {loadingSessionDetails ? (
          <div className="session-details-loading">
            <div className="loading-spinner">Loading session details...</div>
          </div>
        ) : sessionDetails ? (
          <div className="session-detail-container">
            <div className="session-video-player">
              <div className="video-player-placeholder">
                {sessionDetails.videoUrl ? (
                  <iframe
                    src={sessionDetails.videoUrl}
                    className="video-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={sessionDetails.title}
                    frameBorder="0"
                  ></iframe>
                ) : (
                  <div className="video-placeholder-content">
                    <p>Video player will be displayed here</p>
                    <p>Video URL: {sessionDetails.videoUrl || 'Not available'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="session-detail-content">
              <div className="session-info-section">
                <h3 className="session-info-label">Description</h3>
                <p className="session-info-text">
                  {sessionDetails.description || 'No description available.'}
                </p>
              </div>
              <div className="session-info-section">
                <h3 className="session-info-label">Requirement</h3>
                <p className="session-info-text">
                  {sessionDetails.requirement || 'No requirements specified.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="session-details-error">
            <p>Failed to load session details. Please try again.</p>
          </div>
        )}
      </div>
    );
  }

  // If a quarter is selected, show the detail view with sessions
  if (selectedQuarter) {
    return (
      <div className="quarter-detail-section">
        <button 
          className="back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="quarter-detail-header">
          <h2 className="quarter-detail-title">{selectedQuarter.title}</h2>
          {selectedQuarter.description && (
          <p className="quarter-detail-description">
              {selectedQuarter.description}
          </p>
          )}
        </div>
        {loadingSessions ? (
          <div className="sessions-loading">
            <div className="loading-spinner">Loading sessions...</div>
          </div>
        ) : quarterSessions.length === 0 ? (
          <div className="no-sessions">
            <p>No sessions available for this quarter.</p>
          </div>
        ) : (
          <div className="sessions-container">
            {quarterSessions.map((session) => (
              <div 
                key={session.id} 
                className="session-card"
                onClick={() => handleSessionClick(session)}
              >
                <div className="session-video-thumbnail">
                  <div className="video-player-background">
                    <div className="video-books-left"></div>
                    <div className="video-screen">
                      {/* Video thumbnail image from API */}
                      {session.thumbnail && (
                        <img src={session.thumbnail} alt={session.title} className="video-thumbnail-image" />
                      )}
                      {/* Always show play button and controls on top */}
                      <div className="play-button-icon">
                        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="25" cy="25" r="25" fill="white"/>
                          <path d="M20 16L20 34L32 25L20 16Z" fill="#9BC4F7"/>
                        </svg>
                      </div>
                      <div className="video-controls">
                        <div className="progress-bar-container">
                          <div className="progress-bar"></div>
                          <div className="progress-scrubber"></div>
                        </div>
                        <div className="volume-indicator">
                          <div className="volume-bar"></div>
                          <div className="volume-bar"></div>
                          <div className="volume-bar"></div>
                        </div>
                      </div>
                    </div>
                    <div className="video-books-right"></div>
                  </div>
                </div>
                <div className="session-content">
                  <h3 className="session-title">{session.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show the main quarters list
  return (
    <div className="recorded-classes-section">
      {loadingQuarters ? (
        <div className="quarters-loading">
          <div className="loading-spinner">Loading quarters...</div>
        </div>
      ) : recordedClasses.length === 0 ? (
        <div className="no-quarters">
          <p>No quarters available.</p>
        </div>
      ) : (
        <div className="quarters-container">
          {recordedClasses.map((quarter) => (
            <div 
              key={quarter.id} 
              className={`quarter-card ${quarter.isPurchasable ? 'purchasable' : ''}`}
              onClick={() => handleQuarterClick(quarter)}
            >
              <div className="quarter-image-container">
                {quarter.image ? (
                  <img src={quarter.image} alt={quarter.quarter} className="quarter-image" />
                ) : (
                  <div className="quarter-image-placeholder"></div>
                )}
              </div>
              <div className="quarter-content">
                <h3 className="quarter-title">{quarter.title}</h3>
                {!quarter.isPurchasable && quarter.description && (
                  <p className="quarter-description">
                    {quarter.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordedClasses;

