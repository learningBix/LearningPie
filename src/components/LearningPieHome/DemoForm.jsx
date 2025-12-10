import React, { useState, useEffect } from 'react';
import { ageGroupsAPI } from '../../services/apiService';

const DemoForm = ({ formData, handleInputChange, handleProgramSelect, handleSubmit, submitting = false }) => {
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        setLoading(true);
        const response = await ageGroupsAPI.getAgeGroupsDropdown({ learning: '1' });
        if (response.success && response.data) {
          // Sort by priority if available, otherwise by id
          const sorted = [...response.data].sort((a, b) => {
            if (a.priority && b.priority) {
              return a.priority - b.priority;
            }
            return a.id - b.id;
          });
          setAgeGroups(sorted);
        }
      } catch (error) {
        console.error('Error fetching age groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeGroups();
  }, []);

  // Map age group title to program value for backward compatibility
  const getProgramValue = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('play group') || titleLower.includes('playgroup')) {
      return 'playgroup';
    } else if (titleLower.includes('nursery')) {
      return 'nursery';
    } else if (titleLower.includes('jr.') || titleLower.includes('junior')) {
      return 'juniorKG';
    } else if (titleLower.includes('sr.') || titleLower.includes('senior')) {
      return 'seniorKG';
    }
    return titleLower.replace(/\s+/g, '').toLowerCase();
  };
  return (
    <div className="w-full max-w-[450px] flex items-center justify-center h-full py-4">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg w-full flex flex-col">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 text-center">Fill In Your Details To Book A FREE Demo Class</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="parentName"
            placeholder="Parent's Name"
            value={formData.parentName}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />

          <input
            type="text"
            name="childName"
            placeholder="Child's Name"
            value={formData.childName}
            onChange={handleInputChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-[#ff6b35]"
            required
          />

          <div className="my-2">
            <p className="text-gray-800 mb-2 text-sm">Program</p>
            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 border-2 border-gray-300 rounded-lg text-xs text-center text-gray-500">
                  Loading...
                </div>
                <div className="p-2.5 border-2 border-gray-300 rounded-lg text-xs text-center text-gray-500">
                  Loading...
                </div>
              </div>
            ) : ageGroups.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {ageGroups.map((ageGroup) => {
                  const programValue = getProgramValue(ageGroup.title);
                  const ageRange = `${ageGroup.age_from}-${ageGroup.age_to} Yrs`;
                  return (
                    <button
                      key={ageGroup.id}
                      type="button"
                      className={`p-2.5 border-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        formData.program === programValue
                          ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-[#ff6b35] hover:bg-[#fff5f2]'
                      }`}
                      onClick={() => handleProgramSelect(programValue)}
                    >
                      {ageGroup.title} ({ageRange})
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 border-2 border-gray-300 rounded-lg text-xs text-center text-gray-500">
                No age groups available. Please try again later.
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className={`bg-[#ff6b35] text-white border-none p-3 rounded-lg text-sm font-bold cursor-pointer transition-colors mt-2 uppercase tracking-wide hover:bg-[#e55a2b] ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'SUBMITTING...' : 'BOOK A FREE DEMO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DemoForm;