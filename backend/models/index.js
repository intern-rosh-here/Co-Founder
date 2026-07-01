const User = require('./User');

// Import your Conversation and Message models
// Adjust based on where they are located
let Conversation, Message;

try {
  // If they're in separate files
  Conversation = require('./Conversation');
  Message = require('./Message');
} catch (err) {
  console.warn('Could not import Conversation/Message from separate files');
}

module.exports = {
  User,
  Conversation,
  Message,
};