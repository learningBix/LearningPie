import React from 'react';
import logoPie from '../../assets/logo-pie.png';

const Header = ({ onLoginClick }) => {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginButtonClick = (e) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <header className="bg-white px-4 md:px-8 py-4 shadow-md sticky top-0 z-[100]">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center">
          <img src={logoPie} alt="LearningPie" className="h-12 w-auto cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        </div>
        
        <nav className="hidden md:flex gap-8 ml-12">
          <a 
            href="#programs" 
            onClick={(e) => handleNavClick(e, 'programs')}
            className="text-gray-800 font-medium text-base hover:text-[#ff6b35] transition-colors no-underline cursor-pointer"
          >
            Programs
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')}
            className="text-gray-800 font-medium text-base hover:text-[#ff6b35] transition-colors no-underline cursor-pointer"
          >
            Pricing
          </a>
          <a 
            href="#review" 
            onClick={(e) => handleNavClick(e, 'review')}
            className="text-gray-800 font-medium text-base hover:text-[#ff6b35] transition-colors no-underline cursor-pointer"
          >
            Review
          </a>
          <a 
            href="#blogs" 
            onClick={(e) => handleNavClick(e, 'blogs')}
            className="text-gray-800 font-medium text-base hover:text-[#ff6b35] transition-colors no-underline cursor-pointer"
          >
            Blogs
          </a>
        </nav>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 text-[#ff6b35] font-semibold">
            <span className="text-xl">📞</span>
            <span className="text-base">91-8010554400</span>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#ff6b35] text-white border-none px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors text-[0.95rem] hover:bg-[#e55a2b]">Book a free class</button>
            <button 
              onClick={handleLoginButtonClick}
              className="bg-transparent text-[#ff6b35] border-2 border-[#ff6b35] px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all text-[0.95rem] hover:bg-[#ff6b35] hover:text-white"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;