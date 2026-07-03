require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected...');
  
  await User.updateMany(
    { profileImage: { $regex: 'localhost' } },
    { $set: { profileImage: null } }
  );
  
  console.log('✅ Fixed all broken image URLs!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});