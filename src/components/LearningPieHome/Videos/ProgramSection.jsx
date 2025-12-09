import React from 'react';
import logoPie from '../../../assets/logo-pie.png';

const ProgramSection = () => {
  return (
    <section className="w-full bg-white py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            LearningPie@HOME online preschool program for kids
          </h2>
          <p className="text-base md:text-lg text-black">
            Complete Preschool Program for kids of age group 1.5-6 years
          </p>
        </div>

        {/* YouTube Video Section */}
        <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
          {/* Video Player Container */}
          <div className="relative w-full" style={{ height: '400px' }}>
            {/* Embedded YouTube Video */}
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Xeg7tnqpM98"
              title="LearningPie@Home Preschool Program For Kids Delivered At Home"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>

            {/* Video Title Overlay - Top Left */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-2 max-w-[60%]">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <img src={logoPie} alt="LearningPie" className="h-6 w-auto" />
              </div>
              {/* <h3 className="text-white text-xs md:text-sm font-bold drop-shadow-lg">
                LearningPie@Home Preschool Program For Kids Delivered At Home
              </h3> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;

