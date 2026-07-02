import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSearch,
  FaLightbulb,
  FaUsers,
  FaHeart,
  FaComment,
  FaCalendarAlt,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.replace(
    'http://localhost:5000',
    'https://cofounder-matrimony-backend.onrender.com'
  );
};

const FounderPostsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [founder, setFounder] = useState(null);

  const [communityPosts, setCommunityPosts] = useState([]);

  const [startupIdeas, setStartupIdeas] = useState([]);

  const [activeTab, setActiveTab] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFounderPosts();
  }, [userId]);

  const loadFounderPosts = async () => {
    try {
      setLoading(true);

      // Founder Details

      const founderRes = await fetch(
        `${API_URL}/profiles/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const founderData = await founderRes.json();

      setFounder(founderData.data);

      // Community Posts

      const postsRes = await fetch(
        `${API_URL}/community?authorId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const postsData = await postsRes.json();

      setCommunityPosts(postsData.data || []);

      // Startup Ideas

      const ideasRes = await fetch(
        `${API_URL}/ideas?createdBy=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ideasData = await ideasRes.json();

      setStartupIdeas(ideasData.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load founder posts.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = communityPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIdeas = startupIdeas.filter(
    (idea) =>
      idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allPosts =
    activeTab === "all"
      ? [...filteredPosts, ...filteredIdeas]
      : activeTab === "posts"
      ? filteredPosts
      : filteredIdeas;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">

          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>

          <p className="text-gray-300 text-lg">
            Loading Founder Posts...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-6">

      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="flex items-center gap-5 mb-10">

          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-white transition"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1 className="text-4xl font-black text-white">

              {founder?.firstName} {founder?.lastName}

            </h1>

            <p className="text-gray-300 mt-2">

              Community Posts & Startup Ideas

            </p>

          </div>

        </div>

        {/* Search */}

        <div className="relative mb-10">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search founder posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />

        </div>

        {/* Tabs */}

        <div className="flex gap-8 border-b border-white/20 mb-10">

          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 font-semibold transition ${
              activeTab === "all"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All ({communityPosts.length + startupIdeas.length})
          </button>

          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-4 font-semibold transition ${
              activeTab === "posts"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Community ({communityPosts.length})
          </button>

          <button
            onClick={() => setActiveTab("ideas")}
            className={`pb-4 font-semibold transition ${
              activeTab === "ideas"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Ideas ({startupIdeas.length})
          </button>

        </div>

        {/* Posts */}

        <div className="space-y-6">
                      {allPosts.length > 0 ? (
            allPosts.map((item) => (
              <div
                key={item._id}
                onClick={() =>
                  navigate(
                    item.problemStatement
                      ? `/ideas/${item._id}`
                      : `/community/${item._id}`
                  )
                }
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:scale-[1.01] transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">

                  <div>

                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        item.problemStatement
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {item.problemStatement ? (
                        <>
                          <FaLightbulb />
                          Startup Idea
                        </>
                      ) : (
                        <>
                          <FaUsers />
                          Community Post
                        </>
                      )}
                    </span>

                  </div>

                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <FaCalendarAlt />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                </div>

                {/* Title */}

                <h2 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h2>

                {/* Content */}

                <p className="text-gray-300 leading-7 mb-6 line-clamp-2">
                  {item.description || item.content}
                </p>

                {/* Footer */}

                <div className="flex flex-wrap gap-6 text-gray-400 text-sm">

                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-400" />
                    {item.likes || 0} Likes
                  </div>

                  <div className="flex items-center gap-2">
                    <FaComment className="text-green-400" />
                    {item.comments?.length || 0} Comments
                  </div>

                  {item.industry && (
                    <div>
                      🏢 {item.industry}
                    </div>
                  )}

                  {item.fundingStage && (
                    <div>
                      💰 {item.fundingStage}
                    </div>
                  )}

                </div>

              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-16 text-center">

              <h2 className="text-3xl text-white font-bold mb-4">
                No Posts Found
              </h2>

              <p className="text-gray-300 text-lg">
                {searchQuery
                  ? "No posts match your search."
                  : "This founder hasn't shared anything yet."}
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default FounderPostsPage;