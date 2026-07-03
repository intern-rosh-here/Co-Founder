require('dotenv').config();

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

const User = require('./models/User');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("✅ Connected to MongoDB");

  const users = await User.find({
    profileImage: { $regex: '^/uploads/' }
  });

  console.log(`Found ${users.length} users`);

  let migrated = 0;

  for (const user of users) {
    try {
      const imagePath = path.join(__dirname, user.profileImage);

      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Missing: ${imagePath}`);
        continue;
      }

      console.log(`Uploading ${imagePath}`);

      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'profile-images'
      });

      user.profileImage = result.secure_url;

      await user.save();

      migrated++;

      console.log(`✅ ${user.firstName} migrated`);
    } catch (err) {
      console.log(err.message);
    }
  }

  console.log(`\n🎉 Migrated ${migrated} users`);

  process.exit();
}

migrate();