import React, { useState, useEffect } from 'react';
import { contentsAPI } from '../../services/apiService';
import { BLOB_BASE_URL } from '../../config/api'; 
// import './RhymeTime.css';

const RhymeTime = () => {
  const [rhymes, setRhymes] = useState([]);
  const [selectedRhyme, setSelectedRhyme] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRhymes();
  }, []);

  const loadRhymes = async () => {
    const res = await contentsAPI.getRhymesList();

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

    // ⭐ Filter only rhymes (type = 1)
    const filtered = (data || []).filter((item) => item.type === 1);

    // API has "image" field — rename thumbnail for UI
     const mapped = filtered.map((item) => ({
      ...item,
      thumbnail: item.image ? `${BLOB_BASE_URL}${item.image}` : '',
      // video: item.video ? `${BLOB_BASE_URL}${item.video}` : '',
      isLocked: false // If later API gives locked status
    }));
    setRhymes(mapped);
  };

  const handleRhymeClick = (rhyme) => {
    if (rhyme.isLocked) {
      alert('This rhyme is locked. Please unlock to watch!');
      return;
    }
    setSelectedRhyme(rhyme);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRhyme(null);
  };

  return (
    <div className="storytime-root">
      <div className="storytime-container">
        <header className="storytime-header">
          <h1>Rhyme Time</h1>
        </header>

        <section className="stories-grid">
          {rhymes.map((rhyme) => (
            <article
              key={rhyme.id}
              className={`story-card ${rhyme.isLocked ? 'locked' : ''}`}
              onClick={() => handleRhymeClick(rhyme)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRhymeClick(rhyme);
              }}
            >
              <div className="thumbnail">
                <img src={rhyme.thumbnail} alt={rhyme.title} />

                <div className="play-overlay" aria-hidden>
                  {rhyme.isLocked ? (
                    <span className="lock-icon">🔒</span>
                  ) : (
                    <span className="play-circle">▶</span>
                  )}
                </div>

                {!rhyme.isLocked && (
                  <div className="progress">
                    <button className="play-small">▶</button>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '20%' }}></div>
                    </div>
                    <div className="controls-dots">
                      <span></span><span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="story-info">
                <h3>{rhyme.title}</h3>
                <p>{rhyme.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* VIDEO MODAL */}
      {showModal && selectedRhyme && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <h2 className="modal-title">{selectedRhyme.title}</h2>

            <div className="modal-video-wrapper">
              <iframe
                src={selectedRhyme.video}
                title="Rhyme Video Player"
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

export default RhymeTime;
