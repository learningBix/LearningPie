import React, { useState } from 'react';
import logoPie from '../../assets/logo-pie.png';
import illustrationImg from '../../assets/illustration.png';

const BookFreeClassModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Phone submitted:', phone);
    // Handle OTP sending logic here
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-2xl font-bold z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Section - Welcome Message and Illustration */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-50 to-orange-100 p-8 md:p-12 flex flex-col justify-center items-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome to</h2>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">LearningPie</h2>
            </div>

            {/* Illustration */}
            <div className="w-full max-w-sm flex items-center justify-center">
              <img
                src={illustrationImg}
                alt="LearningPie Illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center md:justify-start">
              <img src={logoPie} alt="LearningPie" className="h-12 w-auto" />
            </div>

            {/* Heading */}
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-8 text-center md:text-left">
              Book Your Free Class
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                Enter Phone
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full border-b-2 border-gray-800 focus:border-orange-500 outline-none py-2 text-lg bg-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D2691E] hover:bg-[#B85C1A] text-white font-bold py-4 rounded-lg text-lg transition-colors"
              >
                Send OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFreeClassModal;