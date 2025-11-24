import React, { useState } from 'react';
import './ParentSection.css';
import artCraftImage from '../../assets/art-craft-activity.jpg';
import developmentImage from '../../assets/DevelopmentActivites.jpg';
import gamesImage from '../../assets/Games.jpg';
import puzzlesImage from '../../assets/Puzzles.jpg';
import musicMovementImage from '../../assets/MusicandMovement.png';
import explorationImage from '../../assets/Exploration.jpg';
import storiesImage from '../../assets/Stories.png';

// Default subjects with SVG-like icons and colors
const defaultSubjects = [
    {
      id: 1,
      title: 'LANGUAGE AND READING',
      iconType: 'monitor-abc',
      color: '#17A2B8',
      description: 'Language Development is the most crucial part of Child development. It supports the child\'s ability to communicate. It also helps to express and understand feelings, think and learn, solve problems, develop and maintain relationships.'
    },
    {
      id: 2,
      title: 'MATHEMATICS',
      iconType: 'monitor-numbers',
      color: '#8BC34A',
      description: 'Mathematics helps children develop logical thinking, problem-solving skills, and analytical abilities. It forms the foundation for understanding patterns, measurements, and numerical relationships in everyday life.'
    },
    {
      id: 3,
      title: 'GENERAL & SOCIAL AWARENESS',
      iconType: 'handshake-globe',
      color: '#2196F3',
      description: 'Social awareness helps children understand their environment, community, and the world around them. It develops empathy, cultural understanding, and social skills necessary for positive interactions.'
    },
    {
      id: 4,
      title: 'STEAM LEARNING',
      iconType: 'atom-stem',
      color: '#F44336',
      description: 'STEAM (Science, Technology, Engineering, Arts, Mathematics) learning integrates multiple disciplines to foster creativity, innovation, and critical thinking. It prepares children for future challenges through hands-on exploration.'
    },
    {
      id: 5,
      title: 'ART & COLORS',
      iconType: 'palette-brush',
      color: '#9C27B0',
      description: 'Art education enhances creativity, self-expression, and fine motor skills. Working with colors, shapes, and different mediums helps children develop visual thinking and aesthetic appreciation.'
    },
    {
      id: 6,
      title: 'MUSIC & MOVEMENT/EXERCISE',
      iconType: 'music-note',
      color: '#FFC107',
      description: 'Music and movement activities promote physical development, coordination, rhythm, and auditory skills. They also support emotional expression and enhance cognitive development through structured play.'
    }
  ];

// Default activities data
const defaultActivities = [
    {
      category: 'MUSIC & MOVEMENT',
      color: '#FFC107',
      activities: [
        'Thankyou prayer',
        'Om chanting',
        'Music & Movement Activity',
        'Dancing session by expert',
        'a, b, c, d, e phonics'
      ]
    },
    {
      category: 'GAMES',
      color: '#42A5F5',
      activities: [
        'Small letter \'a\' practice-toy way',
        'Spelling board',
        'Gratitude game',
        'Musical Instrument making',
        'Humpty Dumpty Game',
        'Snake and Ladder game',
        'Symbolic play activity',
        'Maze solving'
      ]
    },
    {
      category: 'STORIES',
      color: '#FFA726',
      activities: [
        'Story on shapes',
        'Story narration of all the letters',
        'Lazy Donkey story',
        'Letter d phonic story',
        'Save Water story',
        'Hungry Caterpillar story',
        'Krishna Birth Story',
        'Selfish Alligator',
        'Bob the Builder',
        'Akbar and Birble'
      ]
    },
    {
      category: 'PUZZLES',
      color: '#EC407A',
      activities: [
        '3 piece wooden puzzle of an Alligator',
        'Fruits shadow worksheet',
        'Puzzles',
        'vegetable shape matching worksheet',
        'Shape matching and pasting',
        '3 piece puzzle',
        'Stacking cube',
        'House worksheet - interlocking 3d',
        'Identifying odd one out activity'
      ]
    },
    {
      category: 'EXPLORATION',
      color: '#66BB6A',
      activities: [
        'Making a fruit salad',
        'Plantation',
        'Washing Hankerchief',
        'Zoo',
        'Learning of Evaporation process',
        'Catapult',
        'Germination',
        'Video explanation of Water cycle',
        'Robotics Fan',
        'First Aid activity',
        'Water cycle activity',
        'Paper Circuit'
      ]
    },
    {
      category: 'DEVELOPMENT',
      color: '#4CAF50',
      activities: [
        'Writing activity',
        'Beading',
        'Mixing pulses and sorting',
        'Bamboo sticks & beads',
        'Foam Shapes sorting',
        'b tracing worksheet',
        'c tracing - sensory bag',
        'All letters tracing',
        'All letters writing',
        'Full and empty activity',
        'Writing number worksheet',
        'Buttoning, Hooking, cloth folding',
        'Lacing activity',
        'Heavy & light activity',
        'Nuts and Bolts to screw and unscrew'
      ]
    },
    {
      category: 'ART & CRAFT',
      color: '#EF5350',
      activities: [
        'Alligator puppet',
        'Outlining and pasting skeleton with foam shapes',
        'Vegetable activity',
        'Jar worksheet',
        'Pasting glitter on Duck',
        'Hand Painting',
        'Quilling- Making Flower',
        'Mickey Mouse facemask',
        'Bubble Sheet colouring',
        'Original leaf painting',
        'Season activity',
        'Stones tracing on h worksheet',
        'Photo frame',
        'Brown bear activity',
        'feeding the hungry caterpillar'
      ]
    }
  ];

