import React, { useState, useEffect } from 'react';
import { recordedClassesAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';
import './RecordedClasses.css';
import buyTerm3Image from '../../assets/buy_term3.jpeg';

const RecordedClasses = ({ user = {}, userData = {}, onVideoWatch }) => {
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [hasTrackedVideo, setHasTrackedVideo] = useState(false);

  useEffect(() => {
    loadQuarters();
  }, []);

  useEffect(() => {
    if (sessionDetails?.videoUrl && !hasTrackedVideo && onVideoWatch) {
      onVideoWatch('recorded_class');
      setHasTrackedVideo(true);
    }
  }, [sessionDetails, hasTrackedVideo, onVideoWatch]);

  const constructImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanBaseUrl = BLOB_BASE_URL.endsWith('/') ? BLOB_BASE_URL.slice(0, -1) : BLOB_BASE_URL;
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${cleanBaseUrl}/${cleanImagePath}`;
  };

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

  const parseDescriptionSections = (descriptionHtml) => {
    if (!descriptionHtml) return { curriculum: '', activityBox: '', moreFromLearningPie: '' };
    return {
      curriculum: descriptionHtml.match(/<h4[^>]*>.*?Curriculum.*?<\/h4>(.*?)(?=<h5[^>]*>.*?Activity Box Includes|$)/is)?.[1]?.trim() || '',
      activityBox: descriptionHtml.match(/<h5[^>]*>.*?Activity Box Includes.*?<\/h5>(.*?)(?=<h5[^>]*>.*?More from Learning Pie|$)/is)?.[1]?.trim() || '',
      moreFromLearningPie: descriptionHtml.match(/<h5[^>]*>.*?More from Learning Pie.*?<\/h5>(.*?)(?=<|$)/is)?.[1]?.trim() || ''
    };
  };

  const loadQuarters = async () => {
    setLoading(true);
    try {
      const studentId = user?.id || userData?.id || userData?.student_id;
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      
      const [term1Response, term2Response, term3Response] = await Promise.all([
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: '521',
          student_id: studentId,
          type: '0'
        }).catch(() => ({ success: false })),
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: '790',
          student_id: studentId,
          type: '0'
        }).catch(() => ({ success: false })),
        recordedClassesAPI.fetchTermsCourses({ 
          age_group_id: ageGroupId,
          terms: ['3']
        }).catch(() => ({ success: false }))
      ]);

      const quartersList = [];

      if (term1Response.success && term1Response.raw?.data?.[0]) {
        const chapterData = term1Response.raw.data[0];
        quartersList.push({
          id: '521',
          title: chapterData.chapter_title || 'Quarter 1',
          image: constructImageUrl(chapterData.image),
          description: chapterData.chapter_description || '',
          isPurchasable: false
        });
      }

      if (term2Response.success && term2Response.raw?.data?.[0]) {
        const chapterData = term2Response.raw.data[0];
        quartersList.push({
          id: '790',
          title: chapterData.chapter_title || 'Quarter 2',
          image: constructImageUrl(chapterData.image),
          description: chapterData.chapter_description || '',
          isPurchasable: false
        });
      }

      const term3Data = term3Response.raw?.data || term3Response.data || [];
      if (term3Response.success && term3Data.length > 0) {
        const course = term3Data[0];
        quartersList.push({
          id: course.id,
          title: 'Buy Quarter 3',
          image: buyTerm3Image,
          description: course.description || course.course_detail || '',
          isPurchasable: true,
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
        });
      }

      setQuarters(quartersList);
    } catch (error) {
      console.error('Error fetching quarters:', error);
      setQuarters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuarterSessions = async (quarterId) => {
    setLoadingSessions(true);
    try {
      const response = await recordedClassesAPI.viewChapterLessonsInfo({ 
        course_chapter_id: quarterId.toString(),
        student_id: user?.id || userData?.id || userData?.student_id,
        type: '0'
      });
      
      if (response.success && response.raw) {
        const chapterData = response.raw.data?.[0];
        const lessons = response.raw.lessons || [];
        
        if (chapterData && selectedQuarter) {
          setSelectedQuarter({
            ...selectedQuarter,
            title: chapterData.chapter_title || selectedQuarter.title,
            description: chapterData.chapter_description || selectedQuarter.description,
            image: constructImageUrl(chapterData.image) || selectedQuarter.image
          });
        }
        
        const mappedSessions = lessons.map((lesson) => {
          const content = lesson.content?.[0];
          const imageSource = content?.image || lesson.image;
          
          return {
            id: lesson.id,
            title: lesson.lesson_title,
            thumbnail: constructImageUrl(imageSource),
            videoUrl: content?.video_url || '',
            duration: lesson.duration || '',
            description: lesson.lesson_description || content?.class_description || '',
            requirement: lesson.requirements || content?.class_requirement || '',
            content
          };
        });
        
        setSessions(mappedSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleQuarterClick = (quarter) => {
    if (quarter.isPurchasable) {
      if (!quarter.courseData) return;
      
      const courseData = quarter.courseData;
      const descriptionSections = parseDescriptionSections(courseData.description || courseData.curriculum || '');
      
      setPlanData({
        courseName: quarter.title || 'Quarter 3',
        tag: courseData.tag || '(3 months)',
        amount: courseData.amount || 0,
        fakePrice: courseData.fake_price || courseData.amount || 0,
        image: quarter.image || null,
        curriculum: descriptionSections.curriculum || courseData.curriculum || courseData.description || '',
        activityBox: descriptionSections.activityBox || courseData.hands_on_activities || '',
        moreFromLearningPie: descriptionSections.moreFromLearningPie || courseData.course_detail || ''
      });
      setShowPlanSelection(true);
    } else {
      setSelectedQuarter(quarter);
      setSessions([]);
      loadQuarterSessions(quarter.id);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setSessionDetails(null);
    setHasTrackedVideo(false);
    
    const content = session.content || {};
    setSessionDetails({
      id: session.id,
      title: session.title,
      videoUrl: session.videoUrl || content.video_url || '',
      description: formatRichText(session.description || content.class_description || ''),
      requirement: formatRichText(session.requirement || content.class_requirement || '')
    });
  };

  const handleBackClick = () => {
    if (selectedSession) {
      setSelectedSession(null);
      setSessionDetails(null);
    } else if (showPlanSelection) {
      setShowPlanSelection(false);
    } else {
      setSelectedQuarter(null);
      setSessions([]);
    }
  };

  if (showPlanSelection) {
    return (
      <div className="p-8 min-h-screen bg-white">
        <button 
          className="recorded-back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <h1 className="text-center text-[32px] font-bold text-[#333] mb-10">Select Plan</h1>
        <div className="plan-card-container flex justify-start items-start max-w-[1400px] mx-auto">
          {planData ? (
            <div className="plan-card w-full md:w-1/3 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-5 flex flex-col gap-[18px]">
              <div className="flex gap-3 items-start">
                {planData.image ? (
                  <img src={planData.image} alt={planData.courseName} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-[#FF8C42] rounded-lg flex-shrink-0"></div>
                )}
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="inline-block bg-[#FFE5D4] text-[#FF8C42] py-1.5 px-3 rounded-md text-sm font-semibold w-fit">
                    {planData.tag}
                  </span>
                  <h2 className="text-2xl font-bold text-[#333] m-0">{planData.courseName}</h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[32px] font-bold text-[#FF8C42]">₹{planData.amount}</span>
                    <span className="text-xl font-medium text-[#999] line-through">₹{planData.fakePrice}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">Curriculum</h3>
                <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: planData.curriculum || 'No curriculum information available.' }} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">Activity Box Includes</h3>
                <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: planData.activityBox || 'No activity box information available.' }} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">More from Learning Pie</h3>
                <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: planData.moreFromLearningPie || 'No additional information available.' }} />
              </div>

              <button 
                className="w-full bg-[#FF8C42] text-white border-none py-4 px-6 rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 mt-2.5 hover:bg-[#e67a35] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,140,66,0.3)]" 
                onClick={() => console.log('Enroll Now clicked')}
              >
                Enroll Now
              </button>
            </div>
          ) : (
            <div className="plan-error w-full md:w-1/3 flex justify-center items-center p-10 text-center text-[#d32f2f] text-base">
              <p>Failed to load plan details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="p-8 min-h-screen bg-white max-w-full">
        <button 
          className="recorded-back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="max-w-[1400px] mx-auto mb-8">
          <h1 className="text-[32px] font-bold text-[#333] m-0 leading-tight">
            {sessionDetails?.title || selectedSession.title}
          </h1>
        </div>
        {sessionDetails ? (
          <div className="session-detail-container flex flex-col md:flex-row gap-10 mt-0 items-start max-w-[1400px] mx-auto">
            <div className="flex-1 min-w-0">
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                {sessionDetails.videoUrl ? (
                  <iframe
                    src={sessionDetails.videoUrl}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={sessionDetails.title}
                    frameBorder="0"
                  ></iframe>
                ) : (
                  <div className="text-white text-center p-5">
                    <p className="my-2.5 text-sm text-[#ccc]">Video player will be displayed here</p>
                    <p className="my-2.5 text-sm text-[#ccc]">Video URL: {sessionDetails.videoUrl || 'Not available'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="session-detail-content flex-[0_0_400px] md:flex-[0_0_400px] flex flex-col gap-8 w-full md:w-auto">
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Description</h3>
                <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">{sessionDetails.description || 'No description available.'}</p>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Requirement</h3>
                <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">{sessionDetails.requirement || 'No requirements specified.'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[400px] p-10 text-center">
            <div className="loading-spinner text-lg text-[#666] flex items-center gap-2.5">
              Loading session details...
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedQuarter) {
    return (
      <div className="p-8 min-h-screen bg-white max-w-full">
        <button 
          className="recorded-back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <div className="mb-8 max-w-[1400px] mx-auto">
          <h2 className="text-[32px] font-bold text-[#333] m-0 mb-2.5 leading-tight">{selectedQuarter.title}</h2>
          {selectedQuarter.description && (
            <p className="text-base text-[#666] leading-relaxed m-0 font-normal">{selectedQuarter.description}</p>
          )}
        </div>
        {loadingSessions ? (
          <div className="flex justify-center items-center min-h-[300px] p-10">
            <div className="loading-spinner text-lg text-[#666] flex items-center gap-2.5">
              Loading sessions...
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full text-center p-10 text-[#666] text-base">
            <p>No sessions available for this quarter.</p>
          </div>
        ) : (
          <div className="sessions-container grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 max-w-[1400px] mx-auto">
            {sessions.map((session) => (
              <div key={session.id} className="session-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#e0e0e0] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]" onClick={() => handleSessionClick(session)}>
                <div className="session-video-thumbnail w-full h-[200px] relative bg-[#f5f0e8] overflow-hidden">
                  <div className="video-player-background w-full h-full relative flex items-center justify-center">
                    <div className="video-books-left absolute top-1/2 -translate-y-1/2 left-[8%] flex flex-col gap-1 z-[1]"></div>
                    <div className="video-screen w-[65%] h-[110px] bg-[#9BC4F7] rounded-md relative z-[2] flex flex-col items-center justify-center p-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)] overflow-hidden">
                      {session.thumbnail ? (
                        <img 
                          src={session.thumbnail}
                          alt={session.title} 
                          className="video-thumbnail-image"
                          loading="lazy"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                            display: 'block'
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#9BC4F7] flex items-center justify-center text-[#666] text-xs">
                          No thumbnail
                        </div>
                      )}
                      <div className="play-button-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] cursor-pointer -mt-2">
                        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="25" cy="25" r="25" fill="white"/>
                          <path d="M20 16L20 34L32 25L20 16Z" fill="#9BC4F7"/>
                        </svg>
                      </div>
                      <div className="video-controls w-[calc(100%-16px)] flex items-center justify-between gap-2 p-0 absolute bottom-1.5 left-2 z-[3]">
                        <div className="progress-bar-container flex-1 h-0.5 bg-white/40 rounded-sm relative">
                          <div className="progress-bar w-2/5 h-full bg-white rounded-sm"></div>
                          <div className="progress-scrubber absolute left-2/5 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)]"></div>
                        </div>
                        <div className="volume-indicator flex items-end gap-0.5 h-4">
                          <div className="volume-bar w-0.5 bg-white rounded-sm h-1.5"></div>
                          <div className="volume-bar w-0.5 bg-white rounded-sm h-2.5"></div>
                          <div className="volume-bar w-0.5 bg-white rounded-sm h-3.5"></div>
                        </div>
                      </div>
                    </div>
                    <div className="video-books-right absolute top-1/2 -translate-y-1/2 right-[8%] flex flex-col gap-1 z-[1]"></div>
                  </div>
                </div>
                <div className="p-5 flex flex-col bg-white">
                  <h3 className="text-base font-semibold text-black m-0 leading-normal">{session.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px] p-10">
          <div className="loading-spinner text-lg text-[#666] flex items-center gap-2.5">
            Loading quarters...
          </div>
        </div>
      ) : quarters.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px] p-10 text-center text-[#666] text-base">
          <p>No quarters available.</p>
        </div>
      ) : (
        <div className="quarters-container grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 items-stretch max-w-[1400px] mx-auto">
          {quarters.map((quarter) => (
            <div 
              key={quarter.id} 
              className={`quarter-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 flex flex-col border border-[#e0e0e0] min-h-full hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${quarter.isPurchasable ? 'purchasable' : ''}`}
              onClick={() => handleQuarterClick(quarter)}
            >
              <div className={`quarter-image-container w-full h-[180px] bg-white flex items-start justify-start overflow-hidden relative flex-shrink-0 p-0 box-border ${!quarter.isPurchasable ? 'p-4 border-b border-[#e0e0e0]' : ''}`}>
                {quarter.image ? (
                  <img src={quarter.image} alt={quarter.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="quarter-image-placeholder w-full h-full bg-white flex items-start justify-start relative box-border"></div>
                )}
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="text-2xl font-bold text-[#333] m-0 leading-tight">{quarter.title}</h3>
                {!quarter.isPurchasable && quarter.description && (
                  <p className="text-sm text-[#666] leading-normal m-0 font-normal">{quarter.description}</p>
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
