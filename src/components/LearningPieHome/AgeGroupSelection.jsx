import React from 'react';
import ageGroupIcon1 from '../../assets/ageGroupIcon1.png';
import ageGroupIcon2 from '../../assets/ageGroupIcon2.png';
import ageGroupIcon3 from '../../assets/ageGroupIcon3.png';
import ageGroupIcon4 from '../../assets/ageGroupIcon4.png';

const AgeGroupSelection = ({ selectedAgeGroup, setSelectedAgeGroup }) => {
  return (
    <div className="w-full bg-white py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Select age group</h2>
        
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Play Group */}
          <div className="flex items-end gap-3 flex-1 min-w-[200px]">
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <img src={ageGroupIcon1} alt="Play Group" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-600 mb-1.5">Play Group</p>
              <button
                onClick={() => setSelectedAgeGroup('playgroup')}
                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedAgeGroup === 'playgroup'
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                1.5-2.5 Yrs
              </button>
            </div>
          </div>

          {/* Nursery */}
          <div className="flex items-end gap-3 flex-1 min-w-[200px]">
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <img src={ageGroupIcon2} alt="Nursery" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-600 mb-1.5">Nursery</p>
              <button
                onClick={() => setSelectedAgeGroup('nursery')}
                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedAgeGroup === 'nursery'
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                2.5-3.5 Yrs
              </button>
            </div>
          </div>

          {/* Jr. KG */}
          <div className="flex items-end gap-3 flex-1 min-w-[200px]">
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <img src={ageGroupIcon3} alt="Jr. KG" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-600 mb-1.5">Jr. KG</p>
              <button
                onClick={() => setSelectedAgeGroup('juniorKG')}
                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedAgeGroup === 'juniorKG'
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                3.5-4.5 Yrs
              </button>
            </div>
          </div>

          {/* Sr. KG */}
          <div className="flex items-end gap-3 flex-1 min-w-[200px]">
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <img src={ageGroupIcon4} alt="Sr. KG" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-600 mb-1.5">Sr. KG</p>
              <button
                onClick={() => setSelectedAgeGroup('seniorKG')}
                className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedAgeGroup === 'seniorKG'
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                4.5-6 Yrs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeGroupSelection;