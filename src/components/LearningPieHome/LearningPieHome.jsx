import React, { useState } from 'react';
import Header from './Header';
import PromotionalBanner from './PromotionalBanner';
import DemoForm from './DemoForm';
import ProgramSection from './ProgramSection';
import AgeGroupSelection from './AgeGroupSelection';
import PricingCards from './PricingCards';
import WhatsAppIcon from './WhatsAppIcon';

const LearningPieHome = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    mobile: '',
    childName: '',
    program: ''
  });

  const [selectedAgeGroup, setSelectedAgeGroup] = useState('playgroup');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgramSelect = (program) => {
    setFormData(prev => ({
      ...prev,
      program: program
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="w-full bg-white">
      <Header onLoginClick={onLoginClick} />

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row">
        <PromotionalBanner />
        <DemoForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleProgramSelect={handleProgramSelect}
          handleSubmit={handleSubmit}
        />
      </main>

      <div id="programs">
        <ProgramSection />
      </div>

      <AgeGroupSelection 
        selectedAgeGroup={selectedAgeGroup}
        setSelectedAgeGroup={setSelectedAgeGroup}
      />

      <div id="pricing">
        <PricingCards selectedAgeGroup={selectedAgeGroup} />
      </div>

      <div id="review" className="w-full bg-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">Reviews</h2>
          <p className="text-gray-600">Reviews section coming soon...</p>
        </div>
      </div>

      <div id="blogs" className="w-full bg-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8">Blogs</h2>
          <p className="text-gray-600">Blogs section coming soon...</p>
        </div>
      </div>

      <WhatsAppIcon />
    </div>
  );
};

export default LearningPieHome;