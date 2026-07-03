import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, uploadProfilePicture } from '../store/profileSlice';
import connectionService from '../services/connectionService';
import likeService from '../services/likeService';
import {
  FaCamera,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCertificate,
  FaEdit,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaSpinner,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myProfile, loading, error, isProfileComplete } = useSelector(
    (state) => state.profile
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);

  // NEW: Connection & Like states
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    console.log('myProfile:', myProfile);
  }, [myProfile]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(getMyProfile());
  }, [isAuthenticated, navigate, dispatch]);

  // NEW: Load connection stats
  useEffect(() => {
    if (isAuthenticated && myProfile?._id) {
      loadProfileStats();
    }
  }, [isAuthenticated, myProfile]);

  const loadProfileStats = async () => {
    try {
      const [connData, pendingData, likesData, likeCountData] = await Promise.all([
        connectionService.getConnections('accepted'),
        connectionService.getPendingRequests(),
        likeService.getLikesReceived(),
        likeService.getLikeCount(myProfile._id),
      ]);

      setConnections(connData.data || []);
      setPendingRequests(pendingData.data || []);
      setLikes(likesData.data || []);
      setLikeCount(likeCountData.count || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        await dispatch(uploadProfilePicture(file));
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  // NEW: Connection handlers
  const handleAcceptRequest = async (connectionId) => {
    try {
      setLoadingAction(connectionId);
      await connectionService.acceptRequest(connectionId);
      loadProfileStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      setLoadingAction(connectionId);
      await connectionService.rejectRequest(connectionId);
      loadProfileStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnect = async (connectionId, otherUserId) => {
    try {
      setLoadingAction(connectionId);
      await connectionService.unconnect(otherUserId);
      loadProfileStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading && !myProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button
            onClick={() => dispatch(getMyProfile())}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={
                  myProfile.profileImage
                    ? `${API_URL}${myProfile.profileImage}`
                    : 'https://via.placeholder.com/200?text=No+Image'
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full cursor-pointer transition transform hover:scale-110"
              >
                <FaCamera />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-black text-white mb-2">
                {myProfile.firstName} {myProfile.lastName}
              </h1>
              <p className="text-gray-300 mb-4">{myProfile.role || 'Founder'}</p>

              {!isProfileComplete && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <div className="text-yellow-400">⚠️</div>
                  <span className="text-yellow-200 text-sm">
                    Complete your profile to get better matches
                  </span>
                </div>
              )}

              {/* NEW: Stats Row */}
              <div className="flex gap-3 flex-wrap justify-center md:justify-start mb-4">
                <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-gray-400 text-xs">❤️ Likes</p>
                  <p className="text-white font-bold">{likeCount}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-gray-400 text-xs">🤝 Connected</p>
                  <p className="text-white font-bold">{connections.length}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-gray-400 text-xs">⏳ Pending</p>
                  <p className="text-white font-bold">{pendingRequests.length}</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white font-semibold">{myProfile.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Phone</label>
                <p className="text-white font-semibold">
                  {myProfile.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Bio</label>
                <p className="text-gray-300">
                  {myProfile.bio || 'No bio added yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBriefcase /> Professional
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Industry</label>
                <p className="text-white font-semibold">
                  {myProfile.industry || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Experience</label>
                <p className="text-white font-semibold">
                  {myProfile.experience || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Startup Stage</label>
                <p className="text-white font-semibold">
                  {myProfile.startupStage || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Previous Experience
            </h2>

            <p className="text-gray-300 whitespace-pre-line">
              {myProfile.previousRoles || 'Not provided'}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaMapMarkerAlt /> Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">City</label>
                <p className="text-white font-semibold">
                  {myProfile.location?.city || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Country</label>
                <p className="text-white font-semibold">
                  {myProfile.location?.country || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Timezone</label>
                <p className="text-white font-semibold">
                  {myProfile.timezone || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCertificate /> Skills
            </h2>
            {myProfile.skills && myProfile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myProfile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-purple-600/50 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Startup Info */}
        {myProfile.startupName && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Startup Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-400 text-sm">Startup Name</label>
                <p className="text-white font-semibold">{myProfile.startupName}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ready to invest</label>
                <p className="text-white font-semibold">
                  {myProfile.startupFundingGoal
                    ? `$${myProfile.startupFundingGoal.toLocaleString()}`
                    : 'Not specified'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-400 text-sm">Description</label>
                <p className="text-gray-300">{myProfile.startupDescription}</p>
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
{(myProfile.linkedinUrl ||
  myProfile.githubUrl ||
  myProfile.twitterUrl ||
  myProfile.websiteUrl) && (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
    <h2 className="text-xl font-bold text-white mb-4">Social Links</h2>

    <div className="flex gap-4 flex-wrap">
      {myProfile.linkedinUrl && (
        <a
          href={myProfile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
        >
          <FaLinkedin />
        </a>
      )}

      {myProfile.githubUrl && (
        <a
          href={myProfile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition"
        >
          <FaGithub />
        </a>
      )}

      {myProfile.twitterUrl && (
        <a
          href={myProfile.twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-lg transition"
        >
          <FaTwitter />
        </a>
      )}

      {myProfile.websiteUrl && (
        <a
          href={myProfile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition"
        >
          <FaGlobe />
        </a>
      )}
    </div>
  </div>
)}

        {/* NEW: Tabs Section */}
        <div className="mt-8">
          <div className="mb-6 border-b border-white/20">
            <div className="flex gap-4 flex-wrap">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                {
                  id: 'connected',
                  label: `Connected (${connections.length})`,
                  icon: '🤝',
                },
                {
                  id: 'pending',
                  label: `Pending (${pendingRequests.length})`,
                  icon: '⏳',
                },
                { id: 'likes', label: `Likes (${likeCount})`, icon: '❤️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition border-b-2 ${
                    activeTab === tab.id
                      ? 'text-purple-400 border-purple-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Tab */}
          {activeTab === 'connected' && (
            <div className="space-y-4">
              {connections.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center">
                  <p className="text-gray-300">No connections yet</p>
                  <button
                    onClick={() => navigate('/browse')}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
                  >
                    Browse Founders
                  </button>
                </div>
              ) : (
                connections.map((conn) => (
                  <div
                    key={conn._id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {conn.otherUser?.profileImage ? (
                        <img
                          src={
  conn.otherUser?.profileImage
    ? conn.otherUser.profileImage.startsWith("http")
      ? conn.otherUser.profileImage
      : `${API_URL}${conn.otherUser.profileImage}`
    : "https://via.placeholder.com/150"
}
                          alt={conn.otherUser.firstName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-600"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl border-2 border-white/20">
                          👤
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold">
                          {conn.otherUser?.firstName} {conn.otherUser?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {conn.otherUser?.industry || 'Co-founder'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/messages')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                      >
                        💬 Message
                      </button>
                      <button
                        onClick={() =>
                          handleDisconnect(conn._id, conn.otherUser?._id)
                        }
                        disabled={loadingAction === conn._id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                      >
                        {loadingAction === conn._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          '🔗 Disconnect'
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center">
                  <p className="text-gray-300">No pending requests</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {req.senderId?.profileImage ? (
                        <img
                          src={
  req.senderId?.profileImage
    ? req.senderId.profileImage.startsWith("http")
      ? req.senderId.profileImage
      : `${API_URL}${req.senderId.profileImage}`
    : "https://via.placeholder.com/150"
}
                          alt={req.senderId.firstName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-yellow-600"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-2xl border-2 border-white/20">
                          👤
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-bold">
                          {req.senderId?.firstName} {req.senderId?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          📨 Sent you a connection request
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        disabled={loadingAction === req._id}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition flex items-center gap-2"
                      >
                        {loadingAction === req._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>✅ Accept</>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        disabled={loadingAction === req._id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Likes Tab */}
          {activeTab === 'likes' && (
            <div className="space-y-4">
              {likes.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center">
                  <p className="text-gray-300">No likes yet</p>
                  <p className="text-gray-400 text-sm">Keep building your profile!</p>
                </div>
              ) : (
                likes.map((like) => (
                  <div
                    key={like._id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {like.userId?.profileImage ? (
                        console.log("Profile image:", myProfile.profileImage),
                       <img
  src={
    myProfile.profileImage
      ? myProfile.profileImage.startsWith("http")
        ? myProfile.profileImage
        : `${API_URL}${myProfile.profileImage}`
      : "https://via.placeholder.com/200"
  }
  onError={(e) => {
    console.log("Image failed:", e.target.src);
  }}
  alt="Profile"
  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
/>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center text-2xl border-2 border-white/20">
                          👤
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold">
                          {like.userId?.firstName} {like.userId?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ❤️ Liked your profile
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/founder/${like.userId?._id}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition"
                    >
                      View Profile
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;