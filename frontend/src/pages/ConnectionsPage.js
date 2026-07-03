import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import connectionService from "../services/connectionService";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ConnectionsPage = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const res = await connectionService.getConnections("accepted");
      setConnections(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 px-8 pb-10">

      <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
    Founder Network
</h1>

<p className="text-gray-400 text-lg mb-10">
    Build meaningful relationships with entrepreneurs and co-founders.
</p>

      {connections.length === 0 ? (
        <div className="bg-white/10 rounded-xl p-10 text-center text-gray-300">
          No Connections Yet
        </div>
      ) : (
        <div className="space-y-5">

          {connections.map((conn) => (

            <div
              key={conn._id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-8 py-5 flex items-center justify-between"
            >

              <div className="flex items-center gap-5">

                <img
                  src={
  user.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${API_URL}${user.profileImage}`
    : "https://via.placeholder.com/150"
}
                  className="w-16 h-16 rounded-full object-cover"
                  alt=""
                />

                <h2 className="text-white text-xl font-semibold">
                  {conn.otherUser?.firstName} {conn.otherUser?.lastName}
                </h2>

              </div>

              <button
  onClick={() => navigate(`/profile/${conn.otherUser._id}`)}
  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-semibold"
>
  View
</button>

            </div>

          ))}

        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;