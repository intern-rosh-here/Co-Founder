import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaHeart,
  FaTimes,
  FaFire,
  FaMapMarkerAlt,
  FaBriefcase,
  FaSpinner,
  FaCheckCircle,
  FaTrophy,
} from 'react-icons/fa';
import matchesService from '../services/matchesService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.replace(
    'http://localhost:5000',
    'https://cofounder-matrimony-backend.onrender.com'
  );
};

const MatchesPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('percentage'); // 'percentage', 'recent'
  const [minPercentage, setMinPercentage] = useState(40);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mutual'

  useEffect(() => {
    loadMatches();
  }, [sortBy, minPercentage, activeTab]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      let data;
      if (activeTab === 'mutual') {
        data = await matchesService.getMutualMatches();
      } else {
        data = await matchesService.getMatches({
          sortBy,
          minPercentage,
        });
      }

      setMatches(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };


const handleAccept = async (match) => {
  try {
    await matchesService.acceptMatch(match._id);

    toast.success(`❤️ You liked ${match.firstName}`);

    setMatches(prev =>
      prev.filter(m => m._id !== match._id)
    );
  } catch (err) {
    toast.error("Failed");
  }
};

  const handleReject = async (match) => {
    try {
        await matchesService.rejectMatch(match._id);

        toast.info(`Passed ${match.firstName}`);

        setMatches(prev =>
            prev.filter(m => m._id !== match._id)
        );
    } catch (err) {
        toast.error("Failed");
    }
};



  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMatchIcon = (percentage) => {
    if (percentage >= 80) return '🔥';
    if (percentage >= 60) return '⭐';
    if (percentage >= 40) return '👍';
    return '🤔';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-white mb-2">
            Find Your Perfect Co-Founder
          </h1>
          <p className="text-gray-300">
            {matches.length} matches found • Smart matching algorithm
          </p>
        </div>

        {/* Tabs & Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-4">
              {[
                { id: 'all', label: 'All Matches', count: matches.length },
                { id: 'mutual', label: 'Mutual Matches', count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="percentage">Highest Match %</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">Min Match %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="10"
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(parseInt(e.target.value))}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 w-24 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}

{loading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
    <p className="text-gray-300">Loading matches...</p>
  </div>
) : matches.length === 0 ? (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-12 text-center">
    <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
    <p className="text-gray-300 text-xl">No matches found</p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {matches.map((match) => (

      <div
  key={match._id}
  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition duration-200"
>

        {/* Profile Header */}
        <div className="relative h-36 bg-gradient-to-br from-purple-600 to-blue-600 flex justify-center items-center">

          {match.profileImage ? (
            <img
              src={`${API_URL}${match.profileImage}`}
              alt={match.firstName}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl">
              👤
            </div>
          )}

          <div
            className={`absolute top-3 right-3 bg-black/70 rounded-lg px-3 py-2 ${getMatchColor(
              match.matchPercentage || 0
            )}`}
          >
            <p className="text-xs text-white">Match</p>
            <p className="text-xl font-bold">
              {match.matchPercentage || 0}%
            </p>
          </div>

        </div>

        {/* Body */}

        <div className="p-5">

          <h2 className="text-xl font-bold text-white">
            {match.firstName} {match.lastName}
          </h2>

          <p className="text-purple-400 mb-4">
            {match.role || "Founder"}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">

            <div>
              <p className="text-gray-400 text-sm">Industry</p>
              <p className="text-white font-semibold">
                {match.industry}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Experience</p>
              <p className="text-white font-semibold">
                {match.experience}
              </p>
            </div>

          </div>

          {match.startupName && (
            <>
              <hr className="border-white/20 my-3" />

              <p className="text-white font-bold">
                {match.startupName}
              </p>

              <p className="text-gray-400 line-clamp-2">
                {match.startupDescription}
              </p>
            </>
          )}

          <div className="flex gap-2 mt-4">

  <button
    onClick={() =>
      navigate(`/profile/${match._id}`, {
        state: { matchData: match },
      })
    }
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
  >
    View
  </button>

  <button
    onClick={() => handleReject(match)}
    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg"
  >
    Pass
  </button>

</div>

        </div>

      </div>

    ))}

  </div>
)}
            
           
        
      </div>
    </div>
  );
};

export default MatchesPage;