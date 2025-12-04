import React, { useState, useEffect } from 'react';
import Login from './components/login/login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

export default function App() {
  // Initialize user from localStorage so the app remembers login across refreshes
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn('Error reading stored user:', err);
      return null;
    }
  });

  const handleLoginSuccess = (loggedUser) => {
    console.log("Login Successful:", loggedUser);
    // Persist user in local storage (login should survive refresh/tab change)
    // Restore profile_image from persistent storage if login response doesn't have it
    try {
      const studentId = loggedUser?.student_id || loggedUser?.id || loggedUser?.user_id;
      
      // Check persistent storage for saved avatar
      if (!loggedUser.profile_image && studentId) {
        const savedAvatar = localStorage.getItem(`profile_image_${studentId}`) || 
                           sessionStorage.getItem(`profile_image_${studentId}`);
        if (savedAvatar) {
          loggedUser.profile_image = savedAvatar;
          console.log('✅ Restored profile_image from persistent storage in App.js:', loggedUser.profile_image);
        }
      }
      
      // Also check existing user object (for backward compatibility)
      const existingUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      if (!loggedUser.profile_image && existingUser.profile_image) {
        loggedUser.profile_image = existingUser.profile_image;
        console.log('✅ Preserved profile_image from localStorage in App.js:', loggedUser.profile_image);
      }
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      sessionStorage.setItem('user', JSON.stringify(loggedUser));
    } catch (err) {
      console.warn('Failed to persist user to storage:', err);
    }
    setUser(loggedUser);
  };

  // Synchronize auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUser);
        } catch (err) {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Clear stored session and user data from storage
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('sid');
      localStorage.removeItem('student_id');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('sid');
      sessionStorage.removeItem('student_id');
    } catch (err) {
      console.warn('Error clearing storage on logout:', err);
    }
    setUser(null); // logout pe dubara login page dikhega
  };

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
