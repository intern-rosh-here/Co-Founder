import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Public
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';
import CommunityPostDetailPage from './pages/CommunityPostDetailPage';
import StartupIdeaDetailPage from './pages/StartupIdeaDetailPage';



// Pages - Protected
import NotificationsPage from './pages/NotificationsPage';
import FounderProfilePage from './pages/FounderProfilePage';
import DashboardPage from './pages/DashboardPage';
import BrowseProfilesPage from './pages/BrowseProfilesPage';
import BrowseFoundersPage from './pages/BrowseFoundersPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import StartupIdeasPage from './pages/StartupIdeasPage';
import PostIdeaPage from './pages/PostIdeaPage';
import CommunityPage from './pages/CommunityPage';
import VideoCallPage from './pages/VideoCallPage';
import PaymentPage from './pages/PaymentPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import ConnectionsPage from './pages/ConnectionsPage';
import FounderPostsPage from './pages/FounderPostsPage';

// Redux
import { checkAuth } from './store/authSlice';


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {/* Show Navigation Only When Authenticated */}
        {isAuthenticated && <Navbar />}

        <div className="flex relative">
          {/* Sidebar - Only when authenticated */}
          {isAuthenticated && (
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          )}

          {/* Main Content Area - Shifts when sidebar opens */}
          <main
            className={`flex-1 w-full transition-all duration-300 ease-in-out ${
              isAuthenticated && sidebarOpen ? 'ml-64' : 'ml-0'
            }`}
          >
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route path="/" element={<HomePage />} />
              
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                }
              />
              
              <Route path="/founder/:userId" element={<FounderProfilePage />} />

              <Route
                path="/register"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                }
              />
              
              <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
              <Route
  path="/profile/:userId"
  element={
    <ProtectedRoute>
      <FounderProfilePage />
    </ProtectedRoute>
  }
/>


            // In your routes:
<Route path="/community/:postId" element={<CommunityPostDetailPage />} />
<Route path="/ideas/:ideaId" element={<StartupIdeaDetailPage />} />

              {/* ==================== PROTECTED ROUTES ==================== */}
              
              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>

              <Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  }
/>

              {/* Browse Pages */}
              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <BrowseFoundersPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/browse-profiles"
                element={
                  <ProtectedRoute>
                    <BrowseProfilesPage />
                  </ProtectedRoute>
                }
              />

            <Route
    path="/connections"
    element={<ConnectionsPage />}
/>
              
              
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Matches & Messages */}
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/founder/:userId/posts" element={<FounderPostsPage />} />


              
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/messages/:conversationId"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Startup Ideas & Community */}
              <Route
                path="/startup-ideas"
                element={
                  <ProtectedRoute>
                    <StartupIdeasPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/post-idea"
                element={
                  <ProtectedRoute>
                    <PostIdeaPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />

              // Add to your routes:
<Route path="/community" element={<CommunityPage />} />
<Route path="/ideas" element={<StartupIdeasPage />} />

              {/* Video Call & Payment */}
              <Route
                path="/video-call/:userId"
                element={
                  <ProtectedRoute>
                    <VideoCallPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard - Only for admin users */}
              {user?.role === 'admin' && (
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              )}

              {/* ==================== 404 ROUTE ==================== */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;