import React, { useState } from 'react';
import logoPie from '../../assets/logo-pie.png'; // IMPORTANT
import PromotionalBanner from './PromotionalBanner';
import DemoForm from './DemoForm';
import ProgramSection from './Videos/ProgramSection';
import AgeGroupSelection from './AgeGroupSelection';
import PricingCards from './PricingCard/PricingCards';
import WhatsAppIcon from './WhatsAppIcon';

// ================== HEADER COMPONENT HERE ====================
const Header = ({ onLoginClick }) => {
  const scrollToSection = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  

  return (
<header className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
            <img src={logoPie} alt="LearningPie" className="h-12 w-auto" />
          </div>

          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('hero')} className="text-gray-700 hover:text-orange-500 font-medium">Home</button>
            <button onClick={() => scrollToSection('description')} className="text-gray-700 hover:text-orange-500 font-medium">About</button>
            <button onClick={() => scrollToSection('offer')} className="text-gray-700 hover:text-orange-500 font-medium">Programs</button>
            <button onClick={() => scrollToSection('feedback')} className="text-gray-700 hover:text-orange-500 font-medium">Testimonials</button>
            <button onClick={() => scrollToSection('blogs')} className="text-gray-700 hover:text-orange-500 font-medium">Blogs</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden sm:flex text-orange-500 font-medium" onClick={() => window.location.href = 'tel:91-8010554400'}>
              📞 91-8010554400
            </button>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full" onClick={() => scrollToSection('bookdemo')}>
              Book a Free Class
            </button>
            <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full" onClick={onLoginClick}>
              Login
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
// =============================================================


const LearningPieHome = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    mobile: '',
    childName: '',
    program: ''
  });

  const [selectedAgeGroup, setSelectedAgeGroup] = useState('playgroup');

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleProgramSelect = (program) => setFormData(prev => ({ ...prev, program }));
  const handleSubmit = (e) => { e.preventDefault(); console.log('Form submitted:', formData); };

  return (
    <div className="w-full bg-white pt-24">

      <Header onLoginClick={onLoginClick} />

      {/* Hero */}
      <section id="hero">
        <main className="flex flex-col lg:flex-row">
          <PromotionalBanner />
          <div id="bookdemo">
            <DemoForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleProgramSelect={handleProgramSelect}
              handleSubmit={handleSubmit}
            />
          </div>
        </main>
      </section>

      {/* About */}
      <section id="description" className="py-16">
        <AgeGroupSelection selectedAgeGroup={selectedAgeGroup} setSelectedAgeGroup={setSelectedAgeGroup} />
      </section>

      {/* Programs */}
      <section id="offer">
        <ProgramSection />
      </section>

      {/* Pricing */}
      <section id="pricing">
        <PricingCards selectedAgeGroup={selectedAgeGroup} />
      </section>

      {/* Testimonials */}
      <section id="feedback" className="py-12 text-center">Reviews section coming soon...</section>

      {/* Blogs */}
      <section id="blogs" className="bg-gray-100 py-12 text-center">Blogs section coming soon...</section>


      <footer className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
        {/* Wave Design */}
        <div className="relative w-full">
          <svg className="w-full h-24" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50C240 20 480 80 720 50C960 20 1200 80 1440 50V100H0V50Z" fill="#FFB347" opacity="0.5"/>
            <path d="M0 70C240 100 480 40 720 70C960 100 1200 40 1440 70V100H0V70Z" fill="#FFA500" opacity="0.3"/>
          </svg>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Our Specialities */}
            <div>
              <h3 className="text-xl font-bold mb-4">Our Specialities</h3>
              <ul className="space-y-2 text-sm">
                <li>360 degree excursions.</li>
                <li>Robotics, STEM & DIY sessions.</li>
                <li>Parenting Seminars & Counselling Sessions.</li>
                <li>Gratitude & Mindfulness Sessions for Kids.</li>
              </ul>
            </div>

            {/* We Accept */}
            <div>
              <h3 className="text-xl font-bold mb-4">We Accept</h3>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">VISA</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">UPI</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">RuPay</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">Maestro</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">Diners</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">MasterCard</span>
                <span className="bg-white text-orange-500 px-3 py-1 rounded text-xs font-semibold">Amex</span>
              </div>
            </div>

            {/* Important Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Important Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#contact" className="hover:underline">Contact us</a></li>
                <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:underline">Terms & Conditions</a></li>
                <li><a href="#blogs" className="hover:underline">Blogs</a></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4 text-2xl">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500">f</div>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500">𝕏</div>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500">in</div>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500">▶</div>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500">📷</div>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-orange-400 mt-8 pt-6 text-center text-sm">
            <p className="font-semibold mb-2">XAP EDUBOTS TECHNOLOGIES PRIVATE LIMITED</p>
            <p className="text-xs opacity-90">
              Plot No. 4, Bhaskar Enclave, Near OTS Chaurahan, JLN Marg, Jaipur, Rajasthan, 302017 | GST NO: 08AAACX2488E1Z7
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppIcon />
    </div>
  );
};

export default LearningPieHome;
