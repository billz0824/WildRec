import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/OnboardingPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to WildRec</h1>
        </header>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<div>Home Page</div>} />
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
