import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
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
  if (!user) return <Navigate to="/onboarding" replace />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router {...routerOptions}>
        <div className="App">
          <Routes>
            <Route path="/onboarding" element={
              <>
                <header className="App-header">
                  <h1>Welcome to WildRec</h1>
                </header>
                <Onboarding />
              </>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <MainLayout><HomePage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route
              path="/discover"
              element={
                <MainLayout>
                  <DiscoverPage />
                </MainLayout>
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
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