const ParentSection = () => {
  const [subjects] = useState(defaultSubjects);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'whatWeInclude', 'activities'
  const [activitiesData] = useState(defaultActivities);
  const [selectedCategory, setSelectedCategory] = useState('ART & CRAFT');

  // Categories for Activities tab with images
  const activityCategories = [
    { name: 'ART & CRAFT', color: '#A8D5BA', image: artCraftImage },
    { name: '360° DEVELOPMENT', color: '#FFB6C1', image: developmentImage },
    { name: 'PUZZLES', color: '#6495ED', image: puzzlesImage },
    { name: 'GAMES', color: '#FFA500', image: gamesImage },
    { name: 'MUSIC & MOVEMENT', color: '#FFD700', image: musicMovementImage },
    { name: 'EXPLORATION', color: '#9370DB', image: explorationImage },
    { name: 'STORIES', color: '#FF6347', image: storiesImage }
  ];

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Function to darken a color
  const darkenColor = (color, percent = 30) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  // Function to lighten a color
  const lightenColor = (color, percent = 70) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const handleCardClick = (subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
  };

  const renderIcon = (iconType) => {
    switch(iconType) {
      case 'monitor-abc':
        return (
          <div className="icon-monitor-abc">
            <div className="monitor-frame">
              <div className="monitor-screen">
                <span className="block block-a">A</span>
                <span className="block block-b">B</span>
                <span className="block block-c">C</span>
              </div>
            </div>
          </div>
        );
      case 'monitor-numbers':
        return (
          <div className="icon-monitor-numbers">
            <div className="monitor-frame">
              <div className="monitor-screen">
                <span className="block block-2">2</span>
                <span className="block block-3">3</span>
              </div>
            </div>
          </div>
        );
      case 'handshake-globe':
        return (
          <div className="icon-handshake">
            <div className="globe-icon">🌍</div>
            <div className="handshake-base">🤝</div>
          </div>
        );
      case 'atom-stem':
        return (
          <div className="icon-atom">
            <div className="atom-center"></div>
            <div className="atom-ring ring-1"></div>
            <div className="atom-ring ring-2"></div>
            <span className="stem-letter letter-s">S</span>
            <span className="stem-letter letter-t">T</span>
            <span className="stem-letter letter-e">E</span>
            <span className="stem-letter letter-m">M</span>
          </div>
        );
      case 'palette-brush':
        return (
          <div className="icon-art">
            <div className="paintbrush">
              <div className="brush-handle"></div>
              <div className="brush-tip"></div>
            </div>
            <div className="palette">
              <div className="palette-shape">
                <span className="paint-dot dot-red"></span>
                <span className="paint-dot dot-orange"></span>
                <span className="paint-dot dot-yellow"></span>
                <span className="paint-dot dot-green"></span>
                <span className="paint-dot dot-blue"></span>
                <span className="paint-dot dot-purple"></span>
              </div>
            </div>
          </div>
        );
      case 'music-note':
        return (
          <div className="icon-music">
            <div className="treble-clef">🎼</div>
            <div className="vinyl-record"></div>
            <div className="sound-waves">
              <span className="wave"></span>
              <span className="wave"></span>
              <span className="wave"></span>
            </div>
          </div>
        );
      default:
        return <span>📚</span>;
    }
  };

  return (
    <div className="parent-section-container">
      {/* Header with Clickable Navigation */}
      <div className="parent-section-header">
        <div className="header-titles">
          <span 
            className={`header-word ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subjects
          </span>
          <span 
            className={`header-word ${activeTab === 'whatWeInclude' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatWeInclude')}
          >
            What We Include
          </span>
          <span 
            className={`header-word ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </span>
        </div>
      </div>

      {/* Subjects Tab - Subject Cards Grid */}
      {activeTab === 'subjects' && (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => handleCardClick(subject)}
              style={{ '--subject-color': subject.color }}
            >
              <div className="card-icon-area">
                {renderIcon(subject.iconType || subject.icon)}
              </div>
              <div className="card-label" style={{ backgroundColor: subject.color }}>
                <span className="card-title">{subject.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* What We Include Tab */}
      {activeTab === 'whatWeInclude' && (
        <div className="activities-container">
          <div className="activities-grid">
            {activitiesData.map((category, index) => (
              <div key={index} className="activity-column">
                <div className="activity-header" style={{ backgroundColor: category.color }}>
                  {category.category}
                </div>
                <ul className="activity-list">
                  {category.activities.map((activity, actIndex) => (
                    <li key={actIndex} className="activity-item">
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="activities-creative-container">
          {/* Category Buttons - Left Side */}
          <div className="activity-categories-sidebar">
            {activityCategories.map((category, index) => (
              <button
                key={index}
                className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
                style={{ 
                  backgroundColor: category.color,
                  borderColor: selectedCategory === category.name ? darkenColor(category.color, 40) : 'transparent'
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Side - Category Images */}
          <div className="activity-display-area">
            <h3 className="activity-category-title">{selectedCategory}</h3>
            <div className="category-image-container">
              {activityCategories.find(cat => cat.name === selectedCategory)?.image ? (
                <img 
                  src={activityCategories.find(cat => cat.name === selectedCategory).image}
                  alt={selectedCategory}
                  className="category-display-image"
                />
              ) : (
                <div className="category-image-placeholder">
                  <p>Category image will be added soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedSubject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2 className="modal-title">{selectedSubject.title}</h2>
            <div className="modal-body">
              <p>{selectedSubject.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bubble */}
      {/* <div className="chat-bubble-btn">💬</div> */}
    </div>
  );
};

export default ParentSection;

