import React, { useState, useEffect } from 'react';
import { contentsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api';   // ⭐ Blob URL Import
import './MythologicalTales.css';

const MythologicalTales = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const res = await contentsAPI.getMythologyStories();

    if (!res.success) {
      console.error('API Error:', res.message);
      return;
    }

    let data = [];

    try {
      data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    } catch (e) {
      console.log('JSON Parse Error:', e);
    }

    const filtered = (data || []).filter((item) => item.type === 6);

    // ⭐ Add full Blob URL to images & videos
    const updated = filtered.map((item) => ({
      ...item,
      image: item.image ? `${BLOB_BASE_URL}${item.image}` : '',
      // video: item.video ? `${BLOB_BASE_URL}${item.video}` : '',
    }));

    setStories(updated);
  };

  const handleStoryClick = (story) => {
    if (story.isLocked) {
      alert('This story is locked. Please unlock to watch!');
      return;
    }
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  return (
    <div className="storytime-root">
      <div className="storytime-container">
        <header className="storytime-header">
          <h1>Mythological Tales</h1>
        </header>

        <section className="stories-grid">
          {stories.map((story) => (
            <article
              key={story.id}
              className={`story-card ${story.isLocked ? 'locked' : ''}`}
              onClick={() => handleStoryClick(story)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStoryClick(story);
              }}
            >
              <div className="thumbnail">
                <img src={story.image} alt={story.title} />

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
                      <div className="progress-fill" style={{ width: '30%' }}></div>
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

      {showModal && selectedStory && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <h2 className="modal-title">{selectedStory.title}</h2>

            <div className="modal-video-wrapper">
              <iframe
                src={selectedStory.video}
                title="Video Player"
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

export default MythologicalTales;
