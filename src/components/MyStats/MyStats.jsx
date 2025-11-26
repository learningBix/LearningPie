import React from 'react';
import './MyStats.css';

const MyStats = ({ statsData, onBack }) => {
  // Helper function to safely convert to number
  const getCount = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return isNaN(num) ? 0 : num;
  };

  const statsCards = [
    {
      id: 'live_class',
      title: 'Live Class',
      count: getCount(statsData?.live_class),
      color: '#1E3A8A', // Dark blue
      gradient: '#1E3A8A',
      textColor: '#FFFFFF'
    },
    {
      id: 'recorded',
      title: 'Recorded',
      count: getCount(statsData?.recorded_class),
      color: '#FEF3C7', // Light yellow/cream
      gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      textColor: '#92400E' // Dark text for light background
    },
    {
      id: 'diy_home',
      title: 'Diy Home',
      count: getCount(statsData?.robotics),
      color: '#DBEAFE', // Light blue
      gradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      textColor: '#1E40AF' // Dark text for light background
    },
    {
      id: 'rhymes',
      title: 'Rhymes',
      count: getCount(statsData?.rhymes),
      color: '#DC2626', // Red
      gradient: '#DC2626',
      textColor: '#FFFFFF'
    },
    {
      id: 'stories',
      title: 'Stories',
      count: getCount(statsData?.stories),
      color: '#EA580C', // Orange
      gradient: '#EA580C',
      textColor: '#FFFFFF'
    },
    {
      id: 'bonus',
      title: 'Bonus',
      count: getCount(statsData?.bonus),
      color: '#1E3A8A', // Dark blue
      gradient: '#1E3A8A',
      textColor: '#FFFFFF'
    }
  ];

  React.useEffect(() => {
    console.log('MyStats - Received statsData:', statsData);
    console.log('MyStats - Processed counts:', statsCards.map(card => ({ title: card.title, count: card.count })));
  }, [statsData]);

  return (
    <div className="my-stats-container">
      {/* Header */}
      <div className="my-stats-header">
        <button className="my-stats-back-btn" onClick={onBack}>
          ←
        </button>
        <div className="my-stats-title-wrapper">
          <span className="my-stats-rocket">🚀</span>
          <h1 className="my-stats-title">My Stats</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="my-stats-grid">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className="my-stats-card"
            style={{
              background: card.gradient,
              '--text-color': card.textColor || '#FFFFFF',
              '--count-color': card.textColor || '#FFFFFF'
            }}
          >
            <div className="my-stats-card-content">
              <h3 className="my-stats-card-title">{card.title}</h3>
              <div className="my-stats-card-count">{card.count.toLocaleString()}</div>
              <div className="my-stats-card-coins">
                <span className="coin-icon">🪙</span>
                <span>{card.count.toLocaleString()} coins</span>
              </div>
            </div>
            <div className="my-stats-card-illustration">
              <svg
                width="140"
                height="110"
                viewBox="0 0 140 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="laptop-illustration"
              >
                {/* Laptop base */}
                <rect x="15" y="35" width="70" height="45" rx="4" fill={card.id === 'recorded' || card.id === 'diy_home' ? 'rgba(74, 85, 104, 0.3)' : 'rgba(255,255,255,0.25)'}/>
                {/* Laptop screen */}
                <rect x="20" y="20" width="60" height="40" rx="3" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#FFFFFF'}/>
                {/* Screen content - pink/teal background */}
                <rect x="25" y="25" width="50" height="30" rx="2" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#FFFFFF' : '#EC4899'}/>
                {/* Bar charts on screen */}
                <rect x="30" y="45" width="6" height="8" rx="1" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#14B8A6'}/>
                <rect x="38" y="42" width="6" height="11" rx="1" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#14B8A6'}/>
                <rect x="46" y="40" width="6" height="13" rx="1" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#14B8A6'}/>
                {/* User profile icons */}
                <circle cx="58" cy="30" r="4" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#FFFFFF'}/>
                <circle cx="66" cy="30" r="4" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#FFFFFF'}/>
                {/* Keyboard */}
                <rect x="30" y="55" width="40" height="12" rx="2" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#2D3748' : '#C4B5FD'}/>
                {/* Phone - purple */}
                <rect x="90" y="15" width="22" height="38" rx="4" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#4A5568' : '#FFFFFF'}/>
                <rect x="92" y="17" width="18" height="28" rx="2" fill={card.id === 'recorded' || card.id === 'diy_home' ? '#FFFFFF' : '#9333EA'}/>
                {/* Connection line - dashed */}
                <line x1="80" y1="40" x2="90" y2="34" stroke={card.id === 'recorded' || card.id === 'diy_home' ? '#FFFFFF' : '#9333EA'} strokeWidth="2.5" strokeDasharray="5 5" opacity="0.8"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyStats;

