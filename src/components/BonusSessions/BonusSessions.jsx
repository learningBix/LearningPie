import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { recordedClassesAPI, subjectsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';
import './BonusSessions.css';
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
  const [subscribedChapters, setSubscribedChapters] = useState([]);
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);

  const handleEnrollClick = () => {
    setShowEnrollPopup(true);
  };

  const closeEnrollPopup = () => {
    setShowEnrollPopup(false);
  };

  useEffect(() => {
    loadQuarters();
  }, [userData, user]);

  const getBlobUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanBaseUrl = BLOB_BASE_URL.endsWith('/') ? BLOB_BASE_URL.slice(0, -1) : BLOB_BASE_URL;
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${cleanBaseUrl}/${cleanImagePath}`;
  };

  const fetchSubscribedChapters = async () => {
    try {
      const studentId = userData?.id || userData?.student_id || user?.id;
      const courseId = '82'; // Junior KG - Term 1 course ID
      
      console.log('🔍 [Bonus] Fetching subscribed chapters for student:', studentId, 'course:', courseId);
      
      const response = await recordedClassesAPI.viewCourseInfo({
        id: courseId,
        student_id: studentId
      });

      console.log('📥 [Bonus] Subscribed chapters response:', response);

      if (response.success && response.raw?.data?.[0]?.chapters) {
        const chapterIds = response.raw.data[0].chapters.map(ch => ch.id.toString());
        console.log('✅ [Bonus] Subscribed chapter IDs:', chapterIds);
        setSubscribedChapters(chapterIds);
        return chapterIds;
      }
      
      console.log('⚠️ [Bonus] No chapters found in response');
      return [];
    } catch (error) {
      console.error('❌ [Bonus] Error fetching subscribed chapters:', error);
      return [];
    }
  };

  // Helper: Get total sessions count (Recorded + Bonus) for a quarter
  const getTotalSessionsInQuarter = async (quarterId, studentId) => {
    try {
      const [recordedRes, bonusRes] = await Promise.all([
        recordedClassesAPI.viewChapterLessonsInfo({
          course_chapter_id: quarterId,
          student_id: studentId,
          type: '0' // Recorded
        }),
        recordedClassesAPI.viewChapterLessonsInfo({
          course_chapter_id: quarterId,
          student_id: studentId,
          type: '1' // Bonus
        })
      ]);

      let recordedCount = 0;
      let bonusCount = 0;

      if (recordedRes.success && recordedRes.raw?.lessons) {
        recordedCount = recordedRes.raw.lessons.length;
        if (quarterId === '521') {
          // Subtract orientation video (index 0) for Quarter 1
          recordedCount = Math.max(0, recordedCount - 1);
        }
      }

      if (bonusRes.success && bonusRes.raw?.lessons) {
        bonusCount = bonusRes.raw.lessons.length;
      }

      return {
        recordedCount,
        bonusCount,
        totalSessions: recordedCount + bonusCount
      };
    } catch (error) {
      console.error(`❌ [Bonus] Error getting total sessions for quarter ${quarterId}:`, error);
      return { recordedCount: 0, bonusCount: 0, totalSessions: 0 };
    }
  };

  // Helper: Check if previous quarters are complete (for sequential lock logic)
  const isPreviousQuartersComplete = async (quarterId, courseStartDate, studentId) => {
    try {
      // Get total sessions completed so far
      const today = new Date();
      const start = new Date(courseStartDate);
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      
      const diffTime = today - start;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let totalSessionsCompleted = 0;
      for (let i = 0; i <= diffDays; i++) {
        const checkDate = new Date(start);
        checkDate.setDate(checkDate.getDate() + i);
        checkDate.setHours(0, 0, 0, 0);
        const dayOfWeek = checkDate.getDay();
        
        // Monday (1), Wednesday (3), Friday (5) = Recorded
        // Tuesday (2), Thursday (4) = Bonus
        if ([1, 2, 3, 4, 5].includes(dayOfWeek)) {
          totalSessionsCompleted++;
        }
      }

      // Check if Quarter 1 needs to be complete before Quarter 2
      if (quarterId === '790') { // Quarter 2
        const quarter1Sessions = await getTotalSessionsInQuarter('521', studentId);
        const quarter1Total = quarter1Sessions.totalSessions;
        
        // If Quarter 1 is not complete, Quarter 2 should be locked
        if (totalSessionsCompleted < quarter1Total) {
          console.log(`🔒 [Bonus] Quarter 2 locked: Q1 not complete (${totalSessionsCompleted}/${quarter1Total})`);
          return false;
        }
      }

      // For Quarter 3 (id: 772), check if Q1 + Q2 are complete
      if (quarterId === '772') {
        const quarter1Sessions = await getTotalSessionsInQuarter('521', studentId);
        const quarter2Sessions = await getTotalSessionsInQuarter('790', studentId);
        const totalPreviousSessions = quarter1Sessions.totalSessions + quarter2Sessions.totalSessions;
        
        if (totalSessionsCompleted < totalPreviousSessions) {
          console.log(`🔒 [Bonus] Quarter 3 locked: Q1+Q2 not complete (${totalSessionsCompleted}/${totalPreviousSessions})`);
          return false;
        }
      }

      return true; // Previous quarters are complete
    } catch (error) {
      console.error('❌ [Bonus] Error checking previous quarters:', error);
      return true; // Default to unlocked if error
    }
  };

 // COMPLETE FIXED BonusSessions.js
// Replace your entire loadQuarters function with this (around line 60-220):

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

    console.log('📊 [Bonus] Loading quarters for student:', studentId);

    // Fetch subscribed chapters first
    const subscribed = await fetchSubscribedChapters();
    
    // Determine chosen terms using check_student_subscription
    let chosenTerms = { term1: false, term2: false, term3: false };
    try {
      const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
      if (sid) {
        const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
        if (subscriptionRes.success && Array.isArray(subscriptionRes.data)) {
          subscriptionRes.data.forEach(s => {
            const courseName = (s.course_name || s.course || '').toString().toLowerCase();
            const courseIdSub = s.course_id || s.courseId || s.courseid || s.course || '';
            const terms = (s.terms || '').toString();
            
            if (courseName.includes('term 1') || courseName.includes('term1') || String(courseIdSub) === '82') {
              chosenTerms.term1 = true;
            }
            if (courseName.includes('term 2') || courseName.includes('term2')) {
              chosenTerms.term2 = true;
            }
            // Check if Term 3 is in the terms string (e.g., "1,2,3" or "3")
            if (terms.includes('3') || courseName.includes('term 3') || courseName.includes('term3')) {
              chosenTerms.term3 = true;
            }
          });
        }
      }
    } catch (err) {
      console.warn('⚠️ [Bonus] Unable to determine chosen terms:', err);
    }

    console.log('🔑 [Bonus] Chosen Terms:', chosenTerms);

    const quarterData = [];

    // Fetch Quarter 1, Quarter 2, and Quarter 3
    const [quarter1Res, quarter2Res, quarter3Res, quarter3ChapterRes] = await Promise.all([
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
      }),
      // Fetch Quarter 3 chapter data if Term 3 is purchased
      chosenTerms.term3 ? recordedClassesAPI.viewChapterLessonsInfo({ 
        course_chapter_id: '772',
        student_id: studentId,
        type: '1'
      }).catch(() => ({ success: false })) : Promise.resolve({ success: false })
    ]);

    // Map Quarter 1
    if (quarter1Res.success && quarter1Res.raw?.data?.[0]) {
      const data = quarter1Res.raw.data[0];
      const isLocked = !(chosenTerms.term1 || subscribed.includes('521'));
      console.log('[Bonus] Quarter 1 - isLocked:', isLocked, 'term1:', chosenTerms.term1, 'subscribed:', subscribed);
      quarterData.push({
        id: 1,
        title: data.chapter_title || 'Quarter 1',
        description: data.chapter_description || 'Browse through unlocked sessions for better understanding.',
        image: getBlobUrl(data.image),
        type: 'quarter',
        chapterId: '521',
        isLocked: isLocked
      });
    }

    // Map Quarter 2
    if (quarter2Res.success && quarter2Res.raw?.data?.[0]) {
      const data = quarter2Res.raw.data[0];
      // Check if Quarter 2 is subscribed/unlocked
      const isSubscribed = chosenTerms.term2 || subscribed.includes('790');
      
      // Check if previous quarters (Q1) are complete for sequential unlock
      let isSequentiallyUnlocked = true;
      let courseStartDate = null;
      try {
        const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
        if (sid) {
          const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
          if (subscriptionRes.success && subscriptionRes.data?.[0]?.course_start_date) {
            courseStartDate = subscriptionRes.data[0].course_start_date;
            if (isSubscribed) {
              isSequentiallyUnlocked = await isPreviousQuartersComplete('790', courseStartDate, studentId);
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ [Bonus] Could not check sequential unlock for Quarter 2:', err);
      }
      
      // Quarter 2 is locked if: not subscribed OR previous quarters not complete
      const isLocked = !isSubscribed || !isSequentiallyUnlocked;
      console.log('[Bonus] Quarter 2 - isLocked:', isLocked, 'term2:', chosenTerms.term2, 'subscribed:', isSubscribed, 'sequentiallyUnlocked:', isSequentiallyUnlocked);
      quarterData.push({
        id: 2,
        title: data.chapter_title || 'Quarter 2',
        description: data.chapter_description || 'Browse through unlocked sessions for better understanding.',
        image: getBlobUrl(data.image),
        type: 'quarter',
        chapterId: '790',
        isLocked: isLocked
      });
    }

    // Map Quarter 3 - Check if Term 3 is purchased
    if (quarter3Res.success) {
      const quarter3Data = quarter3Res.raw?.data || quarter3Res.data || [];
      if (quarter3Data.length > 0) {
        const course = quarter3Data[0];
        
        // If Term 3 is purchased, show Quarter 3 as normal quarter (like Q1/Q2)
        if (chosenTerms.term3 && quarter3ChapterRes.success && quarter3ChapterRes.raw?.data?.[0]) {
          const chapterData = quarter3ChapterRes.raw.data[0];
          // Check if previous quarters (Q1+Q2) are complete for sequential unlock
          let isSequentiallyUnlocked = true;
          let courseStartDate = null;
          try {
            const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
            if (sid) {
              const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
              if (subscriptionRes.success && subscriptionRes.data?.[0]?.course_start_date) {
                courseStartDate = subscriptionRes.data[0].course_start_date;
                isSequentiallyUnlocked = await isPreviousQuartersComplete('772', courseStartDate, studentId);
              }
            }
          } catch (err) {
            console.warn('⚠️ [Bonus] Could not check sequential unlock for Quarter 3:', err);
          }
          
          // Quarter 3 is locked if: previous quarters not complete
          const isLocked = !isSequentiallyUnlocked;
          console.log('[Bonus] Quarter 3 - isLocked:', isLocked, 'term3:', chosenTerms.term3, 'sequentiallyUnlocked:', isSequentiallyUnlocked);
          
          quarterData.push({
            id: 3,
            title: chapterData.chapter_title || 'Quarter 3',
            description: chapterData.chapter_description || 'Browse through unlocked sessions for better understanding.',
            image: getBlobUrl(chapterData.image),
            type: 'quarter',
            chapterId: '772',
            isLocked: isLocked
          });
        } else {
          // Term 3 not purchased - show Buy Quarter 3 option
          quarterData.push({
            id: 3,
            title: course.course_name || 'Buy Quarter 3',
            description: cleanDescription(course.description || course.course_detail),
            image: quarter_3,
            type: 'buy_plan',
            terms: ['3'],
            courseData: course,
            isLocked: false
          });
        }
      }
    }

    // Add static sessions (DIY Home and Excursions)
    quarterData.push(
      {
        id: 4,
        title: 'DIY Home',
        type: 'diy_home',
        image: diy_home,
        isLocked: false
      },
      {
        id: 5,
        title: 'Excursions',
        type: 'excursions',
        image: excursion,
        isLocked: false
      }
    );

    console.log('📦 [Bonus] Total quarters before filtering:', quarterData.length);

    // ✅ CORRECTED FILTERING LOGIC
    // Always show Quarter 2 as locked if Term 2 is not selected (don't hide it)
    const filtered = (() => {
      const hasSelection = chosenTerms.term1 || chosenTerms.term2;
      
      // If no terms selected, show all quarters (default behavior)
      if (!hasSelection) {
        console.log('🔓 [Bonus] No term selected - showing all quarters');
        return quarterData;
      }
      
      // If terms ARE selected, filter quarters
      console.log('🔍 [Bonus] Filtering based on selected terms:', chosenTerms);
      
      return quarterData.filter(q => {
        // Always keep buy_plan, diy_home, and excursions visible
        if (q.type === 'buy_plan' || q.type === 'diy_home' || q.type === 'excursions') {
          console.log(`  ✅ [Bonus] ${q.title} - Always visible (special type)`);
          return true;
        }
        
        // Quarter 1 (521): Show ONLY if Term 1 is selected
        if (q.chapterId === '521') {
          const show = chosenTerms.term1 === true;
          console.log(`  ${show ? '✅' : '❌'} [Bonus] Quarter 1 - Term 1 selected: ${chosenTerms.term1}`);
          return show;
        }
        
        // Quarter 2 (790): Always show (will be locked if Term 2 is not selected)
        if (q.chapterId === '790') {
          console.log(`  ✅ [Bonus] Quarter 2 - Always visible (locked if Term 2 not selected)`);
          return true;
        }
        
        // Quarter 3 (772): Always show (will be locked if Term 3 is not purchased or previous quarters not complete)
        if (q.chapterId === '772') {
          console.log(`  ✅ [Bonus] Quarter 3 - Always visible (locked if Term 3 not purchased or Q1+Q2 not complete)`);
          return true;
        }
        
        return false;
      });
    })();

    console.log('✅ [Bonus] Final filtered quarters:', filtered.map(q => q.title));
    console.log('📊 [Bonus] Summary - Term 1:', chosenTerms.term1, '| Term 2:', chosenTerms.term2);
    
    setQuarters(filtered);
  } catch (error) {
    console.error('❌ [Bonus] Error loading quarters:', error);
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

  // UPDATE: Add this helper function at the top of BonusSessions component (after state declarations)

const calculateUnlockedBonusVideoIndex = (courseStartDate) => {
  if (!courseStartDate) return 0;
  
  const today = new Date();
  const start = new Date(courseStartDate);
  
  // Set time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Count only Tue/Thu (Bonus Session days)
  // Loop until yesterday (i < diffDays) to exclude today
  // This ensures only videos up to yesterday are unlocked, matching what's shown in LiveClass today
  let bonusSessionCount = 0;
  
  for (let i = 0; i < diffDays; i++) {
    const checkDate = new Date(courseStartDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayOfWeek = checkDate.getDay();
    
    // Tuesday (2), Thursday (4)
    if ([2, 4].includes(dayOfWeek)) {
      bonusSessionCount++;
    }
  }
  
  return bonusSessionCount; // This is how many videos should be unlocked (up to yesterday)
};

// UPDATE: Modify loadQuarterSessions function to include lock/unlock logic

const loadQuarterSessions = async (chapterId) => {
  const studentId = user?.id || userData?.id || userData?.student_id;
  const response = await recordedClassesAPI.viewChapterLessonsInfo({ 
    course_chapter_id: chapterId.toString(),
    student_id: studentId,
    type: '1'
  });
  
  if (response.success && response.raw?.lessons) {
    // Get course_start_date to calculate unlocked videos
    let unlockedCount = response.raw.lessons.length; // Default: all unlocked
    
    try {
      const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
      if (sid) {
        const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
        if (subscriptionRes.success && subscriptionRes.data?.[0]?.course_start_date) {
          const courseStartDate = subscriptionRes.data[0].course_start_date;
          unlockedCount = calculateUnlockedBonusVideoIndex(courseStartDate);
          console.log('🔓 [Bonus] Unlocked videos count:', unlockedCount);
        }
      }
    } catch (err) {
      console.warn('⚠️ [Bonus] Could not determine unlock status:', err);
    }
    
    const mappedSessions = response.raw.lessons.map((lesson, index) => {
      const content = lesson.content?.[0] || null;
      const isLocked = index >= unlockedCount; // Lock videos beyond unlocked count

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
          // Ensure PDF path is converted to full Blob URL if it's not already absolute
          contentUrl = getBlobUrl(pdfPath);
        } else {
          const videoUrl = content.video_url || content.video || '';
          contentUrl = videoUrl;
        }
      }
      
      return {
        id: lesson.id,
        title: lesson.lesson_title,
        thumbnail: getBlobUrl(lesson.image),
        videoUrl: contentUrl,
        description: content ? formatRichText(content.class_description) : '',
        requirement: content ? formatRichText(content.class_requirement) : '',
        isLocked: isLocked,
        index: index
      };
    });

    setSessions(mappedSessions);
  }
};

// UPDATE: Modify handleSessionClick to check if video is locked

const handleSessionClick = (session) => {
  if (session.isLocked) {
    alert('This video is locked. It will be unlocked after the live class.');
    return;
  }
  
  setSelectedSession(session);
  setHasTrackedVideo(false);
};

// Session card lock/unlock overlay is implemented in the sessions.map below

  const handleQuarterClick = async (quarter) => {
    // Check if quarter is locked
    if (quarter.isLocked) {
      alert('This quarter is locked. Please subscribe to access the content.');
      return;
    }

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

  // Duplicate simple loadQuarterSessions removed; keep the unlock-aware version defined above

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

  // Duplicate simple handleSessionClick removed; keep the lock-aware version defined above

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
      <div className="p-8 min-h-screen bg-white max-w-full">
        <button
          className="bonus-back-button"
          onClick={handleBack}
        >
          Back
        </button>
        <div className="max-w-[1400px] mx-auto mb-8">
          <h1 className="text-[32px] font-bold text-[#333] m-0 leading-tight">
            {selectedSession.title}
          </h1>
        </div>
        <div className="session-detail-container flex flex-col md:flex-row gap-10 mt-0 items-start max-w-[1400px] mx-auto">
          <div className="flex-1 min-w-0">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              {selectedSession.videoUrl ? (
                (() => {
                  const url = selectedSession.videoUrl || '';
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
                  title={selectedSession.title}
                  frameBorder="0"
                ></iframe>
                  );
                })()
              ) : (
                <div className="text-white text-center p-5">
                  <p className="my-2.5 text-sm text-[#ccc]">Video player will be displayed here</p>
                  <p className="my-2.5 text-sm text-[#ccc]">Video URL: {selectedSession.videoUrl || 'Not available'}</p>
                </div>
              )}
            </div>
          </div>
          <div className="session-detail-content flex-[0_0_400px] md:flex-[0_0_400px] flex flex-col gap-8 w-full md:w-auto">
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Description</h3>
              <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">
                {selectedSession.description ? formatRichText(selectedSession.description) : 'No description available.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-[#333] m-0 leading-tight">Requirement</h3>
              <p className="text-base text-[#333] leading-relaxed m-0 whitespace-pre-line">
                {selectedSession.requirement ? formatRichText(selectedSession.requirement) : 'No requirements specified.'}
              </p>
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
        <div className="p-8 min-h-screen bg-white relative">
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
                  onClick={handleEnrollClick}
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

          {showEnrollPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
                <h2 className="text-xl font-bold text-[#333] mb-3 text-center">Contact Admin</h2>
                <p className="text-sm text-[#555] mb-4 text-center">
                  To enroll, please contact the admin at{' '}
                  <a href="mailto:contact@learningbix.com" className="text-[#FF8C42] font-semibold underline">
                    contact@learningbix.com
                  </a>
                  .
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    className="px-6 border border-[#FF8C42] text-[#FF8C42] rounded-lg py-2 text-sm font-semibold hover:bg-[#FFF3EB] transition-colors"
                    onClick={closeEnrollPopup}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
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
              <div key={session.id} className={`session-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#e0e0e0] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] relative ${session.isLocked ? 'opacity-60' : ''}`} onClick={() => handleSessionClick(session)}>
                {/* Lock Icon Overlay */}
                {session.isLocked && (
                  <div className="absolute top-4 right-4 z-10 bg-white rounded-full p-3 shadow-lg">
                    <FaLock className="text-[#FF8C42] text-2xl" />
                  </div>
                )}
                {/* Unlock Icon for unlocked sessions */}
                {!session.isLocked && (
                  <div className="absolute top-4 right-4 z-10 bg-green-100 rounded-full p-3 shadow-md">
                    <FaUnlock className="text-green-600 text-2xl" />
                  </div>
                )}
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
                  {session.isLocked && (
                    <p className="text-xs text-[#FF8C42] mt-2 font-semibold">🔒 Unlocks after live class</p>
                  )}
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
              className={`quarter-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 flex flex-col border border-[#e0e0e0] min-h-full relative hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] bonus-session-card ${
                quarter.isLocked ? 'opacity-60' : ''
              } ${quarter.type === 'buy_plan' ? 'purchasable' : ''}`}
              onClick={() => handleQuarterClick(quarter)}
            >
              {/* Lock Icon Overlay */}
              {quarter.isLocked && (
                <div className="absolute top-4 right-4 z-10 bg-white rounded-full p-3 shadow-lg">
                  <FaLock className="text-[#FF8C42] text-2xl" />
                </div>
              )}
              
              {/* Unlock Icon for unlocked quarters (not for buy_plan, diy_home, excursions) */}
              {!quarter.isLocked && quarter.type === 'quarter' && (
                <div className="absolute top-4 right-4 z-10 bg-green-100 rounded-full p-3 shadow-md">
                  <FaUnlock className="text-green-600 text-2xl" />
                </div>
              )}

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
                
                {quarter.isLocked && (
                  <div className="mt-2 text-sm text-[#FF8C42] font-semibold">
                    🔒 Subscribe to unlock
                  </div>
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