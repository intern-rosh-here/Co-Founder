require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');

  const users = await User.find({
    profileImage: { $regex: 'localhost:5000' }
  });

  console.log(`Found ${users.length} users with localhost images`);

  for (const user of users) {
    user.profileImage = user.profileImage.replace(
      'http://localhost:5000',
      'https://cofounder-matrimony-backend.onrender.com'
    );
    await user.save();
    console.log(`Fixed: ${user.email}`);
  }

  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});