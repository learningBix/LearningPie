import React, { useEffect, useState } from "react";
import { contentsAPI } from "../../services/apiService";
import { BLOB_BASE_URL } from '../../config/api'; 

const HindiSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [videoError, setVideoError] = useState(null);

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

  // Helper function to construct blob URL safely
  const getBlobUrl = (path) => {
    if (!path) return '';
    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BLOB_BASE_URL}${cleanPath}`;
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

    const mapped = filtered.map((item) => {
      const videoUrl = getBlobUrl(item.video || item.video_url || item.videoUrl);
      const thumbnailUrl = getBlobUrl(item.image || item.thumbnail || item.thumbnail_url);
      
      console.log(`📹 Hindi Session ${item.id}:`, {
        originalVideo: item.video || item.video_url || item.videoUrl,
        constructedVideoUrl: videoUrl,
        originalImage: item.image || item.thumbnail,
        constructedThumbnailUrl: thumbnailUrl
      });

      return {
        ...item,
        // Decode Hindi text for title and description
        title: decodeHindiText(item.title),
        description: decodeHindiText(item.description),
        thumbnail: thumbnailUrl,
        video: videoUrl,
        isLocked: false // If later API gives locked status
      };
    });
    
    console.log('✅ Mapped Hindi Sessions:', mapped);
    setSessions(mapped);
  };

  const handleSessionClick = (session) => {
    if (session.isLocked) {
      alert("This Hindi session is locked!");
      return;
    }
    setVideoError(null); // Reset error when opening new session
    setSelectedSession(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setVideoError(null); // Clear error when closing modal
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
              {videoError ? (
                <div className="video-error" style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#d32f2f',
                  backgroundColor: '#ffebee',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    ⚠️ Video Loading Error
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                    {videoError}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                    URL: {selectedSession.video}
                  </p>
                  <button 
                    onClick={() => {
                      setVideoError(null);
                      // Force reload by updating the video src
                      const video = document.querySelector('.video-frame');
                      if (video && video.tagName === 'VIDEO') {
                        video.load();
                      }
                    }}
                    style={{
                      marginTop: '15px',
                      padding: '8px 16px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : selectedSession.video ? (
                // Check if it's a YouTube/Vimeo embed URL or direct video file
                selectedSession.video.includes('youtube.com') || 
                selectedSession.video.includes('youtu.be') || 
                selectedSession.video.includes('vimeo.com') ? (
                  // Use iframe for embed URLs
                  <iframe
                    src={selectedSession.video}
                    title="Hindi Session Player"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="video-frame"
                    onError={(e) => {
                      console.error('❌ Iframe video load error:', e);
                      setVideoError('Failed to load embedded video. The video may not be available.');
                    }}
                  ></iframe>
                ) : (
                  // Use video tag for direct video files (blob storage URLs)
                  <video
                    key={selectedSession.video} // Force re-render on video change
                    src={selectedSession.video}
                    controls
                    autoPlay
                    className="video-frame"
                    style={{ width: '100%', height: '100%' }}
                    onError={(e) => {
                      console.error('❌ Video load error:', {
                        videoUrl: selectedSession.video,
                        error: e,
                        videoElement: e.target
                      });
                      setVideoError('Video file not found or cannot be loaded. Please contact support if this issue persists.');
                    }}
                    onLoadStart={() => {
                      console.log('📹 Loading video:', selectedSession.video);
                      setVideoError(null);
                    }}
                    onLoadedData={() => {
                      console.log('✅ Video loaded successfully:', selectedSession.video);
                      setVideoError(null);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="video-error" style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  <p>⚠️ Video URL not available</p>
                  <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    This session does not have a video URL configured.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HindiSessions;