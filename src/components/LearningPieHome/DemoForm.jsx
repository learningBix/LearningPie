import React from 'react';

const DemoForm = ({ formData, handleInputChange, handleProgramSelect, handleSubmit }) => {
  return (
    <div className="flex-1 bg-[#f8f9fa] p-8 md:p-12 flex items-center justify-center">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-[500px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Fill In Your Details To Book A FREE Demo Class</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="parentName"
            placeholder="Parent's Name"
            value={formData.parentName}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />
          
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />
          
          <input
            type="text"
            name="childName"
            placeholder="Child's Name"
            value={formData.childName}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />

          <div className="my-4">
            <p className="text-gray-800 mb-4 text-base">Program</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  formData.program === 'playgroup'
                    ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-[#ff6b35] hover:bg-[#fff5f2]'
                }`}
                onClick={() => handleProgramSelect('playgroup')}
              >
                Playgroup (1.5-2.5 Yrs)
              </button>
              <button
                type="button"
                className={`p-4 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  formData.program === 'nursery'
                    ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-[#ff6b35] hover:bg-[#fff5f2]'
                }`}
                onClick={() => handleProgramSelect('nursery')}
              >
                Nursery (2.5-3.5 Yrs)
              </button>
              <button
                type="button"
                className={`p-4 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  formData.program === 'juniorKG'
                    ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-[#ff6b35] hover:bg-[#fff5f2]'
                }`}
                onClick={() => handleProgramSelect('juniorKG')}
              >
                JuniorKG (3.5-4.5 Yrs)
              </button>
              <button
                type="button"
                className={`p-4 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  formData.program === 'seniorKG'
                    ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-[#ff6b35] hover:bg-[#fff5f2]'
                }`}
                onClick={() => handleProgramSelect('seniorKG')}
              >
                SeniorKG (4.5-6 yrs)
              </button>
            </div>
          </div>

          <button type="submit" className="bg-[#ff6b35] text-white border-none p-5 rounded-lg text-lg font-bold cursor-pointer transition-colors mt-4 uppercase tracking-wide hover:bg-[#e55a2b]">
            BOOK A FREE DEMO
          </button>
        </form>
      </div>
    </div>
  );
};

export default DemoForm;