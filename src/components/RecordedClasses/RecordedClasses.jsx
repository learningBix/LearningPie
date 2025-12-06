import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { recordedClassesAPI, subjectsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';
import './RecordedClasses.css';
import buyTerm3Image from '../../assets/buy_term3.jpeg';
import quarter2Image from '../../assets/Quarter2.jpg';

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
  }, []);

  useEffect(() => {
    if (sessionDetails?.videoUrl && !hasTrackedVideo && onVideoWatch) {
      onVideoWatch('recorded_class');
      setHasTrackedVideo(true);
    }
  }, [sessionDetails, hasTrackedVideo, onVideoWatch]);

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
      console.error(`❌ Error getting total sessions for quarter ${quarterId}:`, error);
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
          console.log(`🔒 Quarter 2 locked: Q1 not complete (${totalSessionsCompleted}/${quarter1Total})`);
          return false;
        }
      }

      // For Quarter 3 (id: 772), check if Q1 + Q2 are complete
      if (quarterId === '772') {
        const quarter1Sessions = await getTotalSessionsInQuarter('521', studentId);
        const quarter2Sessions = await getTotalSessionsInQuarter('790', studentId);
        const totalPreviousSessions = quarter1Sessions.totalSessions + quarter2Sessions.totalSessions;
        
        if (totalSessionsCompleted < totalPreviousSessions) {
          console.log(`🔒 Quarter 3 locked: Q1+Q2 not complete (${totalSessionsCompleted}/${totalPreviousSessions})`);
          return false;
        }
      }

      return true; // Previous quarters are complete
    } catch (error) {
      console.error('❌ Error checking previous quarters:', error);
      return true; // Default to unlocked if error
    }
  };

  // UPDATE: Add this helper function at the top of RecordedClasses component (after state declarations)

