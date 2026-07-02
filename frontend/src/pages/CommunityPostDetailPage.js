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

const CommunityPostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPostById(postId);
      setPost(data.data);
      setIsLiked(data.data.likedBy?.includes(user?._id));
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Failed to load post');
      navigate('/community');
    } finally {
      setLoading(false);
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
      await communityService.addComment(postId, commentText);
      setCommentText('');
      loadPost();
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
      await communityService.likePost(postId);
      loadPost();
      toast.success(isLiked ? '❤️ Unliked' : '❤️ Liked!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await communityService.deletePost(postId);
        toast.success('✅ Post deleted');
        navigate('/community');
      } catch (error) {
        toast.error('Failed to delete post');
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Post not found</p>
          <button
            onClick={() => navigate('/community')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = post.userId?._id === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="w-full px-3 sm:px-4 md:max-w-3xl md:mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition text-sm md:text-base"
        >
          <FaArrowLeft /> Back to Community
        </button>

        {/* Post Container */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-8">
          
          {/* Post Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {post.userId?.profileImage ? (
                <img
                  src={`${API_URL}${post.userId.profileImage}`}
                  alt={post.userId?.firstName}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-purple-600"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-2xl border-2 border-purple-600">
                  {post.userId?.firstName?.[0]}
                </div>
              )}
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">
                  {post.userId?.firstName} {post.userId?.lastName}
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  {new Date(post.createdAt).toLocaleString()}
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

          {/* Category & Stats */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-purple-600/30 text-purple-200 text-xs md:text-sm font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-gray-400 text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <FaEye size={14} />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>

          {/* Post Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{post.title}</h2>

          {/* Post Content */}
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Media Display */}
          {post.media && post.media.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.media.map((file, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    {file.type === 'image' && (
                      <img
                        src={`${API_URL}${file.url}`}
                        alt="Post media"
                        className="w-full h-auto object-cover rounded-lg hover:scale-105 transition"
                      />
                    )}

                    {file.type === 'video' && (
                      <video
                        controls
                        className="w-full rounded-lg"
                      >
                        <source src={`${API_URL}${file.url}`} />
                        Your browser does not support the video tag.
                      </video>
                    )}

                    {file.type === 'document' && (
                      <a
                        href={`${API_URL}${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-blue-600/30 text-blue-200 p-4 rounded-lg hover:bg-blue-600/40 transition text-center"
                      >
                        📄 {file.fileName}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Like and Comment Stats */}
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
              <span>{post.likes} likes</span>
            </button>

            <div className="flex items-center gap-2 text-gray-400">
              <FaComment size={18} />
              <span>{post.comments?.length || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
            Comments ({post.comments?.length || 0})
          </h3>

          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="mb-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6">
              <div className="flex gap-3">
                {user?.profileImage ? (
                  <img
                    src={`${API_URL}${user.profileImage}`}
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
                    placeholder="Share your thoughts..."
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

          {/* Comments List */}
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

          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 md:p-6"
                >
                  <div className="flex items-start gap-3">
                    {comment.userId?.profileImage ? (
                      <img
                        src={`${API_URL}${comment.userId.profileImage}`}
                        alt={comment.userId?.firstName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {comment.userId?.firstName?.[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm md:text-base">
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
  );
};

export default CommunityPostDetailPage;