import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaTrash,
  FaBell,
} from 'react-icons/fa';
import notificationService from '../services/notificationService';
import connectionService from '../services/connectionService';

const NotificationsPage = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    loadNotifications();
    // Initialize Socket.io for real-time notifications
    const socket = notificationService.initSocket(localStorage.getItem('userId'));
    
    notificationService.onNewNotification((data) => {
      console.log('📬 New notification:', data);
      loadNotifications();
    });

    return () => {
      notificationService.disconnectSocket();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      console.log('Notifications Data:', data.data);
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (notification) => {
    console.log(notification);
    try {
      setLoadingAction(notification._id);
      await connectionService.acceptRequest(notification.connectionId);
      toast.success('✅ Connection accepted!');
      await notificationService.markAsRead(notification._id);

setNotifications(prev =>
  prev.map(n =>
    n._id === notification._id
      ? {
          ...n,
          type: 'connection_accepted',
          isRead: true
        }
      : n
  )
);
    } catch (error) {
      toast.error('Failed to accept request');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectRequest = async (notification) => {
  console.log("REJECT NOTIFICATION:", notification);

  try {
    setLoadingAction(notification._id);

    await connectionService.rejectRequest(
      notification.connectionId
    );

    toast.info('Connection request rejected');

   await notificationService.markAsRead(notification._id);

setNotifications(prev =>
  prev.map(n =>
    n._id === notification._id
      ? {
          ...n,
          type: 'connection_rejected',
          isRead: true
        }
      : n
  )
);
  } catch (error) {
    console.error(
      "REJECT ERROR:",
      error.response?.data || error
    );

    toast.error('Failed to reject request');
  } finally {
    setLoadingAction(null);
  }
};

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationService.markAsRead(notification._id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
  try {
    await notificationService.deleteNotification(notificationId);

    setNotifications((prev) =>
      prev.filter((n) => n._id !== notificationId)
    );

    toast.success('Notification deleted');
  } catch (error) {
    toast.error('Failed to delete notification');
  }
};

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return '📨';
      case 'connection_accepted':
        return '✅';
      case 'connection_rejected':
        return '❌';
      case 'liked':
        return '❤️';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'connection_request':
        return 'border-l-yellow-500 bg-yellow-600/10';
      case 'connection_accepted':
        return 'border-l-green-500 bg-green-600/10';
      case 'connection_rejected':
        return 'border-l-red-500 bg-red-600/10';
      case 'liked':
        return 'border-l-red-500 bg-red-600/10';
      case 'message':
        return 'border-l-blue-500 bg-blue-600/10';
      default:
        return 'border-l-blue-500 bg-blue-600/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-white">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={async () => {
                await notificationService.markAllAsRead();
                loadNotifications();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-12 text-center">
            <FaBell className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-xl mb-2">No notifications</p>
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white/10 backdrop-blur-lg border-l-4 border border-white/20 rounded-xl p-6 ${getNotificationColor(
                  notification.type
                )} transition hover:bg-white/15 ${!notification.isRead ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Content */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    {notification.fromUser?.profileImage ? (
                      <img
  src={`http://localhost:5000${notification.fromUser.profileImage}`}
  alt={notification.fromUser.firstName}
  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-purple-600"
  onError={(e) => {
    console.log('Failed image:', e.target.src);
  }}
/>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-lg flex-shrink-0 border-2 border-white/20">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    {/* Message */}
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    
                    {/* Connection Request Actions */}
                    {notification.type === 'connection_request' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(notification)}
                          disabled={loadingAction === notification._id}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                        >
                          {loadingAction === notification._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaCheck /> Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(notification)}
                          disabled={loadingAction === notification._id}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition"
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}

                    {/* View Profile for Other Notifications */}
                    {notification.type === 'message' && (
  <button
    onClick={() => navigate('/messages')}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
  >
    Open Chat
  </button>
)}

                    {/* Mark as Read */}
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition"
                      title="Delete"
                    >
                      <FaTrash />
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

export default NotificationsPage;