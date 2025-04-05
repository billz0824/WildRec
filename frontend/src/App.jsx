import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/OnboardingPage';
import CourseCardTest from './pages/CourseCardTest';
import HomePage from './pages/HomePage';
import ForYouPage from './pages/ForYouPage';
import SavedCoursesPage from './pages/SavedCoursesPage';
import FeedPage from './pages/FeedPage';
import MainLayout from './layouts/MainLayout';
import CourseProfilePage from './pages/CourseProfilePage';


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
          <Route path="/course-card-test" element={<MainLayout><CourseCardTest /></MainLayout>} />
          <Route
          path="/foryou"
          element={
            <MainLayout>
              <ForYouPage />
            </MainLayout>
          }
        />
        <Route
          path="/saved"
          element={
            <MainLayout>
              <SavedCoursesPage />
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
        <Route
          path="/feed"
          element={
            <MainLayout>
              <FeedPage />
            </MainLayout>}/>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
