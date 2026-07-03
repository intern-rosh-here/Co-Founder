import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import connectionService from '../services/connectionService';
import likeService from '../services/likeService';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaUserPlus,
  FaClock,
  FaCheck,
  FaTimes,
  FaComments,
  FaSpinner,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FounderProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const matchData = location.state?.matchData;
  const { user: currentUser } = useSelector((state) => state.auth);
  const [postCount, setPostCount] = useState(0);
  const [ideaCount, setIdeaCount] = useState(0);
  const [founder, setFounder] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('no_connection');
  const [buttonStatus, setButtonStatus] = useState('no_connection');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [connection, setConnection] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFounder = async () => {


      try {
        const res = await axios.get(`${API_URL}/profiles/${userId}`);
        setFounder(res.data.user);

        console.log("Founder:", res.data.user);
console.log("Profile Image:", res.data.user.profileImage);

        // Load connection status and likes
        checkConnectionStatus();
        checkIfLiked();
        loadLikeCount();
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadFounder();
    }
  }, [userId]);

  const checkConnectionStatus = async () => {
    try {
      const data = await connectionService.getStatus(userId);
      setConnectionStatus(data.status || 'no_connection');
      setButtonStatus(data.buttonStatus || 'no_connection');
      setConnection(data.connection || null);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const data = await likeService.checkIfLiked(userId);
      setIsLiked(data.isLiked || false);
    } catch (error) {
      console.error('Error checking like:', error);
    }
  };

  const loadLikeCount = async () => {
    try {
      const data = await likeService.getLikeCount(userId);
      setLikeCount(data.count || 0);
    } catch (error) {
      console.error('Error loading like count:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoadingAction(true);
      await connectionService.sendRequest(userId);
      setButtonStatus('pending');
      setConnectionStatus('pending');
      toast.success('✅ Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoadingAction(true);
      await connectionService.acceptRequest(connection._id);
      setButtonStatus('connected');
      setConnectionStatus('accepted');
      toast.success('✅ Connection accepted!');
    } catch (error) {
      toast.error('Failed to accept request');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoadingAction(true);
      await connectionService.rejectRequest(connection._id);
      setButtonStatus('no_connection');
      setConnectionStatus('rejected');
      toast.info('Connection request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLike = async () => {
    try {
      setLoadingAction(true);
      if (isLiked) {
        await likeService.unlikeUser(userId);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
        toast.info('❤️ Removed from likes');
      } else {
        await likeService.likeUser(userId);
        setIsLiked(true);
        setLikeCount(likeCount + 1);
        toast.success('❤️ Added to likes!');
      }
    } catch (error) {
      toast.error('Failed to like profile');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMessage = async () => {
    try {
      setLoadingAction(true);

      // Create conversation
      const response = await fetch(`${API_URL}/api/messages/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId }),
      });

      const convData = await response.json();

      if (convData.success && convData.data?._id) {
        // Navigate to messages with that conversation ID
        navigate(`/messages/${convData.data._id}`);
        toast.success('📨 Chat opened!');
      } else {
        toast.error('Failed to open chat');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    } finally {
      setLoadingAction(false);
    }
  };

  const renderConnectionButton = () => {
    const buttonConfig = {
      no_connection: {
        label: '🤝 Connect',
        color: 'bg-blue-600 hover:bg-blue-700',
        onClick: handleConnect,
      },
      pending: {
        label: '⏳ Pending',
        color: 'bg-gray-500 cursor-not-allowed opacity-60',
        onClick: null,
      },
      request_received: {
        label: '📨 Respond',
        color: 'bg-purple-600 hover:bg-purple-700',
        onClick: null,
      },
      connected: {
        label: '✅ Connected',
        color: 'bg-green-600 cursor-not-allowed opacity-60',
        onClick: null,
      },
    };

    const config = buttonConfig[buttonStatus] || buttonConfig.no_connection;

    if (buttonStatus === 'request_received') {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={loadingAction}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loadingAction ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            Accept
          </button>
          <button
            onClick={handleReject}
            disabled={loadingAction}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loadingAction ? <FaSpinner className="animate-spin" /> : <FaTimes />}
            Reject
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={config.onClick}
        disabled={loadingAction || !config.onClick}
        className={`flex-1 ${config.color} text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2`}
      >
        {loadingAction && buttonStatus !== 'connected' ? (
          <FaSpinner className="animate-spin" />
        ) : (
          config.label
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!founder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-xl mb-4">Founder not found</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition"
        >
          <FaArrowLeft /> Back to Browse
        </button>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 mb-6">
          <div className="flex gap-6 flex-col md:flex-row">

            <img
  src={
    founder.profileImage
      ? founder.profileImage.startsWith("http")
        ? founder.profileImage
        : `${API_URL}${founder.profileImage}`
      : "https://via.placeholder.com/150"
  }
  alt={founder.firstName}
  className="w-32 h-32 rounded-full object-cover border-4 border-purple-600"
  onError={(e) => {
    console.log("Failed image:", e.target.src);
  }}
/>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {founder.firstName} {founder.lastName}
              </h1>

              <p className="text-purple-400 text-xl mb-3">
                {founder.role || 'Not specified'}
              </p>

              <p className="text-gray-300 mb-6">
                {founder.bio || 'No bio available'}
              </p>

              {/* Like Count Badge */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">❤️ Likes: <span className="text-white font-bold">{likeCount}</span></p>
              </div>

              <div className="flex gap-3 flex-wrap">

                <div className="flex gap-3 flex-wrap">

                  {currentUser?._id !== founder?._id && (
                    <>
                      {renderConnectionButton()}

                      <button
                        onClick={handleLike}
                        disabled={loadingAction}
                        className={`${isLiked
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                          } disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        {isLiked ? 'Liked' : 'Like'}
                      </button>
                    </>
                  )}

                </div>
              </div>

              {/* Message Button (only if connected) */}
              {buttonStatus === 'connected' && (
                <button
                  onClick={handleMessage}
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaComments /> Send Message
                </button>
              )}
            </div>

            {/* View Posts Button */}
            <button
              onClick={() => navigate(`/founder/${userId}/posts`)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 20px',
                background: '#764ba2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              📝 View Posts
            </button>

          </div>
        </div>

        {/* Professional */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Professional Information
          </h2>

          <p className="text-gray-300 mb-2">
            <span className="text-gray-400 text-sm">Industry:</span> {founder.industry || 'Not specified'}
          </p>

          <p className="text-gray-300">
            <span className="text-gray-400 text-sm">Experience:</span> {founder.experience || 'Not specified'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Previous Experience
          </h2>

          <p className="text-gray-300 whitespace-pre-line">
            {founder.previousRoles || 'Not provided'}
          </p>
        </div>

        {/* Location */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Location
          </h2>

          <p className="text-gray-300">
            {founder.location?.city || 'N/A'}, {founder.location?.country || 'N/A'}
          </p>
        </div>

        {/* Skills */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {founder.skills && founder.skills.length > 0 ? (
              founder.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-purple-600 px-3 py-1 rounded-full text-white"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills listed</p>
            )}
          </div>
        </div>

        {matchData && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Match Analysis
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              <div>
                <p className="text-gray-400 text-sm">Overall Match</p>
                <p className="text-green-400 text-2xl font-bold">
                  {matchData.matchPercentage || 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Industry Match</p>
                <p className="text-white">
                  {matchData.industryMatch || 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Experience Match</p>
                <p className="text-white">
                  {matchData.experienceMatch || 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Skills Match</p>
                <p className="text-white">
                  {matchData.skillsMatch || 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Location Bonus</p>
                <p className="text-white">
                  {matchData.locationBonus || 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Startup Stage Match</p>
                <p className="text-white">
                  {matchData.stageMatch || 0}%
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Startup */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Startup Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-gray-400 text-sm">
                Startup Name
              </label>
              <p className="text-white font-semibold">
                {founder.startupName || 'Not specified'}
              </p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Ready to Invest
              </label>
              <p className="text-white font-semibold">
                {founder.startupFundingGoal
                  ? `$${founder.startupFundingGoal}`
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Equity Offering
              </label>
              <p className="text-white font-semibold">
                {founder.equityOffering
                  ? `${founder.equityOffering}%`
                  : 'Not specified'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm">
                Startup Description
              </label>
              <p className="text-gray-300">
                {founder.startupDescription || 'No description provided'}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default FounderProfilePage;