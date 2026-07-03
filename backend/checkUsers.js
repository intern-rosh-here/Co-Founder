require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected...');

  // Show first 3 users to see all fields
  const users = await User.find().limit(3);
  users.forEach(user => {
    console.log('User:', JSON.stringify(user, null, 2));
  });

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});