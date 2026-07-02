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
  FaSearch,
  FaSpinner,
  FaEye,
  FaTimes,
  FaBars,
} from 'react-icons/fa';
import communityService from '../services/communityService';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.replace(
    'http://localhost:5000',
    'https://cofounder-matrimony-backend.onrender.com'
  );
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
  });

  const categories = ['All', 'Funding', 'Technical', 'Marketing', 'General', 'Resources', 'Advice'];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPosts(selectedCategory, page);
      setPosts(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const data = new FormData();

data.append('title', formData.title);
data.append('content', formData.content);
data.append('category', formData.category);

selectedFiles.forEach((file) => {
  data.append('media', file);
});



await communityService.createPost(data);

      toast.success('✅ Post created successfully!');
      setFormData({ title: '', content: '', category: 'General' });
      setShowCreateModal(false);
      setPage(1);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      await communityService.likePost(postId);
      loadPosts();
      toast.success(isLiked ? '💔 Unliked!' : '❤️ Liked!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await communityService.deletePost(postId);
        toast.success('✅ Post deleted');
        loadPosts();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/community/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="w-full px-3 sm:px-4 md:max-w-5xl md:mx-auto">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">💬 Community</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
            >
              <FaPlus /> Create
            </button>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">Share ideas, ask questions, and connect</p>
        </div>

        {/* Category Filter - Mobile Responsive */}
        <div className="mb-6">
          {/* Mobile: Dropdown */}
          <div className="md:hidden">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 flex items-center justify-between text-sm"
            >
              <span>{selectedCategory}</span>
              <FaBars />
            </button>
            
            {showCategoryMenu && (
              <div className="absolute top-32 left-0 right-0 bg-slate-900 border border-white/20 rounded-lg mt-2 mx-3 z-40 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Horizontal Scroll */}
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-3 md:space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="text-4xl text-purple-400 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 md:p-12 text-center">
              <p className="text-gray-300 text-base md:text-lg">No posts in this category yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300 font-semibold text-sm md:text-base"
              >
                Be the first to post! →
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const isLiked = post.likedBy?.includes(user?._id);
              const isAuthor = post.userId?._id === user?._id;

              return (
                <div
                  key={post._id}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6 hover:border-purple-500/50 transition cursor-pointer"
                  onClick={() => handleViewPost(post._id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.userId?.profileImage ? (
                          <img
                            src={`${API_URL}${post.userId.profileImage}`}
                            alt={post.userId?.firstName}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {post.userId?.firstName?.[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {post.userId?.firstName} {post.userId?.lastName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="inline-block bg-purple-600/30 text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post._id);
                        }}
                        className="text-red-400 hover:text-red-300 transition flex-shrink-0"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-300 mb-3 text-sm md:text-base line-clamp-3">{post.content}</p>
                    {post.media?.map((file, index) => (
  <div key={index} className="mt-2">
    {file.type === 'image' && (
      <img
        src={`http://localhost:5000${file.url}`}
        alt=""
        className="rounded-lg max-h-64 w-full object-cover"
      />
    )}

    {file.type === 'video' && (
      <video
        controls
        className="rounded-lg max-h-64 w-full"
      >
        <source src={`http://localhost:5000${file.url}`} />
      </video>
    )}

    {file.type === 'document' && (
      <a
        href={`http://localhost:5000${file.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline"
      >
        {file.fileName}
      </a>
    )}
  </div>
))}
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs md:text-sm pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post._id, isLiked);
                      }}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition"
                    >
                      {isLiked ? (
                        <FaHeart className="text-red-400" size={14} />
                      ) : (
                        <FaRegHeart size={14} />
                      )}
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-gray-400">
                      <FaComment size={14} />
                      <span>{post.comments?.length || 0}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <FaEye size={14} />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
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

      {/* Create Post Modal - Mobile Responsive */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl p-4 md:p-8 max-h-96 md:max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Create a Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white md:hidden"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none text-sm md:text-base"
                  placeholder="What's your question or topic?"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Category</label>
                <select
  value={formData.category}
  onChange={(e) =>
    setFormData({ ...formData, category: e.target.value })
  }
  className="w-full bg-slate-800 border border-purple-500 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-400 focus:outline-none text-sm md:text-base"
  style={{
    backgroundColor: '#4c1d95',
    color: 'white',
  }}
>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows="4"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 md:px-4 py-2 focus:border-purple-500 focus:outline-none resize-none text-sm md:text-base"
                  placeholder="Share your thoughts, questions, or insights..."
                />
              </div>

              <div>
  <label className="block text-gray-300 font-semibold mb-2 text-sm md:text-base">
    Photos / Videos / Documents
  </label>

  <input
    type="file"
    multiple
    accept="image/*,video/*,.pdf,.doc,.docx"
    onChange={(e) => setSelectedFiles([...e.target.files])}
    className="w-full text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2"
  />
</div>

              <div className="flex gap-2 md:gap-3">
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

export default CommunityPage;