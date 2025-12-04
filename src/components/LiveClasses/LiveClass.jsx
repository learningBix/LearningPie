import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaPlay } from 'react-icons/fa';
import { recordedClassesAPI, subjectsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';
import './LiveClass.css';

const LiveClass = ({ user = {}, userData = {}, onVideoWatch }) => {
  const [currentVideos, setCurrentVideos] = useState([]);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [showVideoDetails, setShowVideoDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState(null);
  const [currentDayType, setCurrentDayType] = useState(null); // 'recorded' or 'bonus'

  useEffect(() => {
    loadLiveClassVideo();
  }, []);

  // Helper: Get day of week from date (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (date) => {
    return new Date(date).getDay();
  };

  // Helper: Calculate which session type for today
  const getSessionTypeForDay = (dayOfWeek) => {
    // Monday (1), Wednesday (3), Friday (5) = Recorded Class
    // Tuesday (2), Thursday (4) = Bonus Session
    if ([1, 3, 5].includes(dayOfWeek)) {
      return 'recorded';
    } else if ([2, 4].includes(dayOfWeek)) {
      return 'bonus';
    }
    return null; // Saturday/Sunday no class
  };

  // Helper: Calculate days passed since course start
  const getDaysSinceCourseStart = (startDate) => {
    const today = new Date();
    const start = new Date(startDate);
    
    // Set time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper: Get video index based on session count
  const getVideoIndexForSession = (sessionType, daysPassed, startDateStr) => {
    // Count only relevant days (Mon/Wed/Fri for RC, Tue/Thu for BS)
    // Count up to and including today's session
    let sessionCount = 0;
    
    if (!startDateStr) {
      console.warn('⚠️ startDate not provided, returning 0');
      return 0;
    }
    
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    
    // Count sessions from start date up to and including today
    for (let i = 0; i <= daysPassed; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(0, 0, 0, 0);
      const dayType = getSessionTypeForDay(checkDate.getDay());
      
      if (dayType === sessionType) {
        sessionCount++;
      }
    }
    
    // Return index (0-based): sessionCount - 1 gives us the correct index
    // If today is the 5th session (sessionCount = 5), return index 4 (0-based)
    // This means: Day 1 → index 0, Day 2 → index 1, ..., Day 5 → index 4
    const videoIndex = sessionCount > 0 ? sessionCount - 1 : 0;
    console.log(`🔢 Session counting: sessionType=${sessionType}, daysPassed=${daysPassed}, sessionCount=${sessionCount}, videoIndex=${videoIndex} (Day ${sessionCount})`);
    return videoIndex;
  };

  // Helper: Get unlocked quarters
  const getUnlockedQuarters = async (sid, studentId) => {
    const unlockedQuarters = [];
    
    try {
      // Fetch subscribed chapters
      const subscribedChapters = [];
      try {
        const response = await recordedClassesAPI.viewCourseInfo({
          id: '82', // Junior KG - Term 1 course ID
          student_id: studentId
        });
        
        if (response.success && response.raw?.data?.[0]?.chapters) {
          const chapterIds = response.raw.data[0].chapters.map(ch => ch.id.toString());
          subscribedChapters.push(...chapterIds);
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch subscribed chapters:', err);
      }

      // Check selected terms
      let chosenTerms = { term1: false, term2: false };
      try {
        if (sid) {
          const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
          if (subscriptionRes.success && Array.isArray(subscriptionRes.data)) {
            subscriptionRes.data.forEach(s => {
              const courseName = (s.course_name || s.course || '').toString().toLowerCase();
              const courseIdSub = s.course_id || s.courseId || s.courseid || s.course || '';
              if (courseName.includes('term 1') || courseName.includes('term1') || String(courseIdSub) === '82') {
                chosenTerms.term1 = true;
              }
              if (courseName.includes('term 2') || courseName.includes('term2')) {
                chosenTerms.term2 = true;
              }
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ Unable to determine chosen terms:', err);
      }

      // Quarter 1 (chapter_id: 521)
      const quarter1Unlocked = chosenTerms.term1 || subscribedChapters.includes('521');
      if (quarter1Unlocked) {
        unlockedQuarters.push({ id: '521', title: 'Quarter 1' });
      }

      // Quarter 2 (chapter_id: 790)
      const quarter2Unlocked = chosenTerms.term2 || subscribedChapters.includes('790');
      if (quarter2Unlocked) {
        unlockedQuarters.push({ id: '790', title: 'Quarter 2' });
      }

      console.log('🔓 Unlocked quarters check:', {
        subscribedChapters,
        chosenTerms,
        quarter1Unlocked,
        quarter2Unlocked
      });

    } catch (error) {
      console.error('❌ Error getting unlocked quarters:', error);
      // Default to Quarter 1 if error
      unlockedQuarters.push({ id: '521', title: 'Quarter 1' });
    }

    return unlockedQuarters;
  };

  const loadLiveClassVideo = async () => {
    setLoading(true);
    try {
      const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
      
      if (!sid) {
        console.error('No SID found');
        setLoading(false);
        return;
      }

      // Step 1: Get course_start_date from check_student_subscription
      const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
      
      if (!subscriptionRes.success || !subscriptionRes.data || subscriptionRes.data.length === 0) {
        console.error('No subscription data found');
        setLoading(false);
        return;
      }

      const courseData = subscriptionRes.data[0];
      const startDate = courseData.course_start_date;
      
      if (!startDate) {
        console.error('No course_start_date found');
        setLoading(false);
        return;
      }

      setCourseStartDate(startDate);
      console.log('📅 Course Start Date:', startDate);

      // Step 2: Determine today's session type
      const today = new Date();
      const todayDayOfWeek = today.getDay();
      const sessionType = getSessionTypeForDay(todayDayOfWeek);

      if (!sessionType) {
        console.log('🚫 No class on weekends');
        setCurrentVideo({
          title: 'No Class Today',
          description: 'Enjoy your weekend! Classes resume on Monday.',
          isWeekend: true
        });
        setLoading(false);
        return;
      }

      setCurrentDayType(sessionType);
      console.log('📚 Today\'s Session Type:', sessionType);

      // Step 3: Calculate which video to show
      const daysPassed = getDaysSinceCourseStart(startDate);
      const videoIndex = getVideoIndexForSession(sessionType, daysPassed, startDate);
      
      console.log('📊 Days Passed:', daysPassed);
      console.log('🎯 Video Index:', videoIndex, `(This should correspond to Day ${videoIndex + 1} session)`);

      // Step 4: Get unlocked quarters
      const studentId = user?.id || userData?.id || userData?.student_id;
      const unlockedQuarters = await getUnlockedQuarters(sid, studentId);
      
      console.log('🔓 Unlocked Quarters:', unlockedQuarters);

      if (unlockedQuarters.length === 0) {
        console.log('⚠️ No unlocked quarters found');
        setLoading(false);
        return;
      }

      // Step 5: Fetch videos from all unlocked quarters
      const type = sessionType === 'recorded' ? '0' : '1';
      const videosPromises = unlockedQuarters.map(async (quarter) => {
        try {
          const response = await recordedClassesAPI.viewChapterLessonsInfo({
            course_chapter_id: quarter.id,
            student_id: studentId,
            type: type
          });

          if (response.success && response.raw?.lessons) {
            const lessons = response.raw.lessons;
            
            if (lessons.length === 0) {
              return null;
            }

            // For Quarter 1 (id: 521), check if we need to skip orientation video
            // Orientation video only exists for recorded classes (type '0'), not for bonus sessions (type '1')
            // For Quarter 2 (id: 790), use videoIndex directly as it doesn't have orientation
            let effectiveIndex = videoIndex;
            if (quarter.id === '521' && type === '0') {
              // Quarter 1 Recorded Classes: Skip orientation video (index 0), so add 1 to videoIndex
              // videoIndex 0 (Day 1 session) = Day 1 video (index 1 in lessons array)
              // videoIndex 4 (Day 5 session) = Day 5 video (index 5 in lessons array)
              effectiveIndex = videoIndex + 1;
              
              // If only orientation video exists or effectiveIndex is out of bounds, skip
              if (effectiveIndex >= lessons.length || lessons.length <= 1) {
                console.log(`⚠️ Quarter 1: No valid Day video available (only orientation or out of bounds)`);
                return null;
              }
              
              console.log(`📊 Quarter 1 Recorded: videoIndex=${videoIndex} (Day ${videoIndex + 1}), effectiveIndex=${effectiveIndex} (skipping orientation)`);
            } else if (quarter.id === '521' && type === '1') {
              // Quarter 1 Bonus Sessions: No orientation video, use videoIndex directly
              // videoIndex 0 = Day 1, videoIndex 4 = Day 5
              effectiveIndex = videoIndex;
              console.log(`📊 Quarter 1 Bonus: videoIndex=${videoIndex} (Day ${videoIndex + 1}), effectiveIndex=${effectiveIndex} (no orientation)`);
            } else {
              // Quarter 2: No orientation video, videoIndex directly maps to day number
              // videoIndex 0 = Day 1, videoIndex 4 = Day 5
              console.log(`📊 Quarter 2: videoIndex=${videoIndex} (Day ${videoIndex + 1}), effectiveIndex=${effectiveIndex}`);
            }
            
            // Get the video at calculated effective index
            // Fallback: for Quarter 1, use index 1 (Day 1), for Quarter 2, use index 0 (Day 1)
            const targetLesson = lessons[effectiveIndex] || lessons[quarter.id === '521' ? 1 : 0];
            const content = targetLesson.content?.[0];

            // Prefer backend-provided class_summary_pdf (day-wise PDF) if available, otherwise fall back to video_url
            let contentUrl = '';
            if (content) {
              const summaryPdf = content.class_summary_pdf;
              let pdfPath = '';
              if (Array.isArray(summaryPdf) && summaryPdf.length > 0) {
                pdfPath = summaryPdf[0] || '';
              } else if (typeof summaryPdf === 'string' && summaryPdf.trim() !== '') {
                pdfPath = summaryPdf.trim();
              }

              if (pdfPath) {
                contentUrl = constructImageUrl(pdfPath);
              } else {
                const videoUrl = content.video_url || content.video || '';
                contentUrl = videoUrl;
              }
            }

            return {
              id: targetLesson.id,
              title: targetLesson.lesson_title,
              thumbnail: constructImageUrl(targetLesson.image || content?.image),
              videoUrl: contentUrl,
              description: formatRichText(targetLesson.lesson_description || content?.class_description || ''),
              requirement: formatRichText(targetLesson.requirements || content?.class_requirement || ''),
              sessionType: sessionType,
              videoIndex: videoIndex,
              totalVideos: lessons.length,
              content: content,
              quarterId: quarter.id,
              quarterTitle: quarter.title
            };
          }
          return null;
        } catch (error) {
          console.error(`❌ Error fetching video for quarter ${quarter.id}:`, error);
          return null;
        }
      });

      const videos = await Promise.all(videosPromises);
      const validVideos = videos.filter(v => v !== null);

      if (validVideos.length > 0) {
        setCurrentVideos(validVideos);
        console.log('✅ Current Live Videos:', validVideos.map(v => `${v.quarterTitle}: ${v.title}`));
      } else {
        console.log('⚠️ No valid videos found');
      }

    } catch (error) {
      console.error('❌ Error loading live class:', error);
    } finally {
      setLoading(false);
    }
  };

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
      .trim();
  };

  const handleSessionCardClick = (video) => {
    if (video) {
      const content = video.content || {};
      setSessionDetails({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl || content.video_url || '',
        description: video.description || formatRichText(content.class_description || ''),
        requirement: video.requirement || formatRichText(content.class_requirement || '')
      });
      setShowVideoDetails(true);
    }
  };

  const handleBackClick = () => {
    setShowVideoDetails(false);
    setSessionDetails(null);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-[#666]">Loading today's class...</div>
      </div>
    );
  }

  if (currentVideos.length === 0) {
    // Check if it's weekend
    if (currentDayType === null) {
      return (
        <div className="p-8 min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#333] mb-4">No Class Today</h2>
            <p className="text-lg text-[#666]">Enjoy your weekend! Classes resume on Monday.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-8 min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-[#666]">No class available</div>
      </div>
    );
  }

  // Show video details view when session card is clicked
  if (showVideoDetails && sessionDetails) {
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
            {sessionDetails.title}
          </h1>
        </div>
        <div className="session-detail-container flex flex-col md:flex-row gap-10 mt-0 items-start max-w-[1400px] mx-auto">
          <div className="flex-1 min-w-0">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              {sessionDetails.videoUrl ? (
                (() => {
                  const url = sessionDetails.videoUrl || '';
                  const isPdf = url.toLowerCase().includes('.pdf');

                  return (
                    <iframe
                      src={url}
                      className="w-full h-full border-none"
                      allow={
                        isPdf
                          ? ''
                          : 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      }
                      allowFullScreen={!isPdf}
                      title={sessionDetails.title}
                      frameBorder="0"
                    ></iframe>
                  );
                })()
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
      </div>
    );
  }

  // Show session card view
  return (
    <div className="p-8 min-h-screen bg-white max-w-full">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-bold text-[#333] m-0 leading-tight">
              Today's Live Class
            </h1>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
              currentDayType === 'recorded' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {currentDayType === 'recorded' ? 'Recorded Class' : 'Bonus Session'}
            </span>
          </div>
          {currentVideos.length > 0 && (
            <p className="text-base text-[#666]">
              Session {currentVideos[0].videoIndex + 1} of {currentVideos[0].totalVideos}
            </p>
          )}
        </div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentVideos.map((video, index) => (
            <div key={`${video.quarterId}-${video.id}`} className="max-w-[400px] w-full">
              <div 
                className="session-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#e0e0e0] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] relative"
                onClick={() => handleSessionCardClick(video)}
              >
                {/* Unlock Icon */}
                <div className="absolute top-4 right-4 z-10 bg-green-100 rounded-full p-3 shadow-md">
                  <FaUnlock className="text-green-600 text-2xl" />
                </div>

                {/* Quarter Badge */}
                <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {video.quarterTitle}
                </div>

                <div className="session-video-thumbnail w-full h-[200px] relative bg-[#f5f0e8] overflow-hidden">
                  <div className="video-player-background w-full h-full relative flex items-center justify-center">
                    <div className="video-books-left absolute top-1/2 -translate-y-1/2 left-[8%] flex flex-col gap-1 z-[1]"></div>
                    <div className="video-screen w-[65%] h-[110px] bg-[#9BC4F7] rounded-md relative z-[2] flex flex-col items-center justify-center p-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)] overflow-hidden">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail}
                          alt={video.title} 
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
                  <h3 className="text-base font-semibold text-black m-0 leading-normal">{video.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveClass;