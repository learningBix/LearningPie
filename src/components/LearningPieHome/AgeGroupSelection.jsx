import React from 'react';

const AgeGroupSelection = ({ selectedAgeGroup, setSelectedAgeGroup }) => {
  return (
    <div className="w-full bg-white py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Select age group</h2>
        
        <div className="flex flex-wrap gap-4 justify-between">
          {/* Play Group */}
          <div className="flex items-end gap-3 flex-1 min-w-[200px]">
            <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="#87CEEB"/>
                <circle cx="32" cy="32" r="4" fill="#654321"/>
                <circle cx="48" cy="32" r="4" fill="#654321"/>
                <path d="M32 42 Q40 48 48 42" stroke="#654321" strokeWidth="2.5" fill="none"/>
                <rect x="25" y="48" width="30" height="20" rx="3" fill="#FF0000"/>
                <rect x="18" y="52" width="14" height="12" rx="2" fill="#00FF00"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1.5">Play Group</p>
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
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="#87CEEB"/>
                <circle cx="32" cy="32" r="4" fill="#654321"/>
                <circle cx="48" cy="32" r="4" fill="#654321"/>
                <path d="M32 42 Q40 48 48 42" stroke="#654321" strokeWidth="2.5" fill="none"/>
                <rect x="25" y="48" width="30" height="20" rx="3" fill="#87CEEB"/>
                <rect x="22" y="50" width="36" height="16" rx="2" fill="#0000FF"/>
                <rect x="18" y="52" width="12" height="14" rx="2" fill="#87CEEB"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1.5">Nursery</p>
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
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="#FFD700"/>
                <circle cx="32" cy="32" r="4" fill="#654321"/>
                <circle cx="48" cy="32" r="4" fill="#654321"/>
                <path d="M32 42 Q40 48 48 42" stroke="#654321" strokeWidth="2.5" fill="none"/>
                <rect x="25" y="48" width="30" height="20" rx="3" fill="#87CEEB"/>
                <rect x="22" y="47" width="36" height="18" rx="2" fill="#FF0000"/>
                <rect x="28" y="52" width="24" height="12" rx="2" fill="#FFD700"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1.5">Jr. KG</p>
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
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="#FFD700"/>
                <circle cx="32" cy="32" r="4" fill="#D2B48C"/>
                <circle cx="48" cy="32" r="4" fill="#D2B48C"/>
                <path d="M32 42 Q40 48 48 42" stroke="#654321" strokeWidth="2.5" fill="none"/>
                <rect x="25" y="48" width="30" height="20" rx="3" fill="#FFC0CB"/>
                <rect x="22" y="50" width="36" height="16" rx="2" fill="#0000FF"/>
                <rect x="18" y="52" width="12" height="14" rx="2" fill="#FFD700"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1.5">Sr. KG</p>
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