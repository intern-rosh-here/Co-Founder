import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'white', fontWeight: 500 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Video */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <video
          autoPlay
          muted
          loop
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/video.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)' }}></div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 500, margin: 0, color: 'white' }}>
              Your Dashboard
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: '8px 0 0 0' }}>
              Real-time co-founder network insights
            </p>
          </div>

          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
            
            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Active matches
                </p>
                <span style={{ fontSize: '18px' }}>💚</span>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 500, margin: 0, color: 'white' }}>
                {stats?.activeMatches || 0}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '8px 0 0 0' }}>
                 connections
              </p>
            </div>

            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Unread messages
                </p>
                <span style={{ fontSize: '18px' }}>💌</span>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 500, margin: 0, color: 'white' }}>
                {stats?.unreadMessages || 0}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '8px 0 0 0' }}>
                from co-founders
              </p>
            </div>

            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Profile strength
                </p>
                <span style={{ fontSize: '18px' }}>✓</span>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 500, margin: 0, color: 'white' }}>
                {stats?.profileStrength || 0}%
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '8px 0 0 0' }}>
                complete profile
              </p>
            </div>

            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pending requests
                </p>
                <span style={{ fontSize: '18px' }}>⏱️</span>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 500, margin: 0, color: 'white' }}>
                {stats?.pendingRequests || 0}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '8px 0 0 0' }}>
                awaiting your response
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Top Matches */}
            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(102, 126, 234, 0.3)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'white' }}>
                  Top recommendations
                </h2>
                <span style={{ fontSize: '18px' }}>✨</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topMatches.length > 0 ? (
                  topMatches.map((match) => (
                    <div
                      key={match._id}
                      style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(match.firstName + ' ' + match.lastName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'white' }}>
                          {match.firstName} {match.lastName}
                        </p>
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0 0' }}>
                          {match.role} • {match.matchPercentage || 85}% match
                        </p>
                      </div>
                      <button
  onClick={() => navigate(`/profile/${match._id}`)}
  style={{
    padding: '6px 12px',
    background: '#667eea',
    color: 'white',
    border: '1px solid rgba(102, 126, 234, 0.5)',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    backdropFilter: 'blur(10px)',
  }}
>
  View Profile
</button>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>No recommendations yet</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(102, 126, 234, 0.3)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'white' }}>
                  Recent activity
                </h2>
                <span style={{ fontSize: '18px' }}>📊</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <div key={idx} style={{ paddingTop: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
                      <p style={{ margin: 0, color: 'white' }}>
                        <strong>{activity.message || 'Activity'}</strong>
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: Trending Ideas & Latest Messages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Trending Ideas */}
            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(102, 126, 234, 0.3)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'white' }}>
                  Trending ideas
                </h2>
                <span style={{ fontSize: '18px' }}>💡</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trendingIdeas.length > 0 ? (
                  trendingIdeas.map((idea) => (
                    <div
                      key={idea._id}
                      onClick={() => navigate(`/ideas/${idea._id}`)}
                      style={{
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderLeft: '3px solid #667eea',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'white' }}>
                        {idea.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0 0' }}>
                        {idea.status} • {idea.likes?.length || 0} likes
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>No ideas yet</p>
                )}
              </div>
            </div>

            {/* Latest Conversations */}
            <div style={{ background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(102, 126, 234, 0.3)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'white' }}>
                  Latest conversations
                </h2>
                <span style={{ fontSize: '18px' }}>💬</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {latestConversations.length > 0 ? (
                  latestConversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => navigate(`/messages/${conv._id}`)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '12px',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(conv.participantName || 'U')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'white' }}>
                          {conv.participantName}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            margin: '4px 0 0 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span
                          style={{
                            background: '#667eea',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                        >
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>No conversations yet</p>
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