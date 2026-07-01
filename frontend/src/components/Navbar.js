import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt } from 'react-icons/fa';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Load unread notifications on mount
useEffect(() => {
  if (!user?._id) return;

  const socket = notificationService.initSocket(user._id);

  loadUnreadCount();

  socket.on('notification_received', (notification) => {
    console.log('🔔 New notification received:', notification);

    setUnreadCount(prev => prev + 1);

    toast.info(notification.message);
  });

  return () => {
    socket.off('notification_received');
  };
}, [user]);


  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cofounder Matches
            </span>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            
            {/* Notifications Bell */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative text-gray-700 hover:text-purple-600 transition text-xl"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            

            {/* User Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <img
                    src={
                      user?.profileImage
                        ? `${API_URL}${user.profileImage}`
                        : 'https://via.placeholder.com/32'
                    }
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:inline text-gray-700 font-semibold text-sm">
                    {user?.firstName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <FaUser /> View Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate('/edit-profile');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <FaUser /> Edit Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      ⚙️ Settings
                    </button>

                    <hr className="my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 flex items-center gap-2 text-red-600 font-semibold"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;