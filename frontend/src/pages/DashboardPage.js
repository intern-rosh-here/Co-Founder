import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUsers,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaLightbulb,
  FaComments,
  FaCalendarAlt,
  FaUserFriends,
  FaRocket,
  FaBell
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  // States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [topMatches, setTopMatches] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [latestConversations, setLatestConversations] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats in parallel
      const [
        statsRes,
        matchesRes,
        activityRes,
        ideasRes,
        messagesRes,
      ] = await Promise.all([
        fetchStats(),
        fetchTopMatches(),
        fetchRecentActivity(),
        fetchTrendingIdeas(),
        fetchLatestConversations(),
      ]);

      setStats(statsRes);
      setTopMatches(matchesRes);
      setRecentActivity(activityRes);
      setTrendingIdeas(ideasRes);
      setLatestConversations(messagesRes);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const [connectionsRes, messagesRes, profileRes, pendingRes] = await Promise.all([
        fetch(`${API_URL}/connections`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/connections/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const connections = await connectionsRes.json();
      const messages = await messagesRes.json();
      const profile = await profileRes.json();
      const pending = await pendingRes.json();

      // Calculate profile completion
      const profileFields = ['skills', 'experience', 'industry', 'role', 'bio'];
      const completedFields = profileFields.filter((field) => {
  const value = profile.user[field];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined &&
         value !== null &&
         value !== '';
}).length;
      const profileStrength = Math.round((completedFields / profileFields.length) * 100);

      return {
        activeMatches: connections?.data?.length|| 0,
        unreadMessages: messages?.data?.unreadCount || 0,
        profileStrength: profileStrength || 0,
        pendingRequests: pending.count || 0,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        activeMatches: 0,
        unreadMessages: 0,
        profileStrength: 0,
        pendingRequests: 0,
      };
    }
  };

  // Fetch top matches (recommendations)
  const fetchTopMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/matches?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  };

  // Fetch trending ideas
  const fetchTrendingIdeas = async () => {
    try {
      const response = await fetch(
        `${API_URL}/ideas?sort=-likes&limit=3`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return [];
    }
  };

  // Fetch latest conversations
  const fetchLatestConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/conversations?limit=3`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  };

  // Handle connect button
  const handleConnect = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/connections/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (!response.ok) throw new Error('Failed to send connection request');

      toast.success('Connection request sent!');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to send connection request');
    }
  };

  // Format time
  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  // Get initials
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-ping"></div>
            <div className="w-16 h-16 rounded-full border-t-4 border-r-4 border-purple-500 animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analyzing Network</h2>
          <p className="text-gray-400 text-sm">Preparing your dashboard insights...</p>
        </div>
      </div>
    );
  }

  const profileStrength = stats?.profileStrength || 0;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (profileStrength / 100) * circumference;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background Video */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        >
          <source src="/videos/video.mp4" type="video/mp4" />
        </video>
        {/* Dark Premium Blur Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-4">
          
          {/* Welcoming Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{user?.firstName || 'Founder'}</span> 👋
              </h1>
              <p className="text-gray-300 text-sm mt-2 font-medium">
                Your startup co-founder network is active and thriving.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 text-xs md:text-sm text-gray-200 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold tracking-wider uppercase text-[10px]">Live Network Updates</span>
            </div>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            
            {/* Card: Active Matches */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Active Matches
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {stats?.activeMatches || 0}
                </p>
                <p className="text-xs text-purple-300 mt-1 font-medium">
                  Verified connections
                </p>
              </div>
              <div className="bg-purple-500/20 text-purple-400 p-3 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <FaUsers className="text-xl" />
              </div>
            </div>

            {/* Card: Unread Messages */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Unread Messages
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {stats?.unreadMessages || 0}
                </p>
                <p className="text-xs text-blue-300 mt-1 font-medium">
                  In conversations
                </p>
              </div>
              <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <FaEnvelope className="text-xl" />
              </div>
            </div>

            {/* Card: Profile Strength */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Profile Strength
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {profileStrength}%
                </p>
                <p className="text-xs text-indigo-300 mt-1 font-medium">
                  Setup quality index
                </p>
              </div>
              <div className="relative flex items-center justify-center w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    className="text-white/10"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="url(#strengthGradient)"
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">
                  {profileStrength}%
                </span>
              </div>
            </div>

            {/* Card: Pending Requests */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Pending Requests
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {stats?.pendingRequests || 0}
                </p>
                <p className="text-xs text-pink-300 mt-1 font-medium">
                  Awaiting response
                </p>
              </div>
              <div className="bg-pink-500/20 text-pink-400 p-3 rounded-xl border border-pink-500/30 shadow-lg shadow-pink-500/10">
                <FaClock className="text-xl" />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            
            {/* Top Matches Widget */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-purple-500/10 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  Top Recommendations
                </h2>
                <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Best Matches
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {topMatches.length > 0 ? (
                  topMatches.map((match) => (
                    <div
                      key={match._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-xl hover:bg-slate-950/60 hover:border-purple-500/20 transition duration-300 shadow-md group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-purple-500/30 group-hover:border-purple-400 transition duration-300">
                            {getInitials(match.firstName + ' ' + match.lastName)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse shadow-sm"></span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition duration-200">
                            {match.firstName} {match.lastName}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 truncate flex items-center gap-1.5 font-medium">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400/50"></span>
                            {match.role || 'Entrepreneur'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm shadow-emerald-500/5">
                          {match.matchPercentage || 85}% Match
                        </span>
                        <button
                          onClick={() => navigate(`/profile/${match._id}`)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg text-xs hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all transform duration-200"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-slate-950/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-2xl mb-2">✨</p>
                    <p className="text-sm font-medium">No recommendations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Widget */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-purple-500/10 transition-all duration-300 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400">⚡</span>
                  Recent Activity
                </h2>
                <span className="bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Timeline
                </span>
              </div>

              <div className="flex flex-col gap-6 relative pl-4 border-l-2 border-purple-500/25 py-2 flex-1">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 group-hover:bg-pink-400 group-hover:scale-125 transition duration-200 shadow-glow shadow-purple-500/50"></div>
                      
                      <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl hover:border-purple-500/20 hover:bg-slate-950/60 transition duration-300">
                        <p className="margin-0 text-white text-xs leading-relaxed font-medium">
                          {activity.message || 'Activity notification'}
                        </p>
                        <p className="text-purple-400/70 text-[9px] mt-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider">
                          <FaCalendarAlt size={9} />
                          {formatTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center h-full">
                    <p className="text-lg">📊</p>
                    <p className="text-sm mt-1 font-medium">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: Trending Ideas & Latest Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Trending Ideas Widget */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-purple-500/10 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaLightbulb className="text-amber-400" />
                  Trending Ideas
                </h2>
                <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Top Voted
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {trendingIdeas.length > 0 ? (
                  trendingIdeas.map((idea) => (
                    <div
                      key={idea._id}
                      onClick={() => navigate(`/ideas/${idea._id}`)}
                      className="p-4 bg-slate-950/40 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-950/70 hover:border-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 group shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition duration-200 line-clamp-1">
                            {idea.title}
                          </h3>
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0">
                            {idea.status || 'Idea'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {idea.description || 'Startup idea concept and pitch outline...'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-medium">
                        <span>💡 Startup Idea</span>
                        <span className="flex items-center gap-1 text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/10">
                          ❤️ {idea.likes?.length || 0} likes
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-slate-950/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-lg">💡</p>
                    <p className="text-sm mt-1 font-medium">No trending ideas yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Conversations Widget */}
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-purple-500/10 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaComments className="text-blue-400" />
                  Latest Conversations
                </h2>
                <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Chats
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {latestConversations.length > 0 ? (
                  latestConversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => navigate(`/messages/${conv._id}`)}
                      className="flex items-center gap-3 p-3.5 bg-slate-950/40 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-950/70 hover:border-purple-500/20 transition-all duration-300 group shadow-md"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs border border-indigo-500/30 group-hover:border-indigo-400 transition duration-300">
                          {getInitials(conv.participantName || 'U')}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse shadow-sm"></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold text-xs truncate group-hover:text-purple-300 transition duration-200">
                            {conv.participantName}
                          </p>
                        </div>
                        <p className="text-gray-400 text-[11px] mt-1 truncate leading-relaxed">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-full text-[9px] w-5 h-5 flex items-center justify-center shadow-md animate-bounce flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-slate-950/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-lg">💬</p>
                    <p className="text-sm mt-1 font-medium">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;