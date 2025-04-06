import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SavedCoursesPage from './pages/SavedCoursesPage';
import MainLayout from './layouts/MainLayout';
import CourseProfilePage from './pages/CourseProfilePage';
import DiscoverPage from './pages/DiscoverPage';

// Enable React Router v7 features
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router {...routerOptions}>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <MainLayout><HomePage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <MainLayout><DiscoverPage /></MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/saved" element={
              <ProtectedRoute>
                <MainLayout><SavedCoursesPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/course/:id" element={
              <ProtectedRoute>
                <MainLayout><CourseProfilePage /></MainLayout>
              </ProtectedRoute>
            } />

            {/* Catch all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
