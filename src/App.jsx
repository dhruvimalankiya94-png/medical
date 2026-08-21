import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import WhyUs from './components/landing/WhyUs';
import Stats from './components/landing/Stats';
import Testimonials from './components/landing/Testimonials';
import FAQ from './components/landing/FAQ';
import CTA from './components/landing/CTA';
import DemoModal from './components/landing/DemoModal';
import ErrorBoundary from './components/common/ErrorBoundary';

// Part 2: Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Part 3: Dashboard & Health Management Pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Analytics from './pages/dashboard/Analytics';
import HealthRecords from './pages/dashboard/HealthRecords';
import AddHealthRecord from './pages/dashboard/AddHealthRecord';
import RiskAssessment from './pages/dashboard/RiskAssessment';
import Recommendations from './pages/dashboard/Recommendations';
import DailyPlanner from './pages/dashboard/DailyPlanner';

// Part 4: Final Module Pages
import ProgressTracking from './pages/dashboard/ProgressTracking';
import Reports from './pages/dashboard/Reports';
import Achievements from './pages/dashboard/Achievements';
import Streak from './pages/dashboard/Streak';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function LandingPage({ onOpenDemo, onOpenAuth }) {
  return (
    <main className="relative overflow-hidden">
      <Hero onOpenDemo={onOpenDemo} onOpenAuth={onOpenAuth} />
      <Features onOpenAuth={onOpenAuth} />
      <WhyUs />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA onOpenAuth={onOpenAuth} />
    </main>
  );
}

export default function App() {
  const [modalState, setModalState] = useState({ isOpen: false, type: 'demo' });

  const handleOpenDemo = () => setModalState({ isOpen: true, type: 'demo' });
  const handleOpenAuth = () => setModalState({ isOpen: true, type: 'auth' });
  const handleCloseModal = () => setModalState({ isOpen: false, type: 'demo' });

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
          <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
            
            <Routes>
              {/* Part 1: Landing Page */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar onOpenDemo={handleOpenDemo} onOpenAuth={handleOpenAuth} />
                    <div className="flex-1">
                      <LandingPage
                        onOpenDemo={handleOpenDemo}
                        onOpenAuth={handleOpenAuth}
                      />
                    </div>
                    <Footer />
                  </>
                }
              />

              {/* Part 2: Auth Module Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Dashboard & Health Management Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
              <Route path="/records" element={<ProtectedRoute><DashboardLayout><HealthRecords /></DashboardLayout></ProtectedRoute>} />
              <Route path="/records/add" element={<ProtectedRoute><DashboardLayout><AddHealthRecord /></DashboardLayout></ProtectedRoute>} />
              <Route path="/risk-assessment" element={<ProtectedRoute><DashboardLayout><RiskAssessment /></DashboardLayout></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><DashboardLayout><Recommendations /></DashboardLayout></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><DashboardLayout><DailyPlanner /></DashboardLayout></ProtectedRoute>} />

              {/* Protected Part 4 Routes */}
              <Route path="/progress" element={<ProtectedRoute><DashboardLayout><ProgressTracking /></DashboardLayout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><DashboardLayout><Achievements /></DashboardLayout></ProtectedRoute>} />
              <Route path="/streak" element={<ProtectedRoute><DashboardLayout><Streak /></DashboardLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

              {/* Fallback Route */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar onOpenDemo={handleOpenDemo} onOpenAuth={handleOpenAuth} />
                    <div className="flex-1">
                      <LandingPage
                        onOpenDemo={handleOpenDemo}
                        onOpenAuth={handleOpenAuth}
                      />
                    </div>
                    <Footer />
                  </>
                }
              />
            </Routes>

            {/* Interactive Demo Modal */}
            <DemoModal
              isOpen={modalState.isOpen}
              onClose={handleCloseModal}
              type={modalState.type}
            />
          </div>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
