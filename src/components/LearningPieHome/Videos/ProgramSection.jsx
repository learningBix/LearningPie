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
        <div className="relative bg-white rounded-lg overflow-hidden shadow-lg mb-4">
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
              <h3 className="text-white text-xs md:text-sm font-bold drop-shadow-lg">
                LearningPie@Home Preschool Program For Kids Delivered At Home
              </h3>
            </div>

            {/* Copy Link Button - Top Right */}
            <button 
              className="absolute top-2 right-2 z-20 flex flex-col items-center gap-0.5 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors p-1.5 rounded"
              onClick={() => {
                navigator.clipboard.writeText('https://youtu.be/Xeg7tnqpM98');
                alert('Link copied to clipboard!');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
              </svg>
              <span className="text-[10px] text-white font-medium">Copy link</span>
            </button>

            {/* Overlay Text and Button - Bottom Left */}
            <div className="absolute bottom-14 left-2 z-20">
              <p className="text-gray-800 text-xs font-semibold mb-2 bg-yellow-300 px-2.5 py-1 rounded-lg inline-block">
                Does your child feel bored during the pandemic?
              </p>
              <div>
                <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-900 transition-colors">
                  MORE VIDEOS
                </button>
              </div>
            </div>
          </div>

          {/* Our Offerings Banner - Below Video */}
          <div className="bg-blue-600 text-white px-4 py-2 relative" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' }}>
            <p className="text-base font-semibold text-center">Our Offerings</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;

