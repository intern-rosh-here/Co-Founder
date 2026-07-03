require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB...');

  // Set all localhost images to null
  const result = await User.updateMany(
    { profileImage: { $regex: 'localhost' } },
    { $set: { profileImage: null } }
  );

  console.log(`✅ Fixed ${result.modifiedCount} users!`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});