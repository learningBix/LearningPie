import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaPlay } from 'react-icons/fa';
import { recordedClassesAPI, subjectsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';
import './LiveClass.css';

const LiveClass = ({ user = {}, userData = {}, onVideoWatch }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
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
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper: Get video index based on session count
  const getVideoIndexForSession = (sessionType, daysPassed) => {
    // Count only relevant days (Mon/Wed/Fri for RC, Tue/Thu for BS)
    let sessionCount = 0;
    
    for (let i = 0; i <= daysPassed; i++) {
      const checkDate = new Date(courseStartDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dayType = getSessionTypeForDay(checkDate.getDay());
      
      if (dayType === sessionType) {
        sessionCount++;
      }
    }
    
    // Return index (0-based)
    return sessionCount > 0 ? sessionCount - 1 : 0;
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
      const videoIndex = getVideoIndexForSession(sessionType, daysPassed);
      
      console.log('📊 Days Passed:', daysPassed);
      console.log('🎯 Video Index:', videoIndex);

      // Step 4: Fetch videos based on session type
      const studentId = user?.id || userData?.id || userData?.student_id;
      let chapterId;
      
      if (sessionType === 'recorded') {
        chapterId = '521'; // Recorded Class - Quarter 1
      } else {
        chapterId = '521'; // Bonus Session - Quarter 1 (type=1)
      }

      const type = sessionType === 'recorded' ? '0' : '1';
      
      const response = await recordedClassesAPI.viewChapterLessonsInfo({
        course_chapter_id: chapterId,
        student_id: studentId,
        type: type
      });

      if (response.success && response.raw?.lessons) {
        const lessons = response.raw.lessons;
        
        if (lessons.length === 0) {
          console.log('⚠️ No lessons found');
          setLoading(false);
          return;
        }

        // Get the video at calculated index
        const targetLesson = lessons[videoIndex] || lessons[0];
        const content = targetLesson.content?.[0];

        setCurrentVideo({
          id: targetLesson.id,
          title: targetLesson.lesson_title,
          thumbnail: constructImageUrl(targetLesson.image || content?.image),
          videoUrl: content?.video_url || '',
          description: formatRichText(targetLesson.lesson_description || content?.class_description || ''),
          requirement: formatRichText(targetLesson.requirements || content?.class_requirement || ''),
          sessionType: sessionType,
          videoIndex: videoIndex,
          totalVideos: lessons.length
        });

        console.log('✅ Current Live Video:', targetLesson.lesson_title);
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

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-[#666]">Loading today's class...</div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="p-8 min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-[#666]">No class available</div>
      </div>
    );
  }

  if (currentVideo.isWeekend) {
    return (
      <div className="p-8 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#333] mb-4">{currentVideo.title}</h2>
          <p className="text-lg text-[#666]">{currentVideo.description}</p>
        </div>
      </div>
    );
  }

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
          <p className="text-base text-[#666]">
            Session {currentVideo.videoIndex + 1} of {currentVideo.totalVideos}
          </p>
        </div>

        {/* Video Player Section */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#333] mb-2">{currentVideo.title}</h2>
            </div>
            
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              {currentVideo.videoUrl ? (
                <iframe
                  src={currentVideo.videoUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentVideo.title}
                  frameBorder="0"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex-[0_0_400px] md:flex-[0_0_400px] flex flex-col gap-6 w-full md:w-auto">
            {currentVideo.description && (
              <div className="flex flex-col gap-3 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Description</h3>
                <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">
                  {currentVideo.description}
                </p>
              </div>
            )}
            
            {currentVideo.requirement && (
              <div className="flex flex-col gap-3 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Requirements</h3>
                <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">
                  {currentVideo.requirement}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Class Schedule</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Monday:</span>
                  <span className="font-semibold">Recorded Class</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuesday:</span>
                  <span className="font-semibold">Bonus Session</span>
                </div>
                <div className="flex justify-between">
                  <span>Wednesday:</span>
                  <span className="font-semibold">Recorded Class</span>
                </div>
                <div className="flex justify-between">
                  <span>Thursday:</span>
                  <span className="font-semibold">Bonus Session</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday:</span>
                  <span className="font-semibold">Recorded Class</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClass;