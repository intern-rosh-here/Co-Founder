import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaFilter, FaChevronRight } from 'react-icons/fa';

const BrowseProfilesPage = () => {
  const [filters, setFilters] = useState({
    industry: '',
    experience: '',
    location: '',
    skills: '',
  });
  const [profiles, setProfiles] = useState([]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Browse Profiles</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-purple-600" />
          <h2 className="text-lg font-bold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="industry"
            value={filters.industry}
            onChange={handleFilterChange}
            className="border-2 border-gray-300 rounded px-4 py-2"
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
          </select>

          <select
            name="experience"
            value={filters.experience}
            onChange={handleFilterChange}
            className="border-2 border-gray-300 rounded px-4 py-2"
          >
            <option value="">All Experience Levels</option>
            <option value="0-2 years">0-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>

          <input
            type="text"
            name="location"
            placeholder="Search location..."
            value={filters.location}
            onChange={handleFilterChange}
            className="border-2 border-gray-300 rounded px-4 py-2"
          />

          <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
            Search
          </button>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div
  key={profile._id}
  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center"
>
  <img
    src={
      profile.profileImage
        ? `http://localhost:5000${profile.profileImage}`
        : "https://via.placeholder.com/150"
    }
    alt={profile.firstName}
    className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg"
  />

  <h3 className="text-xl font-bold text-gray-800 mt-4">
    {profile.firstName} {profile.lastName}
  </h3>

  <p className="text-purple-600 font-semibold">
    {profile.role || "Founder"}
  </p>

  <p className="text-gray-500 text-sm mt-1">
    {profile.industry || "Industry not specified"}
  </p>

  <p className="text-gray-500 text-sm">
    {profile.experience || "Experience not specified"}
  </p>

  <p className="text-gray-600 text-sm mt-3 line-clamp-3">
    {profile.bio || "No bio added"}
  </p>

  <div className="flex flex-wrap justify-center gap-2 mt-3">
    {profile.skills?.slice(0, 3).map((skill, index) => (
      <span
        key={index}
        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
      >
        {skill}
      </span>
    ))}
  </div>

  <button
    className="w-full mt-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-500 hover:to-blue-500 transition flex items-center justify-center gap-2"
  >
    View Profile <FaChevronRight />
  </button>
</div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No profiles found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProfilesPage;
