import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SavedCoursesPage from './pages/SavedCoursesPage';
import MainLayout from './layouts/MainLayout';
import CourseProfilePage from './pages/CourseProfilePage';
import DiscoverPage from './pages/DiscoverPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to WildRec</h1>
        </header>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<MainLayout>
              <HomePage />
            </MainLayout>} />
        
          <Route
            path="/saved"
            element={
              <MainLayout>
                <SavedCoursesPage />
              </MainLayout>
            }
          />
        <Route
          path="/discover"
          element={
            <MainLayout>
              <DiscoverPage />
            </MainLayout>
          }
        />
        <Route
          path="/course/:id"
          element={
            <MainLayout>
              <CourseProfilePage />
            </MainLayout>
          }
        />
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
