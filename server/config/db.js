const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);

    // Check if database needs initial seeding
    const User = require('../models/User');
    const Post = require('../models/Post');
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    if (userCount === 0 || postCount === 0) {
      console.log('Database missing starter records. Auto-seeding...');
      const seedData = require('../seed');
      await seedData(false);
      console.log('✅ Initial records seeded successfully.');
    }
    return conn;
  } catch (error) {
    console.warn(`⚠️ Could not connect to external MongoDB at ${uri} (${error.message})`);
    console.log('🚀 Starting embedded MongoDB (MongoMemoryServer)...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'uniconnect'
        }
      }).catch(async () => {
        // In case port 27017 is held, use default dynamic port
        return await MongoMemoryServer.create({
          instance: {
            dbName: 'uniconnect'
          }
        });
      });

      const baseUri = mongod.getUri();
      const memoryUri = baseUri.endsWith('/') ? `${baseUri}uniconnect` : `${baseUri}/uniconnect`;
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Running & Connected at: ${memoryUri}`);

      // Seed data into the fresh embedded database
      console.log('🌱 Populating initial database records...');
      const seedData = require('../seed');
      await seedData(false);
      console.log('✅ Embedded MongoDB is ready and fully seeded!');

      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start embedded MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
