const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
// ============================================
// SEND CONNECTION REQUEST
// ============================================
exports.sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required',
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send connection request to yourself',
      });
    }

    // Check if user exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check for existing connection
    const existingConnection = await Connection.findOne({
  $or: [
    { senderId, receiverId },
    { senderId: receiverId, receiverId: senderId },
  ],
});

if (existingConnection) {
  if (existingConnection.status === 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Connection request already pending',
    });
  }

  if (existingConnection.status === 'accepted') {
    return res.status(400).json({
      success: false,
      message: 'Already connected',
    });
  }

  if (existingConnection.status === 'rejected') {
    await Connection.findByIdAndDelete(existingConnection._id);
  }
}

    // Create connection request
    const connection = new Connection({
      senderId,
      receiverId,
      status: 'pending',
    });

    await connection.save();

    // Create notification for receiver
    const senderUser = await User.findById(senderId);
    const notification = new Notification({
      userId: receiverId,
      type: 'connection_request',
      fromUser: senderId,
      connectionId: connection._id,
      message: `${senderUser.firstName} ${senderUser.lastName} sent you a connection request`,
    });

    await notification.save();

    console.log(`✅ Connection request sent from ${senderId} to ${receiverId}`);

    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      data: connection,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request',
      error: error.message,
    });
  }
};

// ============================================
// GET CONNECTION STATUS
// ============================================
exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    if (!connection) {
      return res.json({
        success: true,
        status: 'no_connection',
        data: null,
      });
    }

    // Determine button status
    let buttonStatus = '';
    if (connection.status === 'pending') {
      buttonStatus =
        connection.senderId.toString() === userId.toString()
          ? 'pending'
          : 'request_received';
    } else if (connection.status === 'accepted') {
      buttonStatus = 'connected';
    } else if (connection.status === 'rejected') {
      buttonStatus = 'no_connection';
    }

    res.json({
      success: true,
      status: connection.status,
      buttonStatus,
      connection,
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status',
      error: error.message,
    });
  }
};

// ============================================
// ACCEPT CONNECTION REQUEST
// ============================================
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId)
      .populate('senderId', 'firstName lastName profileImage email')
      .populate('receiverId', 'firstName lastName profileImage email');

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found',
      });
    }

    if (connection.receiverId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept ${connection.status} request`,
      });
    }

    // Update connection status
    connection.status = 'accepted';
    connection.respondedAt = new Date();
    await connection.save();

    await Notification.updateMany(
  {
    connectionId: connection._id,
    type: 'connection_request'
  },
  {
    type: 'connection_accepted',
    isRead: true
  }
);
    


const existingConversation = await Conversation.findOne({
  participants: {
    $all: [
      connection.senderId._id,
      connection.receiverId._id
    ]
  }
});

if (!existingConversation) {
  await Conversation.create({
    participants: [
      connection.senderId._id,
      connection.receiverId._id
    ]
  });

  console.log(
    `💬 Conversation created between ${connection.senderId._id} and ${connection.receiverId._id}`
  );
}

    // Create notification for sender
    const receiverUser = await User.findById(userId);
    const notification = new Notification({
      userId: connection.senderId._id,
      type: 'connection_accepted',
      fromUser: userId,
      connectionId: connection._id,
      message: `${receiverUser.firstName} ${receiverUser.lastName} accepted your connection request`,
    });

    await notification.save();

    console.log(
      `✅ Connection accepted between ${connection.senderId._id} and ${userId}`
    );

    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connection,
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection request',
      error: error.message,
    });
  }
};

// ============================================
// REJECT CONNECTION REQUEST
// ============================================
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId)
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName');

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found',
      });
    }

    if (connection.receiverId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject ${connection.status} request`,
      });
    }

    // Update connection status
    connection.status = 'rejected';
    connection.respondedAt = new Date();
    await connection.save();

    await Notification.updateMany(
  {
    connectionId: connection._id,
    type: 'connection_request'
  },
  {
    type: 'connection_rejected',
    isRead: true
  }
);

    // Create notification for sender
    const receiverUser = await User.findById(userId);
    const notification = new Notification({
      userId: connection.senderId._id,
      type: 'connection_rejected',
      fromUser: userId,
      connectionId: connection._id,
      message: `${receiverUser.firstName} ${receiverUser.lastName} rejected your connection request`,
    });

    await notification.save();

    console.log(
      `❌ Connection rejected between ${connection.senderId._id} and ${userId}`
    );

    res.json({
      success: true,
      message: 'Connection request rejected',
      data: connection,
    });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject connection request',
      error: error.message,
    });
  }
};

// ============================================
// GET ALL CONNECTIONS
// ============================================
exports.getConnections = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'accepted' } = req.query;

    const connections = await Connection.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status,
    })
      .populate('senderId', 'firstName lastName profileImage email')
      .populate('receiverId', 'firstName lastName profileImage email')
      .sort({ createdAt: -1 });

    // Extract other user from each connection
    const connectionsWithOtherUser = connections.map((conn) => ({
      ...conn.toObject(),
      otherUser:
        conn.senderId._id.toString() === userId.toString()
          ? conn.receiverId
          : conn.senderId,
    }));

    res.json({
      success: true,
      data: connectionsWithOtherUser,
      count: connections.length,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections',
      error: error.message,
    });
  }
};

// ============================================
// GET PENDING REQUESTS
// ============================================
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const pendingRequests = await Connection.find({
      receiverId: userId,
      status: 'pending',
    })
      .populate('senderId', 'firstName lastName profileImage email industry')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message,
    });
  }
};

// ============================================
// CANCEL CONNECTION REQUEST (Sent by me)
// ============================================
exports.cancelConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found',
      });
    }

    if (connection.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only sender can cancel request',
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests',
      });
    }

    // Delete connection
    await Connection.findByIdAndDelete(connectionId);

    console.log(`🗑️ Connection request cancelled`);

    res.json({
      success: true,
      message: 'Connection request cancelled',
    });
  } catch (error) {
    console.error('Error cancelling connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel connection request',
      error: error.message,
    });
  }
};

// ============================================
// UNCONNECT
// ============================================
exports.unconnect = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.body;

    const connection = await Connection.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      status: 'accepted',
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    // Delete connection
    await Connection.findByIdAndDelete(connection._id);

    console.log(`🔗 Disconnected between ${userId} and ${otherUserId}`);

    res.json({
      success: true,
      message: 'Disconnected successfully',
    });
  } catch (error) {
    console.error('Error unconnecting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unconnect',
      error: error.message,
    });
  }
};

// ============================================
// START CONVERSATION (Auto-create if connected)
// ============================================
exports.startConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Check if users are connected
    const connection = await Connection.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId, status: 'accepted' },
        { senderId: otherUserId, receiverId: userId, status: 'accepted' },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: 'You must be connected to message this user',
      });
    }

    // TODO: Get or create conversation from Conversation model
    // This will be handled by messageController
    
    res.json({
      success: true,
      message: 'Conversation ready',
      data: { userId: otherUserId },
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message,
    });
  }
};