import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaCircle,
  FaEllipsisV,
  FaSearch,
} from 'react-icons/fa';
import messagesService from '../services/messageService';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useSelector((state) => state.auth);

  // Conversations list
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const menuRef = useRef(null);
  // Messages
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Typing indicator
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations on mount
// Initialize socket and load conversations
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setShowMenu(false);
    }
  };

  document.addEventListener(
    'mousedown',
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      'mousedown',
      handleClickOutside
    );
  };
}, []);

useEffect(() => {
  console.log('🚀 Initializing messages page');
  
  // Initialize socket FIRST (listeners are set up immediately)
  messagesService.initSocket(user?._id);

  // Load conversations
  loadConversations();

  // Register message callback
 

  // Register typing callback
  messagesService.onTyping((data) => {
    setTypingUsers((prev) => ({
      ...prev,
      [data.userId]: data.isTyping,
    }));
  });

  return () => {
    // Don't disconnect - keep connection alive
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?._id]);

useEffect(() => {
const handleMessage = (data) => {

  console.log(
    "MESSAGE FOR:",
    data.conversationId,
    "CURRENT:",
    selectedConversation?._id
  );

  if (
    String(data.conversationId) ===
    String(selectedConversation?._id)
  ) {
    setMessages(prev => {
      const exists = prev.some(
        msg => String(msg._id) === String(data._id)
      );

      if (exists) return prev;

      return [...prev, data];
    });

    scrollToBottom();
  }

  setConversations(prev =>
    prev.map(conv =>
      conv._id === data.conversationId
        ? {
            ...conv,
            lastMessage: data.content,
            lastMessageTime: data.createdAt
          }
        : conv
    )
  );
};

  messagesService.onNewMessage(handleMessage);

}, [selectedConversation]);

  // Auto-select conversation from URL param
 useEffect(() => {
  if (
    conversationId &&
    conversations.length > 0 &&
    !selectedConversation
  ) {
    const conv = conversations.find(
      (c) => c._id === conversationId
    );

    if (conv) {
      console.log("AUTO SELECTING:", conv._id);
      setSelectedConversation(conv);
    }
  }
}, [conversationId, conversations, selectedConversation]);
  // Load selected conversation messages
  useEffect(() => {
    console.log(
    "LOAD EFFECT:",
    selectedConversation?._id
  );
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      messagesService.joinConversation(selectedConversation._id);
      messagesService.markAsRead(selectedConversation._id);

      return () => {
        messagesService.leaveConversation(selectedConversation._id);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  useEffect(() => {
  console.log(
    "SELECTED CONVERSATION CHANGED:",
    selectedConversation?._id
  );
}, [selectedConversation]);


  const handleMuteNotifications = () => {
  localStorage.setItem(
    `muted_${conversationId}`,
    'true'
  );

  toast.success('Notifications muted');
  setShowMenu(false);
};


  const handleDeleteConversation = async () => {
  const confirmed = window.confirm(
    'Delete this conversation?'
  );

  if (!confirmed) return;

  try {
    await messagesService.deleteConversation(
      conversationId
    );

    toast.success('Conversation deleted');
    navigate('/messages');
  } catch (error) {
    toast.error('Failed to delete conversation');
  }

  setShowMenu(false);
};


  const loadConversations = async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadMessages = async (convId) => {
  try {
    setLoadingMsgs(true);
    console.log(`Loading messages for conversation: ${convId}`);
    
    const data = await messagesService.getMessages(convId, 0, 500);
    
    console.log(`Received ${data.messages?.length || 0} messages from service`);
    console.log(`Messages:`, data.messages);
    
    setMessages(data.messages || []);
    
    setTimeout(() => scrollToBottom(), 100);
  } catch (error) {
    console.error('Error loading messages:', error);
    toast.error('Failed to load messages');
  } finally {
    setLoadingMsgs(false);
  }
};

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) {
      return;
    }

    const messageContent = messageText.trim();
    setMessageText('');

    try {
      setSending(true);
      messagesService.sendTyping(selectedConversation._id, false);

      const newMessage = await messagesService.sendMessage(
        selectedConversation._id,
        messageContent
      );

      
      setTimeout(() => scrollToBottom(), 50);
      
     
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessageText(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value) => {
    setMessageText(value);

    if (selectedConversation) {
      messagesService.sendTyping(selectedConversation._id, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        messagesService.sendTyping(selectedConversation._id, false);
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = (conversation) => {
    return conversation.participants?.find((p) => p._id !== user?._id);
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv);
    const name = `${otherUser?.firstName} ${otherUser?.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-0 flex flex-col h-screen">
      <div className="flex-1 flex overflow-hidden gap-0">
        
        {/* ========== CONVERSATIONS SIDEBAR ========== */}
       <div
  className={`
    ${showMobileChat ? 'hidden md:flex' : 'flex'}
    w-full md:w-96
    bg-white/5 border-r border-white/20
    flex-col overflow-hidden
  `}
>
          
          {/* Header - Fixed */}
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition"
            >
              <FaArrowLeft /> Messages
            </button>
            
            {/* Search Box */}
            {searchOpen && (
  <div className="mb-4">
    <input
      type="text"
      placeholder="Search messages..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
    />
  </div>
)}
</div>

          {/* Conversations List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 text-center text-gray-400">
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No conversations yet</p>
                <p className="text-sm">Connect with someone to start chatting!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <button
                    key={conversation._id}
                   onClick={() => {
    console.log("CLICKED:", conversation._id);
    console.log("CURRENT:", selectedConversation?._id);

    setSelectedConversation(conversation);
  setShowMobileChat(true);
}}
                    className={`w-full p-3 border-b border-white/10 text-left transition hover:bg-white/5 ${
                      isSelected ? 'bg-purple-600/40 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        {otherUser?.profileImage ? (
                          <img
                            src={
  otherUser.profileImage
    ? otherUser.profileImage.startsWith("http")
      ? otherUser.profileImage
      : `${API_URL}${otherUser.profileImage}`
    : "https://via.placeholder.com/150"
}
                            alt={otherUser.firstName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-purple-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 text-lg text-white font-bold border border-purple-500">
                            {otherUser?.firstName?.[0]}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {otherUser?.firstName} {otherUser?.lastName}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      {conversation.lastMessageTime && (
                        <p className="text-gray-500 text-xs ml-2 flex-shrink-0">
                          {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========== CHAT AREA ========== */}
        {selectedConversation ? (
          <div
  className={`
    ${showMobileChat ? 'flex' : 'hidden md:flex'}
    flex-1 flex-col overflow-hidden
  `}
>
            
            <div className="p-4 border-b border-white/20 bg-white/5 flex items-center">
  
  {/* Back Button */}
  <button
    onClick={() => setShowMobileChat(false)}
    className="text-purple-400 mr-3"
  >
    <FaArrowLeft />
  </button>

  {/* Avatar */}
  {getOtherUser(selectedConversation)?.profileImage ? (
    <img
      src={
  getOtherUser(selectedConversation)?.profileImage
    ? getOtherUser(selectedConversation).profileImage.startsWith("http")
      ? getOtherUser(selectedConversation).profileImage
      : `${API_URL}${getOtherUser(selectedConversation).profileImage}`
    : "https://via.placeholder.com/150"
}
      alt="User"
      className="w-10 h-10 rounded-full object-cover border border-purple-500"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
      {getOtherUser(selectedConversation)?.firstName?.[0]}
    </div>
  )}

  {/* Name */}
  <div className="ml-3 flex-1">
    <p className="text-white font-semibold text-sm">
      {getOtherUser(selectedConversation)?.firstName}{' '}
      {getOtherUser(selectedConversation)?.lastName}
    </p>
    <p className="text-gray-400 text-xs">Active now</p>
  </div>

  {/* Menu */}
<div
  className="relative"
  ref={menuRef}
>
  <button
    onClick={() => setShowMenu(!showMenu)}
    className="text-gray-400 hover:text-white"
  >
    <FaEllipsisV />
  </button>

  {showMenu && (
    <div className="absolute right-0 top-8 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
      
      <button
        onClick={() => {
  navigate(
    `/founder/${getOtherUser(selectedConversation)?._id}`
  );
  setShowMenu(false);
}}
        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-white"
      >
        👤 View Profile
      </button>

      <button
        onClick={handleMuteNotifications}
        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-white"
      >
        🔕 Mute Notifications
      </button>

      <button
        onClick={() => {
          setSearchOpen(true);
          setShowMenu(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-white"
      >
        🔍 Search Messages
      </button>

      <button
        onClick={handleDeleteConversation}
        className="w-full text-left px-4 py-3 hover:bg-red-700 text-red-400"
      >
        🗑️ Delete Conversation
      </button>

    </div>
  )}
</div>

</div>

            {/* Messages - Scrollable (takes remaining space) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {loadingMsgs ? (
                <div className="text-center text-gray-400">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 m-auto">
                  <p className="text-lg">👋 Start the conversation!</p>
                  <p className="text-sm">Send your first message</p>
                </div>
              ) : (
                messages
  .filter((message) =>
    message.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .map((message) => {
    const isSender =
      String(message.senderId?._id || message.senderId) ===
      String(user?._id);

    return (
      <div
        key={message._id}
        className={`flex ${
          isSender ? 'justify-end' : 'justify-start'
        } animate-fadeIn`}
      >
        <div
          className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-lg text-sm ${
            isSender
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
              : 'bg-gray-700 text-gray-100 rounded-bl-none'
          }`}
        >
          <p className="break-words">{message.content}</p>

          <p className="text-xs mt-1 opacity-60">
            {new Date(message.createdAt).toLocaleTimeString(
              'en-US',
              {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }
            )}
          </p>
        </div>
      </div>
    );
  })
              )}

              {/* Typing indicator */}
              {Object.values(typingUsers).some((typing) => typing) && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Fixed at Bottom */}
            <div className="p-4 border-t border-white/20 bg-white/5 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-semibold"
                >
                  <FaPaperPlane /> Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-center">
            <div>
              <p className="text-gray-300 text-2xl mb-2">💬</p>
              <p className="text-gray-400 text-lg mb-2">Select a conversation</p>
              <p className="text-gray-500 text-sm">Choose a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Add this style for animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;