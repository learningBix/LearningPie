import React, { useState } from 'react';
import { BLOB_BASE_URL } from '../../../services/apiService';

const ChangeAvatar = ({ onBack, onSave, currentAvatar }) => {
  const [selectedGender, setSelectedGender] = useState('boy');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || null);

  // Avatar options for boys and girls
  // Basic avatar file names on blob storage
  const boyAvatarNames = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png','12.png'];
  const boyAvatars = boyAvatarNames.map(name => `${BLOB_BASE_URL.replace(/\/$/, '')}/avatar/boys/${name}`);

  const girlAvatarNames = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png','12.png'];
  const girlAvatars = girlAvatarNames.map(name => `${BLOB_BASE_URL.replace(/\/$/, '')}/avatar/girls/${name}`);

  const currentAvatars = selectedGender === 'boy' ? boyAvatars : girlAvatars;

  const handleSave = () => {
    if (selectedAvatar && onSave) {
      onSave(selectedAvatar);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors"
        >
          <span className="text-2xl">←</span>
          <span>Change avatar</span>
        </button>
        <button 
          onClick={handleSave}
          disabled={!selectedAvatar}
          className="px-8 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>

      {/* Gender Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Gender</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedGender('boy')}
            className={`w-24 h-24 rounded-lg border-2 transition-all ${
              selectedGender === 'boy' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center h-full text-4xl">
              👦
            </div>
          </button>
          <button
            onClick={() => setSelectedGender('girl')}
            className={`w-24 h-24 rounded-lg border-2 transition-all ${
              selectedGender === 'girl' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center h-full text-4xl">
              👧
            </div>
          </button>
        </div>
      </div>

      {/* Avatar Selection Box */}
      <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-3xl p-8 shadow-lg">
        <h3 className="text-white text-2xl font-semibold mb-6">Choose your avatar</h3>
        
        {/* Avatar Grid */}
        <div className="grid grid-cols-4 gap-6">
          {currentAvatars.map((avatar, index) => (
           <button
  key={index}
  onClick={() => setSelectedAvatar(avatar)}
  className={`aspect-square rounded-2xl overflow-hidden transition-all transform hover:scale-105 bg-white ${
    selectedAvatar === avatar
      ? 'bg-blue-100 ring-4 ring-blue-500 border-2 border-blue-600 scale-110 shadow-lg'
      : 'ring-2 ring-gray-300 border border-transparent'
  }`}
>
  <img 
    src={avatar} 
    alt={`avatar-${index}`} 
    className="w-full h-full object-contain" 
  />
</button>

          ))}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Select an avatar that represents you best
      </p>
    </div>
  );
};

export default ChangeAvatar;