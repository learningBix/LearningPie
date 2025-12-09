import React from 'react';
import logoPie from '../../assets/logo-pie.png';
import get1 from '../../assets/get-1.png';
import get2 from '../../assets/get-2.png';
import get3 from '../../assets/get-3.png';
import get4 from '../../assets/get-4.png';
import get5 from '../../assets/get-5.png';

const WhyLearningPie = ({ onEnrollClick }) => {
  const features = [
    {
      icon: <img src={get1} alt="Activity box" className="w-32 h-32 object-contain" />,
      text: "Multi-sensory and comprehensive Activity box for high-quality engagement."
    },
    {
      icon: <img src={get2} alt="Recorded sessions" className="w-32 h-32 object-contain" />,
      text: "Flexible Recorded sessions held by Early Education Experts"
    },
    {
      icon: <img src={get3} alt="Counsellor" className="w-32 h-32 object-contain" />,
      text: "Dedicated Counsellor To Cater To Your Child's Unique Needs"
    },
    {
      icon: <img src={get4} alt="Assessment report" className="w-32 h-32 object-contain" />,
      text: "Complete assessment report and certificate for priority admission in formal schools."
    },
    {
      icon: <img src={get5} alt="Add ons" className="w-32 h-32 object-contain" />,
      text: "Gratitude, Mindfulness, Excursions, Parenting seminars, Robotics and many more add ons."
    }
  ];

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            Why LearningPie@HOME?<img src={logoPie} alt="LearningPie" className="h-10 md:h-12 w-auto" />
          </h2>
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
          <button
            onClick={onEnrollClick}
            className="bg-[#ff6b35] text-white px-8 py-4 rounded-lg text-lg font-bold uppercase tracking-wide hover:bg-[#e55a2b] transition-colors shadow-lg"
          >
            ENROL YOUR CHILD NOW
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyLearningPie;

