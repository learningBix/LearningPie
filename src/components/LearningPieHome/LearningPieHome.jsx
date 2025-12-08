import React, { useState, useEffect } from 'react';
import Header from './Header';
import DemoForm from './DemoForm';
import ProgramSection from './ProgramSection';
import AgeGroupSelection from './AgeGroupSelection';
import WhyLearningPie from './WhyLearningPie';
import PricingCards from './PricingCards';
import WhatsAppIcon from './WhatsAppIcon';
import learningPieHomeImg from '../../assets/LearningPieHome.png';

const LearningPieHome = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    mobile: '',
    childName: '',
    program: ''
  });

  const [selectedAgeGroup, setSelectedAgeGroup] = useState('playgroup');

  // Scroll to pricing section when age group changes
  useEffect(() => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedAgeGroup]);

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

      {/* Main Content - Full Page Image with Overlay Form */}
      <main className="relative w-full h-[600px] lg:h-[calc(100vh-80px)] overflow-hidden">
        {/* Full Page Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={learningPieHomeImg}
            alt="LearningPie Home"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'left center' }}
          />
        </div>

        {/* Demo Form Overlay - Right Side */}
        <div className="absolute top-0 right-0 h-full w-full lg:w-[38%] flex items-center justify-end pr-1 md:pr-2 lg:pr-4 z-10">
          <DemoForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleProgramSelect={handleProgramSelect}
            handleSubmit={handleSubmit}
          />
        </div>
      </main>

      <div id="programs">
        <ProgramSection />
      </div>

      {/* Age Group Selection and Pricing Cards - Combined Section */}
      <div id="pricing" className="w-full bg-white">
        <AgeGroupSelection 
          selectedAgeGroup={selectedAgeGroup}
          setSelectedAgeGroup={setSelectedAgeGroup}
        />
        <PricingCards selectedAgeGroup={selectedAgeGroup} />
      </div>

      <WhyLearningPie />

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