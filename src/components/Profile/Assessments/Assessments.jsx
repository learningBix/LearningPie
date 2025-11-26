import React from 'react';
import './Assessments.css';

const Assessments = ({ onBack }) => {
  return (
    <div className="assessments-container">
      <div className="section-content">
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2 className="section-title">Assessments</h2>
        <div className="section-body">
          <p>Welcome to Assessments section.</p>
          <p>Content for this section will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Assessments;

