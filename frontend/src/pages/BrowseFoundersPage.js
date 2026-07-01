import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaArrowRight,
  FaArrowLeft,
} from 'react-icons/fa';
import * as browseService from '../services/browseService';

const BrowseFoundersPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    experience: '',
    location: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const foundersPerPage = 12;

  useEffect(() => {
    loadFounders();
  }, [search, filters, currentPage]);

  const loadFounders = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Loading founders with:', { search, filters, currentPage });
    
    const data = await browseService.getAllFounders({
      search,
      industry: filters.industry,
      experience: filters.experience,
      location: filters.location,
      skip: (currentPage - 1) * foundersPerPage,
      limit: foundersPerPage,
    });

    console.log('Received founders:', data);

    // Ensure data is an array
    if (Array.isArray(data)) {
      // Filter out current user (extra safety)
      const filtered = data.filter(f => f._id !== user?._id);
      console.log('Filtered founders:', filtered);
      setFounders(filtered);
    } else {
      console.error('API did not return an array:', data);
      setFounders([]);
    }
  } catch (err) {
    console.error('Error loading founders:', err);
    setError('Failed to load founders');
    setFounders([]);
  } finally {
    setLoading(false);
  }
};

  const handleViewProfile = (id) => {
  navigate(`/founder/${id}`);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-4">
            Discover Co-Founders
          </h1>
          <p className="text-gray-300 text-lg">
            Connect with founders who share your vision
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, role..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => {
                  setFilters({ ...filters, industry: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Education">Education</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => {
                  setFilters({ ...filters, experience: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              >
                <option value="">All Experience</option>
                <option value="0-2 years">0-2 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Location</label>
              <input
                type="text"
                placeholder="City, Country"
                value={filters.location}
                onChange={(e) => {
                  setFilters({ ...filters, location: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch('');
                  setFilters({ industry: '', experience: '', location: '' });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-lg transition"
              >
                <FaFilter className="inline mr-2" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading founders...</p>
          </div>
        ) : founders && founders.length > 0 ? (
          <>
            {/* Founders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 place-items-center">
              {founders.map((founder) => (
                <div
                  key={founder._id}
                 className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition group w-[320px] h-[320px] flex flex-col"
                >
                  
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-3">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div>
                        {founder.profileImage ? (
                          <img
  src={
    founder.profileImage
      ? `http://localhost:5000${founder.profileImage}`
      : '/default-avatar.png'
  }
  alt={founder.firstName}
  className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
/>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-2 border-purple-500 text-2xl">
                            👤
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {founder.firstName} {founder.lastName}
                        </h3>
                        <p className="text-purple-400 text-sm">
  {founder.role || 'Not specified'}
</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    {/* Bio */}
                   <p className="text-gray-300 text-sm line-clamp-2">
                      {founder.bio || 'No bio added'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {founder.industry && (
                        <span className="bg-purple-600/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {founder.industry}
                        </span>
                      )}
                      {founder.experience && (
                        <span className="bg-blue-600/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {founder.experience}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {founder.locationCity && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <FaMapMarkerAlt /> {founder.locationCity}
                        {founder.locationCountry && `, ${founder.locationCountry}`}
                      </div>
                    )}

                    {/* Skills */}
                    {founder.skills && founder.skills.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {founder.skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {founder.skills.length > 3 && (
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              +{founder.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                 <div className="border-t border-white/10 p-2 flex gap-2">
                    <button
                      onClick={() => handleViewProfile(founder._id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      View <FaArrowRight className="text-sm" />
                    </button>
                    <button className="bg-red-600/50 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg transition">
                      <FaStar />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                Previous
              </button>
              <span className="text-white px-4 py-2">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={founders.length < foundersPerPage}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-12 text-center">
            <p className="text-gray-300 text-xl mb-4">No founders found</p>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch('');
                setFilters({ industry: '', experience: '', location: '' });
                setCurrentPage(1);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseFoundersPage;