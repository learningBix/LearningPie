import React from 'react';
import './MyCourses.css';

const MyCourses = () => {
  return (
    <div className="my-courses-container">
      <div className="courses-content">
        {/* Left Side - Letter */}
        <div className="letter-section">
          <div className="letter-header">
            <h3 className="letter-from">Dear Parents</h3>
          </div>
          
          <div className="letter-body">
            <p>
              At LearningPie, we believe in the power of curated behavioral science models 
              combined with PhD research on psychology to create a winning curriculum. 
              We call it <strong>"The LearningPie Way"</strong>.
            </p>
            
            <p>
              Our approach is designed to nurture your child's natural curiosity and help 
              them develop essential skills through engaging, interactive learning experiences. 
              Every course is carefully crafted to align with developmental milestones and 
              learning objectives.
            </p>
            
            <p>
              We encourage you to observe your child's growth as they progress through our 
              courses. Watch as they develop critical thinking skills, creativity, and a 
              genuine love for learning.
            </p>
            
            <p>
              Together, we can create a promising future and make curiosity a habit that 
              will serve your child throughout their educational journey and beyond.
            </p>
            
            <div className="letter-footer">
              <p className="letter-thanks">Thank You,</p>
              <p className="letter-regards">Kind Regards,</p>
              <p className="letter-signature">Neha</p>
              <p className="letter-name">Dr. Neha Agrawal</p>
              <p className="letter-company">LearningPie</p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default MyCourses;

