import React from 'react';
import logoPie from '../../assets/logo-pie.png';
import loginImg from '../../assets/loginImage2.jpg';

const PromotionalBanner = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-[#ff6b35] to-[#ffd23f] relative p-8 md:p-12 flex flex-col justify-start overflow-hidden min-h-[600px] lg:min-h-screen">
      <div className="relative z-[2]">
        <div className="bg-[#ffd23f] px-6 md:px-8 py-3 rounded-md inline-block mb-6 shadow-md">
          <span className="text-2xl md:text-3xl font-black text-[#1a1a1a] uppercase tracking-wide leading-tight">Experience LearningPie@HOME</span>
        </div>
        <p className="text-white text-xl md:text-2xl font-semibold mb-8 drop-shadow-md">at the comfort and safety of your home!</p>
        
        <div className="my-8">
          <p className="text-white text-lg md:text-xl font-semibold mb-4 drop-shadow-md">Open For Registrations!</p>
          <div className="inline-block relative mt-2">
            <button className="bg-[#ffd23f] text-[#6b46c1] border-none px-6 md:px-10 py-4 font-extrabold text-base cursor-pointer shadow-lg relative inline-block transition-transform hover:scale-105" style={{ clipPath: 'polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}>
              ENROLL NOW
            </button>
          </div>
        </div>

        <div className="mt-8 text-white text-base font-medium drop-shadow-sm">
          <p>To Know More: Toll Free: 91-8010554400</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-[1] opacity-30">
        <div className="absolute top-[10%] right-[15%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-white/30"></div>
        <div className="absolute top-[20%] left-[10%] w-20 h-20 rounded-full border-2 border-white/50"></div>
        <div className="absolute top-[60%] right-[20%] w-24 h-24 rounded-full border-2 border-white/50"></div>
      </div>

      {/* Child and Product Box */}
      <div className="relative z-[2] flex items-end justify-start mt-12 pl-8 flex-col lg:flex-row lg:items-end">
        <div className="bg-[#4caf50] p-6 rounded-xl shadow-2xl max-w-[300px] z-[3] mb-4 lg:mb-0">
          <div className="bg-white p-4 rounded-lg text-center">
            <p className="text-sm text-gray-800 font-semibold mb-2">Active learning for little ones</p>
            <div className="my-2">
              <img src={logoPie} alt="LearningPie" className="h-10 w-auto mx-auto" />
            </div>
            <div className="h-30 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-lg mt-2 flex items-center justify-center text-[#4caf50] text-sm relative overflow-hidden">
              <span className="text-2xl opacity-70">🎈 🌳 👶</span>
            </div>
          </div>
        </div>
        <div className="w-[220px] h-[280px] rounded-xl -ml-10 z-[2] relative overflow-hidden shadow-lg lg:ml-[-40px] mt-4 lg:mt-0">
          <img src={loginImg} alt="Child learning" className="w-full h-full object-cover rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;

