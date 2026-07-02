import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaHeart,
  FaRegHeart,
  FaArrowRight,
} from 'react-icons/fa';

const FounderCard = ({ founder, onAddFavorite, isFavorite }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition transform hover:scale-105">
      {/* Header with Image */}
      <div className="relative h-40 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
        {founder.profileImage ? (
          <img
            src={getImageUrl(founder.profileImage)} alt="profile"
            alt={founder.firstName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">👤</div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onAddFavorite(founder._id)}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name & Role */}
        <h3 className="text-xl font-bold text-white mb-1">
          {founder.firstName} {founder.lastName}
        </h3>
        <p className="text-purple-400 text-sm mb-3">
          {founder.professionalRole || 'Founder'}
        </p>

        {/* Bio */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {founder.bio || 'No bio added yet'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {founder.industry && (
            <span className="bg-purple-600/50 text-white text-xs px-2 py-1 rounded">
              {founder.industry}
            </span>
          )}
          {founder.experience && (
            <span className="bg-blue-600/50 text-white text-xs px-2 py-1 rounded">
              {founder.experience}
            </span>
          )}
        </div>

        {/* Location */}
        {founder.locationCity && (
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
            <FaMapMarkerAlt className="text-purple-400" />
            <span>{founder.locationCity}, {founder.locationCountry}</span>
          </div>
        )}

        {/* Skills */}
        {founder.skills && founder.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {founder.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {founder.skills.length > 3 && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{founder.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <button
          onClick={() => navigate(`/founder/${founder._id}`)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          View Profile <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default FounderCard;