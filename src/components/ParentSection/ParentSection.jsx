import React, { useState, useMemo } from 'react';
import './ParentSection.css';
import artCraftImage from '../../assets/art-craft-activity.jpg';
import developmentImage from '../../assets/DevelopmentActivites.jpg';
import gamesImage from '../../assets/Games.jpg';
import puzzlesImage from '../../assets/Puzzles.jpg';
import musicMovementImage from '../../assets/MusicandMovement.png';
import explorationImage from '../../assets/Exploration.jpg';
import storiesImage from '../../assets/Stories.png';
import parentData from '../../assets/Parent.json';
import activityData from '../../assets/Activity.json';
import artAndColorIcon from '../../assets/parent/ArtandColor.png';
import languageIcon from '../../assets/parent/language.png';
import mathsIcon from '../../assets/parent/maths.png';
import musicIcon from '../../assets/parent/music.png';
import socialIcon from '../../assets/parent/social.png';
import stemIcon from '../../assets/parent/stem.png';

// Base subjects structure with icons and colors (descriptions will come from JSON)
const baseSubjects = [
    {
      id: 1,
      title: 'LANGUAGE AND READING',
      icon: languageIcon,
      color: '#17A2B8'
    },
    {
      id: 2,
      title: 'MATHEMATICS',
      icon: mathsIcon,
      color: '#8BC34A'
    },
    {
      id: 3,
      title: 'GENERAL & SOCIAL AWARENESS',
      icon: socialIcon,
      color: '#2196F3'
    },
    {
      id: 4,
      title: 'STEM LEARNING',
      icon: stemIcon,
      color: '#F44336'
    },
    {
      id: 5,
      title: 'ART & COLORS',
      icon: artAndColorIcon,
      color: '#9C27B0'
    },
    {
      id: 6,
      title: 'MUSIC & MOVEMENT/EXERCISE',
      icon: musicIcon,
      color: '#FFC107'
    }
  ];

// Category colors mapping (consistent across all course types)
const categoryColors = {
  'MUSIC & MOVEMENT': '#FFC107',
  'GAMES': '#42A5F5',
  'STORIES': '#FFA726',
  'PUZZLES': '#EC407A',
  'EXPLORATION': '#66BB6A',
  'DEVELOPMENT ACTIVITIES': '#4CAF50',
  'DEVELOPMENT': '#4CAF50', // Alias for DEVELOPMENT ACTIVITIES
  'ART & CRAFT': '#EF5350'
};

const ParentSection = ({ courseType: initialCourseType = 'jkg' }) => {
  // Normalize course type key (pg, nursery, jkg, skg)
  const courseTypeKey = (initialCourseType || 'jkg').toLowerCase();

  // Merge base subjects with descriptions from Parent.json based on course type
  const subjects = useMemo(() => {
    const courseData = parentData[courseTypeKey] || parentData['jkg']; // Fallback to jkg if course type not found
    
    return baseSubjects.map(subject => {
      // Find matching description from JSON
      const subjectKey = subject.title.toUpperCase();
      const jsonSubject = courseData[subjectKey];
      
      // Get description from JSON (handle both array and direct object)
      let description = '';
      if (jsonSubject && Array.isArray(jsonSubject) && jsonSubject.length > 0) {
        description = jsonSubject[0].name || '';
      } else if (jsonSubject && jsonSubject.name) {
        description = jsonSubject.name;
      }
      
      return {
        ...subject,
        description: description || `Description for ${subject.title} will be available soon.`
      };
    });
  }, [courseTypeKey]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects', 'whatWeInclude', 'activities'
  const [selectedCategory, setSelectedCategory] = useState('ART & CRAFT');

  // Transform Activity.json data to component format based on course type
  const activitiesData = useMemo(() => {
    const courseActivities = activityData[courseTypeKey] || activityData['jkg']; // Fallback to jkg
    
    // Define category order for consistent display
    const categoryOrder = [
      'MUSIC & MOVEMENT',
      'GAMES',
      'STORIES',
      'PUZZLES',
      'EXPLORATION',
      'DEVELOPMENT ACTIVITIES',
      'ART & CRAFT'
    ];

    return categoryOrder.map(categoryKey => {
      // Handle both "DEVELOPMENT ACTIVITIES" (from JSON) and "DEVELOPMENT" (for display)
      const jsonKey = categoryKey === 'DEVELOPMENT' ? 'DEVELOPMENT ACTIVITIES' : categoryKey;
      const activitiesArray = courseActivities[jsonKey] || [];
      
      // Extract activity names from JSON structure
      const activities = activitiesArray.map(item => item.name || item);
      
      // Map "DEVELOPMENT ACTIVITIES" to "DEVELOPMENT" for display
      const displayCategory = categoryKey === 'DEVELOPMENT ACTIVITIES' ? 'DEVELOPMENT' : categoryKey;
      
      return {
        category: displayCategory,
        color: categoryColors[categoryKey] || categoryColors[displayCategory] || '#666666',
        activities: activities
      };
    }).filter(category => category.activities.length > 0); // Only include categories with activities
  }, [courseTypeKey]);

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
                <img 
                  src={subject.icon} 
                  alt={subject.title} 
                  className="subject-icon-image"
                />
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
