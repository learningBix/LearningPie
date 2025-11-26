import React, { useState, useEffect } from 'react';
import { contentsAPI } from '../../services/apiService';
// import './StoryTime.css';
import { BLOB_BASE_URL } from '../../config/api'; 


const StoryTime = ({ onVideoWatch }) => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasTrackedVideo, setHasTrackedVideo] = useState(false);

  // Debug: Log when component receives onVideoWatch prop
  useEffect(() => {
    console.log('📦 StoryTime - Component mounted/updated, onVideoWatch:', typeof onVideoWatch);
  }, [onVideoWatch]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const res = await contentsAPI.getStoriesList();

    if (!res.success) {
      console.error('API Error:', res.message);
      return;
    }

    let data = [];

    try {
      data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    } catch (error) {
      console.log('JSON Parse Error:', error);
    }

    // ⭐ Filter: ONLY Story Time (type = 0)
    const filtered = (data || []).filter((item) => item.type === 0);

    // ⭐ Map: API image → UI thumbnail
   const mapped = filtered.map((item) => ({
         ...item,
         thumbnail: item.image ? `${BLOB_BASE_URL}${item.image}` : '',
        //  video: item.video ? `${BLOB_BASE_URL}${item.video}` : '',
         isLocked: false // If later API gives locked status
       }));

    setStories(mapped);
  };

  const handleStoryClick = (story) => {
    if (story.isLocked) {
      alert('This story is locked. Please unlock to watch!');
      return;
    }

    setSelectedStory(story);
    setShowModal(true);
    setHasTrackedVideo(false);
  };

  // Track video watch when story is displayed
  useEffect(() => {
    console.log('StoryTime - useEffect triggered:', {
      hasSelectedStory: !!selectedStory,
      showModal,
      hasTrackedVideo,
      hasOnVideoWatch: !!onVideoWatch
    });
    
    if (selectedStory && showModal && !hasTrackedVideo && onVideoWatch) {
      console.log('StoryTime - Calling onVideoWatch for stories');
      onVideoWatch('stories');
      setHasTrackedVideo(true);
    }
  }, [selectedStory, showModal, hasTrackedVideo, onVideoWatch]);

  const closeModal = () => {
    setSelectedStory(null);
    setShowModal(false);
  };

  return (
    <div className="storytime-root">
      <div className="storytime-container">

        <header className="storytime-header">
          <h1>Story Time</h1>
        </header>

        <section className="stories-grid">
          {stories.map((story) => (
            <article
              key={story.id}
              className={`story-card ${story.isLocked ? 'locked' : ''}`}
              onClick={() => handleStoryClick(story)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleStoryClick(story)}
              role="button"
            >
              <div className="thumbnail">
                <img
                  src={story.thumbnail}
                  alt={story.title}
                />

                <div className="play-overlay" aria-hidden>
                  {story.isLocked ? (
                    <span className="lock-icon">🔒</span>
                  ) : (
                    <span className="play-circle">▶</span>
                  )}
                </div>

                {!story.isLocked && (
                  <div className="progress">
                    <button className="play-small">▶</button>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '30%' }} />
                    </div>

                    <div className="controls-dots">
                      <span></span><span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="story-info">
                <h3>{story.title}</h3>
              <p>
                  {story.description.split(' ').slice(0, 15).join(' ') +
                    (story.description.split(' ').length > 15 ? '...' : '')}
                </p>
              </div>
            </article>
          ))}
        </section>

      </div>

      {/* Modal */}
      {showModal && selectedStory && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <h2 className="modal-title">{selectedStory.title}</h2>

            <div className="modal-video-wrapper">
              <iframe
                src={selectedStory.video}
                title="Story Video Player"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="video-frame"
              ></iframe>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StoryTime;
