const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');


// ============================================
// GET ALL CONVERSATIONS
// ============================================
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'firstName lastName profileImage email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
};

// ============================================
// GET MESSAGES IN CONVERSATION
// ============================================
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { skip = 0, limit = 500 } = req.query;

    console.log(`📥 Fetching messages for conversation: ${conversationId}`);

    const messages = await Message.find({
      conversationId: conversationId,
      isDeleted: false,
    })
      .populate('senderId', 'firstName lastName profileImage _id')
      .populate('receiverId', 'firstName lastName profileImage _id')
      .sort({ createdAt: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Found ${messages.length} messages`);

    const total = await Message.countDocuments({
      conversationId: conversationId,
      isDeleted: false,
    });

    console.log(
  'Messages fetched:',
  conversationId,
  messages.length
);

    res.json({
      success: true,
      messages: messages || [],
      total: total,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, content } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Content and conversation ID required',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    const message = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      content,
      messageType: 'text',
    });

    const savedMessage = await message.save();
    console.log('MESSAGE SAVED:', message);
    await savedMessage.populate('senderId', 'firstName lastName profileImage _id');
    await savedMessage.populate('receiverId', 'firstName lastName profileImage _id');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    });

    // Create notification for receiver
const sender = await User.findById(userId).select('firstName lastName');

const notification = await Notification.create({
  userId: receiverId,
  fromUser: userId,
  type: 'message',
  message: `${sender.firstName} ${sender.lastName} sent you a message`,
});

if (global.io) {
  global.io
    .to(`user_${receiverId}`)
    .emit('notification_received', notification);
}

    // ✅ EMIT TO ALL USERS IN CONVERSATION ROOM
    if (global.io) {
      console.log(`📡 Emitting to room: conversation_${conversationId}`);
      global.io.to(`conversation_${conversationId}`).emit('message_received', {
        _id: savedMessage._id,
        conversationId: savedMessage.conversationId,
        senderId: savedMessage.senderId,
        receiverId: savedMessage.receiverId,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        messageType: savedMessage.messageType,
      });
    }

    if (global.io) {
  global.io.to(receiverId.toString()).emit('new_notification', {
    _id: notification._id,
    type: 'message',
    message: notification.message,
    fromUser: {
      _id: userId,
      firstName: sender.firstName,
      lastName: sender.lastName,
    },
    createdAt: notification.createdAt,
  });
}

    res.json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};
// ============================================
// CREATE OR GET CONVERSATION
// ============================================
exports.createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    }).populate('participants', 'firstName lastName profileImage email');

    if (conversation) {
      return res.json({
        success: true,
        message: 'Conversation found',
        data: conversation,
        isNew: false,
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, otherUserId],
    });

    await conversation.save();
    await conversation.populate('participants', 'firstName lastName profileImage email');

    console.log(`✅ New conversation created: ${userId} - ${otherUserId}`);

    res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: conversation,
      isNew: true,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message,
    });
  }
};

// ============================================
// MARK MESSAGES AS READ
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message,
    });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.deleteMany({
      conversationId,
    });

    await Conversation.findByIdAndDelete(
      conversationId
    );

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.userId,
      isRead: false,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};