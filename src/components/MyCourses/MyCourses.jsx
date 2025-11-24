import React, { useState } from 'react';
import './MyCourses.css';
import methodologyImage from '../../assets/Mmethodology.jpg';
import courseImage from '../../assets/coursedemo.png';
import signatureImage from '../../assets/Msignature.jpg';

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState('course');
  const [activeMonth, setActiveMonth] = useState('month3');

  return (
    <div className="my-courses-container">
      {/* Header with Clickable Navigation */}
      <div className="my-courses-header">
        <div className="header-titles">
          <span 
            className={`header-word ${activeTab === 'course' ? 'active' : ''}`}
            onClick={() => setActiveTab('course')}
          >
            Course
          </span>
          <span 
            className={`header-word ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </span>
          <span 
            className={`header-word ${activeTab === 'methodology' ? 'active' : ''}`}
            onClick={() => setActiveTab('methodology')}
          >
            Methodology
          </span>
          <span 
            className={`header-word ${activeTab === 'journey' ? 'active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            Journey
          </span>
        </div>
      </div>

      <div className="courses-content">
        {/* Course Tab */}
        {activeTab === 'course' && (
          <div className="tab-content course-tab">
            <div className="course-content-wrapper">
              {/* Left Side - Letter */}
              <div className="letter-section">
                <div className="letter-header">
                  <h3 className="letter-from">Dear Parents,</h3>
                </div>
                
                <div className="letter-body">
                  <p>
                  Welcome to LearningPie. We thank you for choosing us as your partner in enabling quality and measurable learning outcomes for your child.
                  </p>
                  
                  <p>
                  Our curated behavioral science models, coupled with the ever changing educational needs of the children, ensure that your child not only gets what they best deserve, but also get a controlled exposure to learning in ways not seen before.
                  </p>
                  
                  <p>
                    During my PhD research on psychology, I had the joy of working with young children in various age groups, across India. I was amazed to discover the opportunities available to us to help our children- who are the leaders for tomorrow- become more inquisitive by nature and problem solvers by design. It is often believed that the maximum learning a child develops is during the formative years of their social and educational environment. Selectively, if the right tools are used from the multitude of education curricula, a winning curriculum could be designed. Presenting- <strong>The LearningPie Way</strong>. Please see our methodology section to dive deeper into this unique curriculum.
                  </p>
                  
                  <p>
                    I would humbly request you to observe and share your child's growth during the course journey. It will surely help us think deeper and make the modules more enjoyable, without compromising on the learning outcomes.
                  </p>
                  
                  <p>
                    Let us create a promising future and make curiosity a habit in children with LearningPie.
                  </p>
                  
                  <div className="letter-footer">
                    <p className="letter-thanks">Thank You.</p>
                    <p className="letter-regards">Kind Regards,</p>
                    <div className="letter-signature">
                      <img 
                        src={signatureImage} 
                        alt="Neha Signature" 
                        className="signature-image"
                      />
                    </div>
                    <p className="letter-name">Dr. Neha Agrawal</p>
                    <p className="letter-company">LearningPie</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="course-image-section">
                <div className="course-image-container">
                  <img 
                    src={courseImage} 
                    alt="LearningPie Course" 
                    className="course-image"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="tab-content details-tab">
            {/* Month Navigation */}
            <div className="details-month-navigation">
              <span 
                className={`details-month-tab ${activeMonth === 'month1' ? 'active' : ''}`}
                onClick={() => setActiveMonth('month1')}
              >
                Month 1
              </span>
              <span 
                className={`details-month-tab ${activeMonth === 'month2' ? 'active' : ''}`}
                onClick={() => setActiveMonth('month2')}
              >
                Month 2
              </span>
              <span 
                className={`details-month-tab ${activeMonth === 'month3' ? 'active' : ''}`}
                onClick={() => setActiveMonth('month3')}
              >
                Month 3
              </span>
            </div>
            
            {/* Month Content */}
            <div className="details-month-content">
              {activeMonth === 'month1' && (
                <div className="month-content-wrapper">
                  <p>Month 1 course details will be displayed here.</p>
                </div>
              )}
              {activeMonth === 'month2' && (
                <div className="month-content-wrapper">
                  <p>Month 2 course details will be displayed here.</p>
                </div>
              )}
              {activeMonth === 'month3' && (
                <div className="month-content-wrapper">
                  <p>Month 3 course details will be displayed here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Methodology Tab */}
        {activeTab === 'methodology' && (
          <div className="tab-content methodology-tab">
            <div className="methodology-image-container">
              <img 
                src={methodologyImage} 
                alt="LearningPie Methodology" 
                className="methodology-image"
              />
            </div>
          </div>
        )}

        {/* Journey Tab */}
        {activeTab === 'journey' && (
          <div className="tab-content journey-tab">
            <div className="journey-timeline">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((month) => {
                const isUnlocked = month <= 6;
                return (
                  <div key={month} className="journey-month">
                    {/* Status Box */}
                    <div className={`journey-status-box ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      <div className="journey-padlock">
                        {isUnlocked ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M9 10L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="journey-status-text">
                        {isUnlocked ? (
                          <span className="journey-click-text">Click To View</span>
                        ) : (
                          <>
                            <span className="journey-renew-text">Renew</span>
                            <span className="journey-unlock-text">To Unlock</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Dashed Line */}
                    <div className="journey-line"></div>
                    
                    {/* Month Label */}
                    <div className="journey-month-label">Month {month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

