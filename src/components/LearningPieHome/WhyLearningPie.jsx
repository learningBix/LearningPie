import React from 'react';
import logoPie from '../../assets/logo-pie.png';

const WhyLearningPie = () => {
  const features = [
    {
      icon: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#FFE082"/>
          <circle cx="45" cy="45" r="8" fill="#8B4513"/>
          <circle cx="75" cy="45" r="8" fill="#8B4513"/>
          <path d="M45 60 Q60 70 75 60" stroke="#8B4513" strokeWidth="3" fill="none"/>
          <rect x="35" y="70" width="50" height="30" rx="5" fill="#FF6B6B"/>
          <path d="M50 75 L55 85 L60 80 L65 85 L70 75" stroke="#FFD700" strokeWidth="2" fill="none"/>
          <circle cx="60" cy="50" r="15" fill="#FFB74D"/>
          <rect x="52" y="72" width="16" height="8" rx="2" fill="#4CAF50"/>
        </svg>
      ),
      text: "Multi-sensory and comprehensive Activity box for high-quality engagement."
    },
    {
      icon: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#E3F2FD"/>
          <circle cx="45" cy="45" r="8" fill="#8B4513"/>
          <circle cx="75" cy="45" r="8" fill="#8B4513"/>
          <path d="M45 60 Q60 70 75 60" stroke="#8B4513" strokeWidth="3" fill="none"/>
          <rect x="30" y="70" width="60" height="30" rx="5" fill="#2196F3"/>
          <rect x="35" y="75" width="12" height="12" rx="2" fill="#FFC107"/>
          <rect x="50" y="75" width="12" height="12" rx="2" fill="#4CAF50"/>
          <rect x="65" y="75" width="12" height="12" rx="2" fill="#F44336"/>
          <rect x="80" y="75" width="12" height="12" rx="2" fill="#9C27B0"/>
        </svg>
      ),
      text: "Flexible Recorded sessions held by Early Education Experts"
    },
    {
      icon: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#FFF3E0"/>
          <circle cx="45" cy="45" r="8" fill="#8B4513"/>
          <circle cx="75" cy="45" r="8" fill="#8B4513"/>
          <path d="M45 60 Q60 70 75 60" stroke="#8B4513" strokeWidth="3" fill="none"/>
          <rect x="30" y="70" width="60" height="30" rx="5" fill="#FF9800"/>
          <rect x="35" y="75" width="50" height="20" rx="3" fill="#FFC107"/>
          <line x1="40" y1="82" x2="80" y2="82" stroke="#FF6B35" strokeWidth="2"/>
          <line x1="40" y1="88" x2="80" y2="88" stroke="#FF6B35" strokeWidth="2"/>
        </svg>
      ),
      text: "Dedicated Counsellor To Cater To Your Child's Unique Needs"
    },
    {
      icon: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#F3E5F5"/>
          <circle cx="50" cy="50" r="8" fill="#8B4513"/>
          <circle cx="70" cy="50" r="8" fill="#8B4513"/>
          <path d="M50 60 Q60 68 70 60" stroke="#8B4513" strokeWidth="3" fill="none"/>
          <rect x="30" y="70" width="60" height="30" rx="5" fill="#E91E63"/>
          <rect x="35" y="75" width="20" height="20" rx="2" fill="#9C27B0"/>
          <rect x="58" y="75" width="28" height="20" rx="2" fill="#FFFFFF"/>
          <line x1="60" y1="80" x2="84" y2="80" stroke="#333" strokeWidth="1"/>
          <line x1="60" y1="85" x2="84" y2="85" stroke="#333" strokeWidth="1"/>
          <line x1="60" y1="90" x2="84" y2="90" stroke="#333" strokeWidth="1"/>
        </svg>
      ),
      text: "Complete assessment report and certificate for priority admission in formal schools."
    },
    {
      icon: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#E8F5E9"/>
          <circle cx="50" cy="50" r="8" fill="#8B4513"/>
          <circle cx="70" cy="50" r="8" fill="#8B4513"/>
          <path d="M50 60 Q60 68 70 60" stroke="#8B4513" strokeWidth="3" fill="none"/>
          <rect x="30" y="70" width="60" height="30" rx="5" fill="#4CAF50"/>
          <polygon points="50,75 70,75 60,90" fill="#FFC107"/>
          <circle cx="40" cy="82" r="5" fill="#FF6B35"/>
          <circle cx="80" cy="82" r="5" fill="#2196F3"/>
          <rect x="55" y="85" width="10" height="10" rx="2" fill="#9C27B0"/>
        </svg>
      ),
      text: "Gratitude, Mindfulness, Excursions, Parenting seminars, Robotics and many more add ons."
    }
  ];

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why LearningPie@HOME?
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl md:text-4xl font-bold text-green-600">Learning</span>
            <span className="text-3xl md:text-4xl font-bold text-orange-500">Pie</span>
            <span className="text-3xl md:text-4xl">🍭</span>
          </div>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            We are different from others as we are just not raising higher IQ's, but stronger EQ's and SQ's too!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Enrol Button */}
        <div className="flex justify-center">
          <button className="bg-[#ff6b35] text-white px-8 py-4 rounded-lg text-lg font-bold uppercase tracking-wide hover:bg-[#e55a2b] transition-colors shadow-lg">
            ENROL YOUR CHILD NOW
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyLearningPie;

