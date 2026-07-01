const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectionController = require('../controllers/connectionController');

// Send connection request
router.post('/send', auth, connectionController.sendConnectionRequest);

// Get connection status with specific user
router.get('/status/:otherUserId', auth, connectionController.getConnectionStatus);

// Accept connection request
router.post('/accept', auth, connectionController.acceptConnectionRequest);

// Reject connection request
router.post('/reject', auth, connectionController.rejectConnectionRequest);

// Get all connections (by status)
router.get('/', auth, connectionController.getConnections);

// Get pending requests
router.get('/pending', auth, connectionController.getPendingRequests);

// Cancel connection request (I sent)
router.post('/cancel', auth, connectionController.cancelConnectionRequest);

// Unconnect
router.post('/unconnect', auth, connectionController.unconnect);

// Start conversation
router.post('/start-conversation', auth, connectionController.startConversation);

module.exports = router;