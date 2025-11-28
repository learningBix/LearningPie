import React, { useState, useEffect } from 'react';
import './BonusSessions.css';
import { recordedClassesAPI } from '../../services/apiService';
import { getBlobUrl } from '../../utils/blob';
import quarter_3 from '../../assets/Quarter3.jpg';
import diy_home from '../../assets/diyhomethumb.jpg'; 
import excursion from '../../assets/Excursionsthumb.jpg';

const BonusSessions = ({ user, userData, onVideoWatch }) => {
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [hasTrackedVideo, setHasTrackedVideo] = useState(false);

  useEffect(() => {
    loadQuarters();
  }, [userData, user]);

  const loadQuarters = async () => {
    setLoading(true);
    try {
      const studentId = userData?.id || userData?.student_id || user?.id;
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      
      if (!studentId) {
        console.error('Student ID not found');
        setLoading(false);
        return;
      }

      const quarterData = [];

      // Fetch Quarter 1 and Quarter 2
      const [quarter1Res, quarter2Res, quarter3Res] = await Promise.all([
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: '521',
          student_id: studentId,
          type: '1'
        }),
        recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: '790',
          student_id: studentId,
          type: '1'
        }),
        recordedClassesAPI.fetchTermsCourses({ 
          age_group_id: ageGroupId,
          terms: ['3']
        })
      ]);

      // Map Quarter 1
      if (quarter1Res.success && quarter1Res.raw?.data?.[0]) {
        const data = quarter1Res.raw.data[0];
        quarterData.push({
          id: 1,
          title: data.chapter_title || 'Quarter 1',
          description: data.chapter_description || 'Browse through unlocked sessions for better understanding.',
          image: getBlobUrl(data.image),
          type: 'quarter',
          chapterId: '521'
        });
      }

      // Map Quarter 2
      if (quarter2Res.success && quarter2Res.raw?.data?.[0]) {
        const data = quarter2Res.raw.data[0];
        quarterData.push({
          id: 2,
          title: data.chapter_title || 'Quarter 2',
          description: data.chapter_description || 'Browse through unlocked sessions for better understanding.',
          image: getBlobUrl(data.image),
          type: 'quarter',
          chapterId: '790'
        });
      }

      // Map Quarter 3
      if (quarter3Res.success) {
        const quarter3Data = quarter3Res.raw?.data || quarter3Res.data || [];
        if (quarter3Data.length > 0) {
          const course = quarter3Data[0];
          quarterData.push({
        id: 3,
            title: course.course_name || 'Buy Quarter 3',
            description: cleanDescription(course.description || course.course_detail),
        image: quarter_3,
        type: 'buy_plan',
        terms: ['3'],
            courseData: course
          });
        }
      }

      // Add static sessions (DIY Home and Excursions)
      quarterData.push(
        {
          id: 4,
          title: 'DIY Home',
          type: 'diy_home',
          image: diy_home
        },
        {
          id: 5,
          title: 'Excursions',
          type: 'excursions',
          image: excursion
        }
      );

      setQuarters(quarterData);
    } catch (error) {
      console.error('Error loading quarters:', error);
      setQuarters([]);
    } finally {
      setLoading(false);
    }
  };

  const parseDescriptionSections = (descriptionHtml) => {
    if (!descriptionHtml) return { curriculum: '', activityBox: '', moreFromLearningPie: '' };
    return {
      curriculum: descriptionHtml.match(/<h4[^>]*>.*?Curriculum.*?<\/h4>(.*?)(?=<h5[^>]*>.*?Activity Box Includes|$)/is)?.[1]?.trim() || '',
      activityBox: descriptionHtml.match(/<h5[^>]*>.*?Activity Box Includes.*?<\/h5>(.*?)(?=<h5[^>]*>.*?More from Learning Pie|$)/is)?.[1]?.trim() || '',
      moreFromLearningPie: descriptionHtml.match(/<h5[^>]*>.*?More from Learning Pie.*?<\/h5>(.*?)(?=<|$)/is)?.[1]?.trim() || ''
    };
  };

  const cleanDescription = (html) => {
    if (!html) return null;
    return html
      .replace(/<h4[^>]*>.*?Curriculum.*?<\/h4>.*?(?=<h5|$)/is, '')
      .replace(/<h5>Activity Box Includes.*?<\/h5>.*?(?=<h5|$)/is, '')
      .replace(/<h5>More from Learning Pie.*?<\/h5>.*?(?=<|$)/is, '')
      .replace(/<p><\/p>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')
      .trim() || null;
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
      .trim();
  };

  const handleQuarterClick = async (quarter) => {
    setSelectedQuarter(quarter);
    setSessions([]);
    setLoadingSessions(true);

    try {
      switch (quarter.type) {
        case 'quarter':
          await loadQuarterSessions(quarter.chapterId);
          break;
        case 'buy_plan':
          // Plan selection is handled in render
          break;
        case 'diy_home':
          await loadPixSessions(2); // type: 2 for DIY Home
          break;
        case 'excursions':
          await loadPixSessions(4); // type: 4 for Excursions
          break;
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadQuarterSessions = async (chapterId) => {
      const studentId = user?.id || userData?.id || userData?.student_id;
      const response = await recordedClassesAPI.viewChapterLessonsInfo({ 
      course_chapter_id: chapterId.toString(),
        student_id: studentId,
      type: '1'
      });
      
    if (response.success && response.raw?.lessons) {
      const mappedSessions = response.raw.lessons.map((lesson) => {
        const content = lesson.content?.[0] || null;
          return {
            id: lesson.id,
            title: lesson.lesson_title,
          thumbnail: getBlobUrl(lesson.image),
          videoUrl: content?.video_url || '',
            description: content ? formatRichText(content.class_description) : '',
            requirement: content ? formatRichText(content.class_requirement) : ''
          };
        });
      setSessions(mappedSessions);
    }
  };

  const loadPixSessions = async (type) => {
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      const response = await recordedClassesAPI.getPixContentsList({ 
        age_group_id: ageGroupId.toString(),
        keyword: ''
      });
      
      if (response.success && response.data) {
      const filtered = response.data.filter(item => item.type === type);
      const mappedSessions = filtered.map((item) => ({
            id: item.id,
            title: item.title,
        thumbnail: getBlobUrl(item.image),
            videoUrl: item.video || '',
        description: item.description || ''
      }));
      setSessions(mappedSessions);
    }
  };

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else if (selectedQuarter) {
      setSelectedQuarter(null);
      setSessions([]);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setHasTrackedVideo(false);
  };

  useEffect(() => {
    if (selectedSession?.videoUrl && !hasTrackedVideo && onVideoWatch) {
      const videoType = selectedSession.type === 'diy_home' ? 'robotics' : 'bonus';
      onVideoWatch(videoType);
      setHasTrackedVideo(true);
    }
  }, [selectedSession, hasTrackedVideo, onVideoWatch]);

  // Video detail view
  if (selectedSession) {
    return (
      <div className="p-[30px_40px] min-h-screen bg-white sm:p-5">
        <div className="flex items-center justify-between gap-5 mb-[30px] sm:flex-col sm:items-start sm:gap-4">
          <h1 className="text-[28px] font-bold text-[#333] m-0 flex-1 sm:text-2xl sm:w-full">{selectedSession.title}</h1>
          <button
            className="bonus-back-button"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
        <div className="flex gap-10 items-start lg:flex-col">
          <div className="flex-1 min-w-0">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              {selectedSession.videoUrl ? (
                <iframe
                  src={selectedSession.videoUrl}
                  title={selectedSession.title}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-white text-center p-5 flex flex-col items-center justify-center h-full gap-2.5">
                  <p>Video not available</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex-[0_0_400px] flex flex-col lg:flex-1 lg:w-full">
            <div className="flex flex-col gap-6">
              {selectedSession.description && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-[#333] m-0">Description</h3>
                  <p className="text-base text-[#666] leading-relaxed m-0">{formatRichText(selectedSession.description)}</p>
              </div>
              )}
              {selectedSession.requirement && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-[#333] m-0">Requirement</h3>
                  <p className="text-base text-[#666] leading-relaxed m-0">{formatRichText(selectedSession.requirement)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quarter detail view with sessions list
  if (selectedQuarter) {
    // Buy Plan view
    if (selectedQuarter.type === 'buy_plan') {
      if (!selectedQuarter.courseData) return null;
      
      const courseData = selectedQuarter.courseData;
      const descriptionSections = parseDescriptionSections(courseData.description || courseData.curriculum || '');
      
      const planData = {
        courseName: selectedQuarter.title || 'Quarter 3',
        tag: courseData.tag || '(3 months)',
        amount: courseData.amount || 0,
        fakePrice: courseData.fake_price || courseData.amount || 0,
        image: selectedQuarter.image || null,
        curriculum: descriptionSections.curriculum || courseData.curriculum || courseData.description || '',
        activityBox: descriptionSections.activityBox || courseData.hands_on_activities || '',
        moreFromLearningPie: descriptionSections.moreFromLearningPie || courseData.course_detail || ''
      };

      return (
        <div className="p-8 min-h-screen bg-white">
          <button 
            className="bonus-back-button"
            onClick={handleBack}
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

    // Sessions list view
    return (
      <div className="p-8 min-h-screen bg-white max-w-full">
        <button
          className="bonus-back-button"
          onClick={handleBack}
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

  // Main quarters list view
  return (
    <div className="p-[30px] bg-transparent">
      <h2 className="text-[28px] font-semibold text-[#333] mb-[30px] pb-[15px] border-b-[3px] border-[#FF8C42]">
        Bonus Sessions
      </h2>
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px] p-10">
          <div className="loading-spinner text-lg text-[#666] flex items-center gap-2.5">
            Loading bonus sessions...
          </div>
        </div>
      ) : quarters.length === 0 ? (
        <div className="flex justify-center items-center min-h-[300px] p-10 text-center text-[#666] text-base">
          <p>No bonus sessions available.</p>
        </div>
      ) : (
        <div className="quarters-container grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 items-stretch max-w-[1400px] mx-auto">
          {quarters.map((quarter) => (
            <div
              key={quarter.id}
              className={`quarter-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 flex flex-col border border-[#e0e0e0] min-h-full hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] bonus-session-card ${quarter.type === 'buy_plan' ? 'purchasable' : ''}`}
              onClick={() => handleQuarterClick(quarter)}
            >
              <div className={`quarter-image-container w-full h-[180px] bg-white flex items-start justify-start overflow-hidden relative flex-shrink-0 p-0 box-border ${quarter.type !== 'buy_plan' ? 'p-4 border-b border-[#e0e0e0]' : ''}`}>
                {quarter.image ? (
                  <img src={quarter.image} alt={quarter.title} className="w-full h-full object-cover" />
                  ) : (
                  <div className="bonus-session-image-placeholder w-full h-full bg-white flex items-start justify-start relative box-border"></div>
                  )}
                </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="text-2xl font-bold text-[#333] m-0 leading-tight">{quarter.title}</h3>
                {quarter.type !== 'buy_plan' && quarter.description && (
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

export default BonusSessions;