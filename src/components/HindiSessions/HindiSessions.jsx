import React, { useEffect, useState } from "react";
import { contentsAPI } from "../../services/apiService";
import { BLOB_BASE_URL } from '../../config/api'; 

const HindiSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadHindiSessions();
  }, []);

  // Function to decode HTML entities and fix Unicode encoding
  const decodeHindiText = (text) => {
    if (!text) return '';
    
    try {
      // First decode HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      let decoded = textarea.value;
      
      // Check if text contains mojibake (incorrectly encoded UTF-8)
      if (decoded.includes('à¤') || decoded.includes('à¥')) {
        // Text is UTF-8 bytes interpreted as Latin-1/Windows-1252
        // We need to convert it back
        try {
          // Convert the string to bytes as if it were Latin-1
          const bytes = [];
          for (let i = 0; i < decoded.length; i++) {
            bytes.push(decoded.charCodeAt(i) & 0xff);
          }
          // Now decode those bytes as UTF-8
          decoded = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
        } catch (e) {
          console.log('UTF-8 decode failed:', e);
        }
      }
      
      // Remove any replacement characters (�) or null bytes
      decoded = decoded.replace(/\uFFFD/g, '').replace(/\0/g, '');
      
      // Clean up any extra whitespace
      decoded = decoded.trim();
      
      return decoded;
    } catch (error) {
      console.log('Error decoding text:', error);
      return text;
    }
  };

  const loadHindiSessions = async () => {
    const res = await contentsAPI.getRhymesList();

    if (!res.success) {
      console.error("API Error:", res.message);
      return;
    }

    let data = [];

    try {
      data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    } catch (error) {
      console.log("JSON Parse Error:", error);
    }

    // ⭐ Filter only Hindi Sessions (type = 7)
    const filtered = (data || []).filter((item) => item.type === 7);

    const mapped = filtered.map((item) => ({
      ...item,
      // Decode Hindi text for title and description
      title: decodeHindiText(item.title),
      description: decodeHindiText(item.description),
      thumbnail: item.image ? `${BLOB_BASE_URL}${item.image}` : '',
      video: item.video ? `${BLOB_BASE_URL}${item.video}` : '',
      isLocked: false // If later API gives locked status
    }));
    
    console.log('Mapped Hindi Sessions:', mapped);
    setSessions(mapped);
  };

  const handleSessionClick = (session) => {
    if (session.isLocked) {
      alert("This Hindi session is locked!");
      return;
    }
    setSelectedSession(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  return (
    <div className="storytime-root">
      <div className="storytime-container">
        <header className="storytime-header">
          <h1>Hindi Sessions</h1>
        </header>

        <section className="stories-grid">
          {sessions.map((session) => (
            <article
              key={session.id}
              className={`story-card ${session.isLocked ? "locked" : ""}`}
              onClick={() => handleSessionClick(session)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSessionClick(session);
              }}
            >
              <div className="thumbnail">
                <img src={session.thumbnail} alt={session.title} />

                <div className="play-overlay" aria-hidden>
                  {session.isLocked ? (
                    <span className="lock-icon">🔒</span>
                  ) : (
                    <span className="play-circle">▶</span>
                  )}
                </div>

                {!session.isLocked && (
                  <div className="progress">
                    <button className="play-small">▶</button>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                    <div className="controls-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="story-info">
                <h3>{session.title}</h3>
                <p>{session.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Video Modal */}
      {showModal && selectedSession && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <h2 className="modal-title">{selectedSession.title}</h2>

            <div className="modal-video-wrapper">
              <iframe
                src={selectedSession.video}
                title="Hindi Session Player"
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

export default HindiSessions;