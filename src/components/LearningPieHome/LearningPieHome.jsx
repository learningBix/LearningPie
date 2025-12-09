import React, { useState, useEffect } from 'react';
import logoPie from '../../assets/logo-pie.png';
import DemoForm from './DemoForm';
import ProgramSection from './Videos/ProgramSection';
import AgeGroupSelection from './AgeGroupSelection';
import WhyLearningPie from './WhyLearningPie';
import PricingCards from './PricingCard/PricingCards';
import Description from './Facs/Description';
import ContactForm from './QueryForm/ContactForm';
import TestimonialsSection from './Testimonials/Testimonials';
import LearningCurriculum from './LearningCurriculum/LearningCurriculum';
import WhatsAppIcon from './WhatsAppIcon';
import BookFreeClassModal from './BookFreeClassModal';
import learningPieHomeImg from '../../assets/LearningPieHome.png';
import pieFooterWave from '../../assets/piefooterwave.jpg';
import weAcceptPart1 from '../../assets/weacceptpart1.png';
import weAcceptPart2 from '../../assets/weacceptpart2.png';

// ================== HEADER COMPONENT HERE ====================
const Header = ({ onLoginClick, onBookFreeClassClick }) => {
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
            <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-orange-500 font-medium">Pricing</button>
            <button onClick={() => scrollToSection('what-will-learn')} className="text-gray-700 hover:text-orange-500 font-medium">Programs</button>
            <button onClick={() => scrollToSection('feedback')} className="text-gray-700 hover:text-orange-500 font-medium">Review</button>
            <button onClick={() => scrollToSection('blogs')} className="text-gray-700 hover:text-orange-500 font-medium">Blogs</button>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="hidden sm:flex text-orange-500 font-medium" onClick={() => window.location.href = 'tel:91-8010554400'}>
              📞 91-8010554400
            </button>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-full" onClick={onBookFreeClassClick}>
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
  const [showBookFreeClassModal, setShowBookFreeClassModal] = useState(false);

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
    <div className="w-full bg-white pt-24">

      <Header onLoginClick={onLoginClick} onBookFreeClassClick={() => setShowBookFreeClassModal(true)} />

      {/* Main Content - Full Page Image with Overlay Form */}
      <main id="hero" className="relative w-full h-[600px] lg:h-[calc(100vh-80px)] overflow-hidden">
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
        <div id="bookdemo" className="absolute top-0 right-0 h-full w-full lg:w-[38%] flex items-center justify-end pr-1 md:pr-2 lg:pr-4 z-10">
          <DemoForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleProgramSelect={handleProgramSelect}
            handleSubmit={handleSubmit}
          />
        </div>
      </main>

      {/* About */}
      <section id="description" className="py-16">
        {/* About content can go here if needed */}
      </section>

      {/* Programs */}
      <section id="offer">
        <ProgramSection />
      </section>

      {/* Age Group Selection - Right below YouTube video section */}
      <section className="py-8">
        <AgeGroupSelection selectedAgeGroup={selectedAgeGroup} setSelectedAgeGroup={setSelectedAgeGroup} />
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full bg-white">
        <PricingCards selectedAgeGroup={selectedAgeGroup} />
      </section>

      <WhyLearningPie onEnrollClick={() => setShowBookFreeClassModal(true)} />

      {/* Blogs */}
      <section id="blogs" className="w-full bg-gray-50 py-12 px-4 md:px-8">
        <LearningCurriculum />
      </section>

      {/* Testimonials */}
      <section id="feedback" className="w-full bg-white py-12 px-4 md:px-8">
        <TestimonialsSection />
      </section>

      <ContactForm />

      {/* FAQ Section */}
      <section id="faqs" className="w-full bg-white py-12">
        <Description />
      </section>

      <div className="w-full">
        <img src={pieFooterWave} alt="Footer Wave" className="w-full h-auto" />
      </div>

      <footer className="bg-[linear-gradient(to_bottom_right,#e76f1a,#fc8734)] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">

            {/* Our Specialities */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4">Our Specialities</h3>
              <ul className="space-y-2 text-sm text-left md:text-center">
                <li>360 degree excursions.</li>
                <li>Robotics, STEM & DIY sessions.</li>
                <li>Parenting Seminars & Counselling Sessions.</li>
                <li>Gratitude & Mindfulness Sessions for Kids.</li>
              </ul>
            </div>

            {/* We Accept */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-center">We Accept</h3>
              <div className="space-y-3">
                <img
                  src={weAcceptPart1}
                  alt="Payment Methods - VISA, UPI, RuPay"
                  className="w-full h-auto"
                />
                <img
                  src={weAcceptPart2}
                  alt="Payment Methods - Maestro, Diners, MasterCard, Amex"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Important Links */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4">Important Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#contact" className="hover:underline">Contact us</a></li>
                <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:underline">Terms & Conditions</a></li>
                <li><a href="#blogs" className="hover:underline">Blogs</a></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-4 text-2xl">

                <a href="https://www.facebook.com/learningpiepreschool" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">f</div>
                </a>

                <a href="https://x.com/learningpie1" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">𝕏</div>
                </a>

                <a href="https://www.linkedin.com/company/learningpie/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">in</div>
                </a>

                <a href="https://www.youtube.com/channel/UCA7Wdl0Nk5bDNSHtSsd1qVQ" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">▶</div>
                </a>

                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold">📷</div>
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

      {/* Book Free Class Modal */}
      <BookFreeClassModal
        isOpen={showBookFreeClassModal}
        onClose={() => setShowBookFreeClassModal(false)}
      />
    </div>
  );
};

export default LearningPieHome;