const calculateUnlockedVideoIndex = (courseStartDate) => {
  if (!courseStartDate) return 0;
  
  const today = new Date();
  const start = new Date(courseStartDate);
  
  // Set time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Count only Mon/Wed/Fri (Recorded Class days)
  // Loop until yesterday (i < diffDays) to exclude today
  // This ensures only videos up to yesterday are unlocked, matching what's shown in LiveClass today
  let recordedClassCount = 0;
  
  for (let i = 0; i < diffDays; i++) {
    const checkDate = new Date(courseStartDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayOfWeek = checkDate.getDay();
    
    // Monday (1), Wednesday (3), Friday (5)
    if ([1, 3, 5].includes(dayOfWeek)) {
      recordedClassCount++;
    }
  }
  
  return recordedClassCount; // This is how many videos should be unlocked (up to yesterday)
};

// UPDATE: Modify loadQuarterSessions function to include lock/unlock logic

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
      
      // Get course_start_date to calculate unlocked videos
      let unlockedCount = lessons.length; // Default: all unlocked
      
      try {
        const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
        if (sid) {
          const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
          if (subscriptionRes.success && subscriptionRes.data?.[0]?.course_start_date) {
            const courseStartDate = subscriptionRes.data[0].course_start_date;
            unlockedCount = calculateUnlockedVideoIndex(courseStartDate);
            console.log('🔓 Unlocked videos count:', unlockedCount);
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not determine unlock status:', err);
      }
      
      const mappedSessions = lessons.map((lesson, index) => {
        const content = lesson.content?.[0];
        const imageSource = content?.image || lesson.image;
        
        // For Quarter 1 (id: 521), handle orientation video separately
        // Orientation (index 0) is always unlocked, Day videos start from index 1
        // For Quarter 2 (id: 790) and Quarter 3 (id: 772), all videos follow normal unlock logic
        let isLocked = false;
        const quarterIdStr = String(quarterId);
        
        if (quarterIdStr === '521') {
          // Quarter 1: Orientation (index 0) is always unlocked
          // Day videos (index 1+) are unlocked based on days passed (up to yesterday)
          if (index === 0) {
            // Orientation video - always unlocked
            isLocked = false;
          } else {
            // Day videos: index 1 = Day 1, index 2 = Day 2, etc.
            // unlockedCount represents number of Day videos unlocked (up to yesterday)
            // So if unlockedCount = 6, unlock indices 1-6 (Day 1-6)
            // Day 7 (index 7) should be locked
            isLocked = index > unlockedCount;
          }
        } else {
          // Quarter 2 (790) and Quarter 3 (772): Normal unlock logic (no orientation video)
          // unlockedCount represents number of videos unlocked (up to yesterday)
          // So if unlockedCount = 6, unlock indices 0-5 (Day 1-6)
          isLocked = index >= unlockedCount;
        }
        
        return {
          id: lesson.id,
          title: lesson.lesson_title,
          thumbnail: constructImageUrl(imageSource),
          videoUrl: content?.video_url || '',
          duration: lesson.duration || '',
          description: lesson.lesson_description || content?.class_description || '',
          requirement: lesson.requirements || content?.class_requirement || '',
          content,
          isLocked: isLocked,
          index: index
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

// UPDATE: Modify handleSessionClick to check if video is locked

const handleSessionClick = (session) => {
  if (session.isLocked) {
    alert('This video is locked. It will be unlocked after the live class.');
    return;
  }
  
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

// Session card lock/unlock overlay will be rendered inside the actual sessions.map below

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

  const fetchSubscribedChapters = async () => {
    try {
      const studentId = user?.id || userData?.id || userData?.student_id;
      const courseId = '82'; // Junior KG - Term 1 course ID
      
      console.log('🔍 Fetching subscribed chapters for student:', studentId, 'course:', courseId);
      // No-op: fetchSubscribedChapters only fetches the chapter IDs to find locked-unlocked state
      
      const response = await recordedClassesAPI.viewCourseInfo({
        id: courseId,
        student_id: studentId
      });

      console.log('📥 Subscribed chapters response:', response);

      if (response.success && response.raw?.data?.[0]?.chapters) {
        const chapterIds = response.raw.data[0].chapters.map(ch => ch.id.toString());
        console.log('✅ Subscribed chapter IDs:', chapterIds);
        setSubscribedChapters(chapterIds);
        return chapterIds;
      }
      
      console.log('⚠️ No chapters found in response');
      return [];
    } catch (error) {
      console.error('❌ Error fetching subscribed chapters:', error);
      return [];
    }
  };

  const loadQuarters = async () => {
    setLoading(true);
    try {
      const studentId = user?.id || userData?.id || userData?.student_id;
      const ageGroupId = userData?.age_group_id || user?.age_group_id || 47;
      
      console.log('📊 Loading quarters for student:', studentId);
      
      // Fetch subscribed chapters and selected terms first
      const subscribed = await fetchSubscribedChapters();
      // Also call check_student_subscription to know selected terms (term 1/2/3)
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
        console.warn('⚠️ Unable to determine chosen terms:', err);
      }
      
      // Determine Term 3 API call based on Case
      // Case 1 (only Q1): Buy Quarter 3 shows only "Term 3" plan -> terms: ['3']
      // Case 2 (Q1 & Q2): Buy Quarter 3 shows only "Term 3" plan -> terms: ['3']
      // Both cases use the same API call for Buy Quarter 3
      const term3ApiTerms = ['3'];
      console.log('🔍 [Recorded] Term 3 API terms:', term3ApiTerms, 'Case:', chosenTerms.term2 ? 'Case 2 (Q1+Q2 purchased)' : 'Case 1 (only Q1)');
      
      const [term1Response, term2Response, term2CoursesResponse, term3CoursesResponse, term3ChapterResponse] = await Promise.all([
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
        // Fetch Term 2 courses (Term 2 + Term 2 & 3)
        recordedClassesAPI.fetchTermsCourses({ 
          age_group_id: ageGroupId,
          terms: ['2,3', '2']
        }).catch(() => ({ success: false })),
        // Fetch Term 3 courses - Conditional based on Case
        recordedClassesAPI.fetchTermsCourses({ 
          age_group_id: ageGroupId,
          terms: term3ApiTerms
        }).catch(() => ({ success: false })),
        // Fetch Quarter 3 chapter data if Term 3 is purchased
        chosenTerms.term3 ? recordedClassesAPI.viewChapterLessonsInfo({ 
          course_chapter_id: '772',
          student_id: studentId,
          type: '0'
        }).catch(() => ({ success: false })) : Promise.resolve({ success: false })
      ]);

      const quartersList = [];

      // Quarter 1
      if (term1Response.success && term1Response.raw?.data?.[0]) {
        const chapterData = term1Response.raw.data[0];
        const isLocked = !(chosenTerms.term1 || subscribed.includes('521'));
        console.log('Quarter 1 - isLocked:', isLocked, 'subscribed:', subscribed);
        // If the user selected specific terms: if no term is selected show all as before;
        // if a term selection exists, we'll only add fields that match selected term(s)
        // actual filtering happens later in the function using chosenTerms
        quartersList.push({
          id: '521',
          title: chapterData.chapter_title || 'Quarter 1',
          image: constructImageUrl(chapterData.image),
          description: chapterData.chapter_description || '',
          isPurchasable: false,
          isLocked: isLocked
        });
      }

      // Quarter 2 - Check if Term 2 is purchased
      const term2CoursesData = term2CoursesResponse.raw?.data || term2CoursesResponse.data || [];
      if (term2Response.success && term2Response.raw?.data?.[0]) {
        const chapterData = term2Response.raw.data[0];
        // Check if Quarter 2 is subscribed/unlocked
        const isSubscribed = chosenTerms.term2 || subscribed.includes('790');
        
        // If Term 2 is purchased, show Quarter 2 as normal quarter (like Q1)
        if (isSubscribed) {
        // Check if previous quarters (Q1) are complete for sequential unlock
        let isSequentiallyUnlocked = true;
        let courseStartDate = null;
        try {
          const sid = user?.sid || userData?.sid || localStorage.getItem('sid') || sessionStorage.getItem('sid');
          if (sid) {
            const subscriptionRes = await subjectsAPI.checkStudentSubscription(sid);
            if (subscriptionRes.success && subscriptionRes.data?.[0]?.course_start_date) {
              courseStartDate = subscriptionRes.data[0].course_start_date;
                isSequentiallyUnlocked = await isPreviousQuartersComplete('790', courseStartDate, studentId);
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not check sequential unlock for Quarter 2:', err);
        }
        
          // Quarter 2 is locked if: previous quarters not complete
          const isLocked = !isSequentiallyUnlocked;
        console.log('Quarter 2 - isLocked:', isLocked, 'subscribed:', isSubscribed, 'sequentiallyUnlocked:', isSequentiallyUnlocked);
        quartersList.push({
          id: '790',
          title: chapterData.chapter_title || 'Quarter 2',
          image: constructImageUrl(chapterData.image),
          description: chapterData.chapter_description || '',
          isPurchasable: false,
          isLocked: isLocked
        });
        } else {
          // Term 2 not purchased - show Buy Quarter 2 option
          if (term2CoursesResponse.success && term2CoursesData.length > 0) {
            // Filter courses that include Term 2 (Term 2 or Term 2 & 3)
            const term2Plans = term2CoursesData.filter(course => {
              const courseTerms = (course.terms || '').toString();
              return courseTerms.includes('2');
            });
            
        quartersList.push({
              id: 'buy_q2',
              title: 'Buy Quarter 2',
              image: quarter2Image,
              description: term2Plans[0]?.description || term2Plans[0]?.course_detail || '',
              isPurchasable: true,
              isLocked: false,
              courseData: term2Plans.map(course => ({
          id: course.id,
                courseName: course.course_name || 'Quarter 2',
                tag: course.tag || '(3 months)',
                amount: course.amount || 0,
                fake_price: course.fake_price || course.amount || 0,
                discount: course.discount || 0,
                curriculum: course.curriculum || course.description || '',
                course_detail: course.course_detail || '',
                description: course.description || '',
                hands_on_activities: course.hands_on_activities || ''
              }))
            });
          }
        }
      }

      // Quarter 3 - Check if Term 3 is purchased
      const term3CoursesData = term3CoursesResponse.raw?.data || term3CoursesResponse.data || [];
      console.log('🔍 [Recorded] Term 3 check - term3:', chosenTerms.term3, 'term3CoursesResponse:', term3CoursesResponse.success, 'term3CoursesData:', term3CoursesData.length);
      
      // If Term 3 is purchased, show Quarter 3 as normal quarter (like Q1/Q2)
      if (chosenTerms.term3 && term3ChapterResponse.success && term3ChapterResponse.raw?.data?.[0]) {
        const chapterData = term3ChapterResponse.raw.data[0];
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
          console.warn('⚠️ Could not check sequential unlock for Quarter 3:', err);
        }
        
        // Quarter 3 is locked if: previous quarters not complete
        const isLocked = !isSequentiallyUnlocked;
        console.log('Quarter 3 - isLocked:', isLocked, 'term3:', chosenTerms.term3, 'sequentiallyUnlocked:', isSequentiallyUnlocked);
        
        quartersList.push({
          id: '772',
          title: chapterData.chapter_title || 'Quarter 3',
          image: constructImageUrl(chapterData.image),
          description: chapterData.chapter_description || '',
          isPurchasable: false,
          isLocked: isLocked
        });
      } else {
        // Term 3 not purchased - show Buy Quarter 3 option
        console.log('🔍 [Recorded] Term 3 NOT purchased - showing Buy Quarter 3 card');
        // Filter courses that include Term 3
        // Both Case 1 and Case 2: API fetches only ['3'], so show only "Term 3" plan
        const term3Plans = term3CoursesData.filter(course => {
          const courseTerms = (course.terms || '').toString();
          return courseTerms === '3';
        });
        console.log('🔍 [Recorded] Term 3 plans found:', term3Plans.length, term3Plans);
        
        // Always show Buy Quarter 3 card if Term 3 is not purchased
        if (term3Plans.length > 0) {
          quartersList.push({
            id: 'buy_q3',
          title: 'Buy Quarter 3',
          image: buyTerm3Image,
            description: term3Plans[0]?.description || term3Plans[0]?.course_detail || '',
          isPurchasable: true,
          isLocked: false,
            courseData: term3Plans.map(course => ({
              id: course.id,
              courseName: course.course_name || 'Quarter 3',
              tag: course.tag || '(3 months)',
              amount: course.amount || 0,
              fake_price: course.fake_price || course.amount || 0,
              discount: course.discount || 0,
              curriculum: course.curriculum || course.description || '',
            course_detail: course.course_detail || '',
            description: course.description || '',
            hands_on_activities: course.hands_on_activities || ''
            }))
          });
        } else {
          // Fallback: Show Buy Quarter 3 card even if API fails or no plans found
          quartersList.push({
            id: 'buy_q3',
            title: 'Buy Quarter 3',
            image: buyTerm3Image,
            description: '',
            isPurchasable: true,
            isLocked: false,
            courseData: []
        });
        }
      }

      // Filter quarters based on chosenTerms if any selection exists
      // Always show Quarter 2 as locked if Term 2 is not selected (don't hide it)
      const filteredQuarters = (() => {
        const hasSelection = chosenTerms.term1 || chosenTerms.term2;
        if (!hasSelection) return quartersList;
        return quartersList.filter(q => {
          // Quarter 1: Show only if Term 1 is selected
          if (q.id === '521' && chosenTerms.term1) return true;
          // Quarter 2: Always show (will be locked if Term 2 is not selected)
          if (q.id === '790') return true;
          // Quarter 3: Always show (will be locked if Term 3 is not purchased or previous quarters not complete)
          if (q.id === '772') return true;
          // Buy options (Quarter 2 and Quarter 3): Always show
          if (q.isPurchasable) return true;
          return false;
        });
      })();

      console.log('✅ Quarters loaded:', filteredQuarters, 'chosenTerms:', chosenTerms);
      setQuarters(filteredQuarters);
    } catch (error) {
      console.error('❌ Error fetching quarters:', error);
      setQuarters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuarterClick = (quarter) => {
    // Check if quarter is locked
    if (quarter.isLocked) {
      alert('This quarter is locked. Please subscribe to access the content.');
      return;
    }

    if (quarter.isPurchasable) {
      if (!quarter.courseData || (Array.isArray(quarter.courseData) && quarter.courseData.length === 0)) {
        alert('Plan details are not available. Please try again later.');
        return;
      }
      
      // Check if courseData is an array (multiple plans) or single object
      const isArray = Array.isArray(quarter.courseData);
      const plans = isArray ? quarter.courseData : [quarter.courseData];
      
      // Map plans to include parsed description sections
      const mappedPlans = plans.map(courseData => {
        const descriptionSections = parseDescriptionSections(courseData.description || courseData.curriculum || '');
        return {
          id: courseData.id,
          courseName: courseData.courseName || quarter.title || 'Quarter',
        tag: courseData.tag || '(3 months)',
        amount: courseData.amount || 0,
        fakePrice: courseData.fake_price || courseData.amount || 0,
          discount: courseData.discount || 0,
        image: quarter.image || null,
        curriculum: descriptionSections.curriculum || courseData.curriculum || courseData.description || '',
        activityBox: descriptionSections.activityBox || courseData.hands_on_activities || '',
        moreFromLearningPie: descriptionSections.moreFromLearningPie || courseData.course_detail || ''
        };
      });
      
      setPlanData(mappedPlans);
      setShowPlanSelection(true);
    } else {
      setSelectedQuarter(quarter);
      setSessions([]);
      loadQuarterSessions(quarter.id);
    }
  };

  // Duplicate simple handleSessionClick removed; keep the lock-aware version defined above

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
    const plans = Array.isArray(planData) ? planData : planData ? [planData] : [];
    
    return (
      <div className="p-8 min-h-screen bg-white relative">
        <button 
          className="recorded-back-button"
          onClick={handleBackClick}
        >
          Back
        </button>
        <h1 className="text-center text-[32px] font-bold text-[#333] mb-10">Select Plan</h1>
        <div className="plan-card-container flex flex-wrap justify-center gap-6 max-w-[1400px] mx-auto">
          {plans.length > 0 ? (
            plans.map((plan, index) => {
              // Determine card color based on plan (Term 2 & 3 = orange, Term 2/3 only = purple)
              const isTerm2And3 = plan.courseName?.includes('Term 2 & 3') || plan.courseName?.includes('Term 2 and 3');
              const cardColor = isTerm2And3 ? '#FF8C42' : '#9C27B0';
              const tagBgColor = isTerm2And3 ? '#FFE5D4' : '#E1BEE7';
              const tagTextColor = isTerm2And3 ? '#FF8C42' : '#9C27B0';
              
              return (
                <div key={plan.id || index} className="plan-card w-full md:w-[calc(50%-12px)] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-5 flex flex-col gap-[18px]">
              <div className="flex gap-3 items-start">
                    {plan.image ? (
                      <img src={plan.image} alt={plan.courseName} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                      <div className="w-20 h-20 rounded-lg flex-shrink-0" style={{ backgroundColor: cardColor }}></div>
                )}
                <div className="flex flex-col gap-1.5 flex-1">
                      <span className="inline-block py-1.5 px-3 rounded-md text-sm font-semibold w-fit" style={{ backgroundColor: tagBgColor, color: tagTextColor }}>
                        {plan.tag}
                  </span>
                      <h2 className="text-2xl font-bold text-[#333] m-0">{plan.courseName}</h2>
                  <div className="flex items-baseline gap-3">
                        <span className="text-[32px] font-bold" style={{ color: cardColor }}>₹{plan.amount}</span>
                        <span className="text-xl font-medium text-[#999] line-through">₹{plan.fakePrice}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">Curriculum</h3>
                    <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: plan.curriculum || 'No curriculum information available.' }} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">Activity Box Includes</h3>
                    <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: plan.activityBox || 'No activity box information available.' }} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#333] m-0">More from Learning Pie</h3>
                    <div className="text-base text-[#666] leading-relaxed m-0" dangerouslySetInnerHTML={{ __html: plan.moreFromLearningPie || 'No additional information available.' }} />
              </div>

              <button 
                    className="w-full text-white border-none py-4 px-6 rounded-lg text-lg font-bold cursor-pointer transition-all duration-300 mt-2.5 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]" 
                    style={{ backgroundColor: cardColor }}
                onClick={handleEnrollClick}
              >
                Enroll Now
              </button>
            </div>
              );
            })
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
              className={`quarter-card bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 flex flex-col border border-[#e0e0e0] min-h-full relative hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${
                quarter.isLocked ? 'opacity-60' : ''
              } ${quarter.isPurchasable ? 'purchasable' : ''}`}
              onClick={() => handleQuarterClick(quarter)}
            >
              {/* Lock Icon Overlay */}
              {quarter.isLocked && (
                <div className="absolute top-4 right-4 z-10 bg-white rounded-full p-3 shadow-lg">
                  <FaLock className="text-[#FF8C42] text-2xl" />
                </div>
              )}
              
              {/* Unlock Icon for unlocked quarters */}
              {!quarter.isLocked && !quarter.isPurchasable && (
                <div className="absolute top-4 right-4 z-10 bg-green-100 rounded-full p-3 shadow-md">
                  <FaUnlock className="text-green-600 text-2xl" />
                </div>
              )}

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

export default RecordedClasses;