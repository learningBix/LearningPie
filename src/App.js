import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  // Mock user data for development (login removed)
  const mockUser = {
    id: '1',
    name: 'Student',
    email: 'student@example.com',
    age: '10',
    profile_image: null
  };

  const handleLogout = () => {
    console.log('Logout clicked - login functionality removed');
  };

  return (
    <div className="App">
      <Dashboard user={mockUser} onLogout={handleLogout} />
    </div>
  );
}

export default App;

