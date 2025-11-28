import React, { useState, useEffect } from 'react';
import './Assessments.css';
import logoPie from '../../../assets/logo-pie.png';
import { dashboardAPI } from '../../../services/apiService';
import { getStudentId } from '../../../utils/userUtils';

const Assessments = ({ onBack, user, assessmentId = 11 }) => {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(assessmentId);
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState('Month 1 Assessment - JKG');
  const [assessmentList, setAssessmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [skillCategories, setSkillCategories] = useState([]);
  
  // Map section_id to category colors and order
  const sectionMap = {
    1: { color: '#FF8C42', title: 'Language And Communication Skills' },
    2: { color: '#6B8E23', title: 'Physical Development' },
    3: { color: '#90EE90', title: 'Social And Emotional Development' },
    4: { color: '#4CAF50', title: 'Literacy Development' },
    5: { color: '#9B59B6', title: 'Mathematics' },
    6: { color: '#2196F3', title: 'Understanding The World' },
    7: { color: '#17A2B8', title: 'Expressive Arts And Design' }
  };
  
  // Default insights for each category
  const defaultInsights = {
    1: 'follows directions and is able to transition easily from one activity to the next.',
    2: 'has developed her motor skills efficiently and emergent writing.',
    3: 'is becoming comfortable with different family relations and friends.',
    4: 'has started with emergent writing and is becoming more comfortable with writing.',
    5: 'has started knowing different shapes and can count numbers.',
    6: 'enjoys listening to stories and loves to operate technology.',
    7: 'is consistently showing creativity in her work and is being imaginative.'
  };
  
  useEffect(() => {
    fetchAssessmentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedAssessmentId && assessmentList.length > 0) {
      fetchAssessmentData(selectedAssessmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssessmentId, assessmentList.length]);
  
  const fetchAssessmentList = async () => {
    try {
      const studentId = getStudentId(user);
      if (!studentId) {
        setError('Student ID not found');
        setLoading(false);
        return;
      }
      
      const response = await dashboardAPI.getStudentAssessmentList({
        student_id: studentId,
        assessment_id: '',
        status: '1',
        learning: '1'
      });
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setAssessmentList(response.data);
        
        // Set default selected assessment if available
        if (response.data.length > 0) {
          const firstAssessment = response.data[0];
          const newAssessmentId = firstAssessment.assessment_id;
          setSelectedAssessmentId(newAssessmentId);
          setSelectedAssessmentTitle(firstAssessment.assement_title || `Month ${firstAssessment.month} Assessment - JKG`);
        } else {
          // If no assessments found, use default assessmentId
          setSelectedAssessmentId(assessmentId);
        }
      } else {
        // If API call failed, use default assessmentId
        setSelectedAssessmentId(assessmentId);
      }
    } catch (err) {
      console.error('Error fetching assessment list:', err);
      // If list fetch fails, use default assessmentId
      setSelectedAssessmentId(assessmentId);
    }
  };

  const fetchAssessmentData = async (currentAssessmentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const studentId = getStudentId(user);
      if (!studentId) {
        setError('Student ID not found');
        setLoading(false);
        return;
      }
      
      // Find the selected assessment from the list to get teacher data
      const selectedAssessment = assessmentList.find(a => a.assessment_id === currentAssessmentId);
      
      const response = await dashboardAPI.fetchStudentAssessmentReport({
        assessment_id: currentAssessmentId,
        student_id: studentId
      });
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Calculate overall standing (average of all percentages)
        const totalPercent = response.data.reduce((sum, item) => sum + (item.percent || 0), 0);
        const overallStanding = Math.round(totalPercent / response.data.length);
        
        // Calculate peer group percentage for each section
        const calculatePeerGroup = (item) => {
          if (item.highest_equivalent && item.max_marks) {
            return Math.round((item.highest_equivalent / item.max_marks) * 100);
          }
          return 60; // Default fallback
        };
        
        // Map skill categories with teacher_reflection from API
        const mappedCategories = response.data
          .sort((a, b) => a.section_id - b.section_id)
          .map(item => {
            const sectionInfo = sectionMap[item.section_id] || { color: '#666', title: item.section_title || 'Unknown' };
            // Use teacher_reflection from API if available, otherwise use default
            const insight = item.teacher_reflection || `Your child ${user?.name || 'Shristi'} ${defaultInsights[item.section_id] || 'has shown progress in this area'}`;
            
            return {
              sectionId: item.section_id,
              title: sectionInfo.title,
              color: sectionInfo.color,
              score: item.percent || 0,
              peerGroup: calculatePeerGroup(item),
              insight: insight
            };
          });
        
        setSkillCategories(mappedCategories);
        
        // Set assessment data with teacher info from selected assessment
        setAssessmentData({
          term: selectedAssessment?.month,
          class: 'JKG',
          age: user?.age || '5 years',
          studentName: user?.name ,
          birthDate: user?.birth_date ,
          teacherName: selectedAssessment?.teacher_name || 'Harshita ma\'am',
          overallStanding: overallStanding,
          overallGrowth: overallStanding,
          teacherComment: selectedAssessment?.teacher_remarks || 'It has truly been a pleasure getting to know your child this month. Your child has made great progress across the curriculum in the beginning of the academic year.',
          score: selectedAssessment?.teacher_percent ? parseInt(selectedAssessment.teacher_percent) : overallStanding
        });
      } else {
        setError('No assessment data found');
      }
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError(err.message || 'Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStandingCategory = (score) => {
    if (score >= 80) return { letter: 'S', label: 'Secure', color: '#4CAF50' };
    if (score >= 60) return { letter: 'D', label: 'Developing', color: '#FF9800' };
    return { letter: 'E', label: 'Emerging', color: '#F44336' };
  };

  if (loading) {
    return (
      <div className="assessments-container">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="assessments-container">
        <div className="assessments-header">
          <div className="assessments-header-left">
            <button className="assessments-back-btn" onClick={onBack}>
              ←
            </button>
            <span className="assessments-header-title">Assessments</span>
          </div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#f44336' }}>{error || 'No assessment data available'}</p>
        </div>
      </div>
    );
  }

  const standing = getStandingCategory(assessmentData.overallStanding);

  return (
    <div className="assessments-container">
      {/* Header */}
      <div className="assessments-header">
        <div className="assessments-header-left">
          <button className="assessments-back-btn" onClick={onBack}>
            ←
          </button>
          <span className="assessments-header-title">Assessments</span>
        </div>
        <div className="assessments-header-right">
          <button className="assessments-print-btn" onClick={handlePrint}>
            Print
        </button>
          <select 
            className="assessments-dropdown"
            value={selectedAssessmentId}
            onChange={(e) => {
              const newAssessmentId = parseInt(e.target.value, 10);
              const selected = assessmentList.find(a => a.assessment_id === newAssessmentId);
              setSelectedAssessmentId(newAssessmentId);
              setSelectedAssessmentTitle(selected?.assement_title || `Month ${selected?.month} Assessment - JKG`);
            }}
          >
            {assessmentList.length > 0 ? (
              assessmentList.map((assessment) => (
                <option key={assessment.id} value={assessment.assessment_id}>
                  {assessment.assement_title || `Month ${assessment.month} Assessment - JKG`}
                </option>
              ))
            ) : (
              <option value={assessmentId}>Month 1 Assessment - JKG</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="assessments-content">
        {/* Wavy Top Edge */}
        <div className="assessments-wavy-top">
          <div className="assessments-logo-section">
            <img src={logoPie} alt="Learning@ie" className="assessments-logo" />
            <h1 className="assessments-sheet-title">Assessment Sheet (2021-22)</h1>
          </div>
        </div>

        {/* Student Information */}
        <div className="assessments-student-info">
          <div className="assessments-info-left">
            <div className="info-item">
              <span className="info-label">Term-</span>
              <span className="info-value">{assessmentData.term}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Class-</span>
              <span className="info-value">{assessmentData.class}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age-</span>
              <span className="info-value">{assessmentData.age}</span>
            </div>
          </div>
          <div className="assessments-info-right">
            <div className="info-item">
              <span className="info-label">Name of the child-</span>
              <span className="info-value">{assessmentData.studentName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Birth date-</span>
              <span className="info-value">{assessmentData.birthDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Name of the class teacher-</span>
              <span className="info-value">{assessmentData.teacherName}</span>
            </div>
          </div>
        </div>

        {/* Three Columns Section */}
        <div className="assessments-columns">
          {/* Overall Standing */}
          <div className="assessments-column">
            <h3 className="column-title">Overall Standing</h3>
            <div className="standing-gauge-container">
              <div className="standing-gauge">
                <svg className="gauge-svg" viewBox="0 0 200 200">
                  {/* Outer ring - vibrant green */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="18"
                  />
                  {/* Inner progress ring - lighter green */}
                  <circle
                    cx="100"
                    cy="100"
                    r="75"
                    fill="none"
                    stroke="#81C784"
                    strokeWidth="18"
                    strokeDasharray={`${(assessmentData.overallStanding / 100) * 471} 471`}
                    strokeDashoffset="117.75"
                    transform="rotate(-90 100 100)"
                    className="gauge-progress"
                  />
                </svg>
                <div className="gauge-text">
                  <div className="gauge-score">{standing.letter}-{assessmentData.overallStanding}%</div>
                  <div className="gauge-label">progress</div>
                </div>
              </div>
              <div className="standing-legend">
                <div className="legend-item">
                  <span className="legend-bullet" style={{ color: '#F44336' }}>•</span>
                  <span>E - Emerging</span>
                </div>
                <div className="legend-item">
                  <span className="legend-bullet" style={{ color: '#FF9800' }}>•</span>
                  <span>D - Developing</span>
                </div>
                <div className="legend-item">
                  <span className="legend-bullet" style={{ color: '#4CAF50' }}>•</span>
                  <span>S - Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Growth */}
          <div className="assessments-column">
            <h3 className="column-title">Overall growth</h3>
            <div className="growth-chart-container">
              <svg className="growth-chart" viewBox="0 0 300 220">
                {/* Y-axis */}
                <line x1="40" y1="20" x2="40" y2="180" stroke="#333" strokeWidth="2" />
                {/* X-axis */}
                <line x1="40" y1="180" x2="280" y2="180" stroke="#333" strokeWidth="2" />
                
                {/* Y-axis labels */}
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((val, idx) => {
                  const yPos = 180 - (idx * 18);
                  return (
                    <g key={val}>
                      <line x1="35" y1={yPos} x2="40" y2={yPos} stroke="#333" strokeWidth="1" />
                      <text x="30" y={yPos + 4} textAnchor="end" fontSize="12" fill="#666">{val}</text>
                    </g>
                  );
                })}
                
                {/* Growth line from 0 to current value */}
                <line
                  x1="40"
                  y1="180"
                  x2="160"
                  y2={180 - (assessmentData.overallGrowth / 90) * 160}
                  stroke="#2196F3"
                  strokeWidth="3"
                  className="growth-line"
                />
                
                {/* Data point */}
                <circle
                  cx="160"
                  cy={180 - (assessmentData.overallGrowth / 90) * 160}
                  r="5"
                  fill="#2196F3"
                />
                
                {/* X-axis label - positioned below the data point */}
                <text x="160" y="205" textAnchor="middle" fontSize="11" fill="#333" fontWeight="500">
                  {selectedAssessmentTitle}
                </text>
              </svg>
            </div>
          </div>

          {/* Teacher's Comment */}
          <div className="assessments-column">
            <h3 className="column-title">Teacher's comment</h3>
            <div className="teacher-comment-section">
              <p className="teacher-comment-text">{assessmentData.teacherComment}</p>
              <div className="teacher-signature">
                <span className="teacher-name">{assessmentData.teacherName}</span>
                <div className="score-bar-container">
                  <div className="score-bar-header">
                    <span className="score-bar-label">SCORE</span>
                    <span className="score-value">{assessmentData.score}%</span>
                  </div>
                  <div className="score-bar-wrapper">
                    <div 
                      className="score-bar-fill"
                      style={{ width: `${assessmentData.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Categories Grid */}
      <div className="skill-categories-section">
        <div className="skill-categories-grid">
          {skillCategories.map((category) => (
            <div key={category.sectionId} className="skill-category-card" style={{ '--category-color': category.color }}>
              <h3 className="skill-category-title">{category.title}</h3>
              <div className="skill-progress-section">
                <div className="skill-progress-item">
                  <div className="skill-progress-header">
                    <span className="skill-progress-label">SCORE</span>
                    <span className="skill-progress-value">{category.score}%</span>
                  </div>
                  <div className="skill-progress-bar-wrapper">
                    <div className="skill-progress-bar" style={{ width: `${category.score}%` }}></div>
                  </div>
                </div>
                <div className="skill-progress-item">
                  <div className="skill-progress-header">
                    <span className="skill-progress-label">PEER GROUP</span>
                    <span className="skill-progress-value">{category.peerGroup}%</span>
                  </div>
                  <div className="skill-progress-bar-wrapper">
                    <div className="skill-progress-bar" style={{ width: `${category.peerGroup}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="skill-insight-container">
                <span className="skill-insight-label">QUICK INSIDE:</span>
                <p className="skill-insight">{category.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessments;