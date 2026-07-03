
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaTrash,
  FaEye,
  FaSpinner,
  FaDollarSign,
  FaTimes,
  FaChevronDown,
} from 'react-icons/fa';
import ideaService from '../services/ideaService';


const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BACKEND_URL =
  API_URL.replace("/api", "");

const StartupIdeasPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [ideas, setIdeas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    industry: '',
    fundingStage: '',
    status: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    solution: '',
    targetMarket: '',
    industry: '',
    fundingStage: 'Idea',
    estimatedFunding: '',
  });

  const industries = ['Tech', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Other'];
  const fundingStages = ['Idea', 'MVP', 'Prototype', 'Pre-Launch', 'Launched'];
  const statuses = ['Active', 'Seeking Co-founder', 'Paused', 'Launched'];

  useEffect(() => {
    loadIdeas();
  }, [filters, page]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const data = await ideaService.getIdeas(
        filters.industry || null,
        filters.fundingStage || null,
        filters.status || null,
        page
      );
      setIdeas(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.problemStatement ||
      !formData.solution
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await ideaService.createIdea(formData);
      toast.success('✅ Idea posted successfully!');
      setFormData({
        title: '',
        description: '',
        problemStatement: '',
        solution: '',
        targetMarket: '',
        industry: '',
        fundingStage: 'Idea',
        estimatedFunding: '',
      });
      setShowCreateModal(false);
      setPage(1);
      loadIdeas();
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error(error.message || 'Failed to create idea');
    }
  };

  const handleLike = async (ideaId, isLiked) => {
    try {
      await ideaService.likeIdea(ideaId);
      loadIdeas();
     toast.success(isLiked ? '💔 Unliked!' : '❤️ Liked!');
    } catch (error) {
      toast.error('Failed to like idea');
    }
  };

  const handleDelete = async (ideaId) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await ideaService.deleteIdea(ideaId);
        toast.success('✅ Idea deleted');
        loadIdeas();
      } catch (error) {
        toast.error('Failed to delete idea');
      }
    }
  };

  const handleViewIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}`);
  };

  const getStageColor = (stage) => {
    const colors = {
      Idea: 'bg-blue-600/30 text-blue-200',
      MVP: 'bg-purple-600/30 text-purple-200',
      Prototype: 'bg-pink-600/30 text-pink-200',
      'Pre-Launch': 'bg-yellow-600/30 text-yellow-200',
      Launched: 'bg-green-600/30 text-green-200',
    };
    return colors[stage] || 'bg-gray-600/30 text-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-600/30 text-green-200',
      'Seeking Co-founder': 'bg-blue-600/30 text-blue-200',
      Paused: 'bg-yellow-600/30 text-yellow-200',
      Launched: 'bg-purple-600/30 text-purple-200',
    };
    return colors[status] || 'bg-gray-600/30 text-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="w-full px-3 sm:px-4 md:max-w-6xl md:mx-auto">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">🚀 Startup Ideas</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
            >
              <FaPlus /> Post Idea
            </button>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">Share your startup ideas and find co-founders</p>
        </div>

        {/* Filters - Mobile Responsive */}
        <div className="mb-6">
          {/* Mobile: Collapsible Filters */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 shadow-md"            >
              <span className="text-sm font-semibold">Filters</span>
              <FaChevronDown size={14} className={`transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="space-y-3 mt-3">
                <select
                  value={filters.industry}
                  onChange={(e) => {
                    setFilters({ ...filters, industry: e.target.value });
                    setPage(1);
                  }}
                 className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.fundingStage}
                  onChange={(e) => {
                    setFilters({ ...filters, fundingStage: e.target.value });
                    setPage(1);
                  }}
                  className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="">All Stages</option>
                  {fundingStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setPage(1);
                  }}
                  className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Desktop: Side by Side Filters */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            <select
              value={filters.industry}
              onChange={(e) => {
                setFilters({ ...filters, industry: e.target.value });
                setPage(1);
              }}
              className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            <select
              value={filters.fundingStage}
              onChange={(e) => {
                setFilters({ ...filters, fundingStage: e.target.value });
                setPage(1);
              }}
             className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
            >
              <option value="">All Stages</option>
              {fundingStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ideas Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <FaSpinner className="text-4xl text-purple-400 animate-spin" />
            </div>
          ) : ideas.length === 0 ? (
            <div className="col-span-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 md:p-12 text-center">
              <p className="text-gray-300 text-base md:text-lg">No ideas found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300 font-semibold text-sm md:text-base"
              >
                Be the first to share an idea! →
              </button>
            </div>
          ) : (
            ideas.map((idea) => {
              const isLiked = idea.likedBy?.includes(user?._id);
              const isAuthor = idea.userId?._id === user?._id;

              return (
                <div
                  key={idea._id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6 hover:border-purple-500/50 transition cursor-pointer flex flex-col"
                  onClick={() => handleViewIdea(idea._id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {idea.userId?.profileImage ? (
                          <img
  src={`${BACKEND_URL}${idea.userId.profileImage}`}
  alt={idea.userId?.firstName}
  className="w-8 h-8 rounded-full object-cover"
/>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {idea.userId?.firstName?.[0]}
                          </div>
                        )}
                        <p className="text-white font-semibold text-xs md:text-sm truncate">
                          {idea.userId?.firstName} {idea.userId?.lastName}
                        </p>
                      </div>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idea._id);
                        }}
                        className="text-red-400 hover:text-red-300 transition flex-shrink-0"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{idea.title}</h3>

                  {/* Description */}
                  <p className="text-gray-300 mb-3 line-clamp-2 flex-1 text-sm md:text-base">{idea.description}</p>

                  {/* Problem */}
                  <div className="bg-white/5 rounded-lg p-2 md:p-3 mb-3">
                    <p className="text-gray-400 text-xs md:text-sm line-clamp-1">
                      <span className="font-semibold">Problem:</span> {idea.problemStatement}
                    </p>
                  </div>

                  {/* Tags - Responsive */}
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
                    {idea.industry && (
                      <span className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                        {idea.industry}
                      </span>
                    )}
                    {idea.fundingStage && (
                      <span className={`text-xs px-2 py-1 rounded ${getStageColor(idea.fundingStage)}`}>
                        {idea.fundingStage}
                      </span>
                    )}
                    {idea.status && (
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </span>
                    )}
                  </div>

                  {/* Funding */}
                  {idea.estimatedFunding && (
                    <div className="mb-3 flex items-center gap-2 text-purple-300 text-sm">
                      <FaDollarSign size={14} />
                      <span>${parseInt(idea.estimatedFunding).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs md:text-sm pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(idea._id, isLiked);
                      }}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition"
                    >
                      {isLiked ? (
                        <FaHeart className="text-red-400" size={14} />
                      ) : (
                        <FaRegHeart size={14} />
                      )}
                      <span>{idea.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-gray-400">
                      <FaComment size={14} />
                      <span>{idea.comments?.length || 0}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <FaEye size={14} />
                      <span>{idea.views}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 md:gap-2 mt-6 md:mt-8 overflow-x-auto pb-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2 md:px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition flex-shrink-0 ${
                  page === p
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Idea Modal - Mobile Responsive */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl p-4 md:p-8 max-h-96 md:max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Post Your Idea</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white md:hidden"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Idea Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="Give your idea a name"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none resize-none text-sm md:text-base"
                  placeholder="Brief overview"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Problem Statement *</label>
                <textarea
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  rows="2"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none resize-none text-sm md:text-base"
                  placeholder="What problem does it solve?"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Solution *</label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  rows="2"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none resize-none text-sm md:text-base"
                  placeholder="How will you solve it?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    <option value="">Select</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Stage</label>
                  <select
                    value={formData.fundingStage}
                    onChange={(e) => setFormData({ ...formData, fundingStage: e.target.value })}
                    className="w-full bg-purple-900 border border-purple-500 text-white rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none text-sm"
                  >
                    {fundingStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Target Market</label>
                  <input
                    type="text"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                    placeholder="Who is your market?"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Est. Funding</label>
                  <input
                    type="number"
                    value={formData.estimatedFunding}
                    onChange={(e) => setFormData({ ...formData, estimatedFunding: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition text-sm md:text-base"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupIdeasPage;