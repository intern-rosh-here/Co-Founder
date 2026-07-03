import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaSpinner,
  FaTrash,
  FaEye,
  FaPaperPlane,
  FaDollarSign,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGithub,
} from 'react-icons/fa';
import ideaService from '../services/ideaService';
import connectionService from '../services/connectionService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StartupIdeaDetailPage = () => {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('no_connection');

  useEffect(() => {
    loadIdea();
  }, [ideaId]);

  useEffect(() => {
    if (idea?.userId?._id && user?._id) {
      checkConnectionStatus();
    }
  }, [idea, user]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      const data = await ideaService.getIdeaById(ideaId);
      
      setIdea(data.data);
      setIsLiked(data.data.likedBy?.includes(user?._id));
    } catch (error) {
      console.error('Error loading idea:', error);
      toast.error('Failed to load idea');
      navigate('/ideas');
    } finally {
      setLoading(false);
    }
    
  };

  const checkConnectionStatus = async () => {
    try {
      const data = await connectionService.getStatus(idea.userId._id);
      setConnectionStatus(data.status || 'no_connection');
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleConnect = async () => {
    try {
      await connectionService.sendRequest(idea.userId._id);
      setConnectionStatus('pending');
      toast.success('✅ Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await ideaService.addComment(ideaId, commentText);
      setCommentText('');
      loadIdea();
      toast.success('✅ Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    try {
      await ideaService.likeIdea(ideaId);
      loadIdea();
      toast.success(isLiked ? '❤️ Unliked' : '❤️ Liked!');
    } catch (error) {
      toast.error('Failed to like idea');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await ideaService.deleteIdea(ideaId);
        toast.success('✅ Idea deleted');
        navigate('/ideas');
      } catch (error) {
        toast.error('Failed to delete idea');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12 flex items-center justify-center">
        <FaSpinner className="text-4xl text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Idea not found</p>
          <button
            onClick={() => navigate('/ideas')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = idea.userId?._id === user?._id;

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
      <div className="w-full px-3 sm:px-4 md:max-w-4xl md:mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/ideas')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition text-sm md:text-base"
        >
          <FaArrowLeft /> Back to Ideas
        </button>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div>
            {/* Idea Container */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-8">
              
              {/* Idea Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {idea.userId?.profileImage ? (
                    <img
                      src={`${API_URL}${idea.userId.profileImage}`}
                      alt={idea.userId?.firstName}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-purple-600 cursor-pointer hover:scale-110 transition"
                      onClick={() => navigate(`/founder/${idea.userId._id}`)}
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-2xl border-2 border-purple-600 cursor-pointer hover:scale-110 transition"
                      onClick={() => navigate(`/founder/${idea.userId._id}`)}
                    >
                      {idea.userId?.firstName?.[0]}
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg md:text-2xl font-bold text-white cursor-pointer hover:text-purple-300"
                      onClick={() => navigate(`/founder/${idea.userId._id}`)}
                    >
                      {idea.userId?.firstName} {idea.userId?.lastName}
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                      {new Date(idea.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {isAuthor && (
                  <button
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300 transition flex-shrink-0"
                  >
                    <FaTrash size={20} />
                  </button>
                )}
              </div>

              {/* Tags and Stats */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {idea.industry && (
                  <span className="text-xs md:text-sm bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full">
                    {idea.industry}
                  </span>
                )}
                {idea.fundingStage && (
                  <span className={`text-xs md:text-sm px-3 py-1 rounded-full ${getStageColor(idea.fundingStage)}`}>
                    {idea.fundingStage}
                  </span>
                )}
                {idea.status && (
                  <span className={`text-xs md:text-sm px-3 py-1 rounded-full ${getStatusColor(idea.status)}`}>
                    {idea.status}
                  </span>
                )}
              </div>

              {/* Idea Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{idea.title}</h2>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-purple-400 mb-2">Overview</h3>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  {idea.description}
                </p>
              </div>

              {/* Problem & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-red-400 mb-2">🎯 Problem</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-green-400 mb-2">💡 Solution</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {idea.solution}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white/5 rounded-lg p-4 md:p-6 mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-purple-400 mb-4">📊 Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {idea.targetMarket && (
                    <div>
                      <p className="text-gray-400 text-sm">🎯 Target Market</p>
                      <p className="text-white font-semibold text-base">{idea.targetMarket}</p>
                    </div>
                  )}
                  {idea.estimatedFunding && (
                    <div>
                      <p className="text-gray-400 text-sm">💰 Estimated Funding</p>
                      <p className="text-white font-semibold text-base flex items-center gap-2">
                        <FaDollarSign size={16} />
                        ${parseInt(idea.estimatedFunding).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm md:text-base pt-6 border-t border-white/10">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition"
                >
                  {isLiked ? (
                    <FaHeart className="text-red-400" size={18} />
                  ) : (
                    <FaRegHeart size={18} />
                  )}
                  <span>{idea.likes} likes</span>
                </button>

                <div className="flex items-center gap-2 text-gray-400">
                  <FaComment size={18} />
                  <span>{idea.comments?.length || 0} comments</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <FaEye size={18} />
                  <span>{idea.views} views</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
                Comments ({idea.comments?.length || 0})
              </h3>

              {/* Add Comment Form */}
              {user && !isAuthor && (
                <form onSubmit={handleAddComment} className="mb-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6">
                  <div className="flex gap-3">
                    {user?.profileImage ? (
                      <img
                        src={
  user.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${API_URL}${user.profileImage}`
    : "https://via.placeholder.com/150"
}
                        alt={user?.firstName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user?.firstName?.[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm md:text-base mb-2">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your feedback or ask a question..."
                        className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none resize-none text-sm md:text-base"
                        rows="3"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2 text-sm md:text-base"
                        >
                          {submittingComment ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Sign In Prompt */}
              {!user && (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center mb-6">
                  <p className="text-gray-300 mb-3">Sign in to comment</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {idea.comments && idea.comments.length > 0 ? (
                  idea.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6"
                    >
                      <div className="flex items-start gap-3">
                        {comment.userId?.profileImage ? (
                          <img
                            src={`${API_URL}${comment.userId.profileImage}`}
                            alt={comment.userId?.firstName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:scale-110 transition"
                            onClick={() => navigate(`/founder/${comment.userId._id}`)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer hover:scale-110 transition"
                            onClick={() => navigate(`/founder/${comment.userId._id}`)}
                          >
                            {comment.userId?.firstName?.[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm md:text-base cursor-pointer hover:text-purple-300"
                            onClick={() => navigate(`/founder/${comment.userId._id}`)}
                          >
                            {comment.userId?.firstName} {comment.userId?.lastName}
                          </p>
                          <p className="text-gray-400 text-xs md:text-sm mb-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                          <p className="text-gray-300 text-sm md:text-base">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center">
                    <p className="text-gray-400">No comments yet. Be the first to comment!</p>
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

export default StartupIdeaDetailPage;