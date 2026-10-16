const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongoMemoryServer;

const ensureCollectionsAndIndexes = async (conn) => {
  try {
    const db = conn.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    // Safely create collections if they don't already exist (preserves existing data)
    const requiredCollections = ['users', 'memories'];
    for (const name of requiredCollections) {
      if (!existingNames.includes(name)) {
        await db.createCollection(name);
        console.log(`Created MongoDB collection: ${name}`);
      }
    }

    // Safely drop any stale/foreign indexes (such as old studentId_1 from previous projects)
    try {
      const usersCollection = db.collection('users');
      const userIndexes = await usersCollection.indexes();
      for (const idx of userIndexes) {
        if (idx.name === 'studentId_1') {
          await usersCollection.dropIndex('studentId_1');
          console.log('Successfully dropped stale index: studentId_1');
        }
      }
    } catch (indexDropError) {
      console.warn('Index clean check notice:', indexDropError.message);
    }

    // Build/sync indexes safely
    const User = require('../models/User');
    const Memory = require('../models/Memory');
    await Promise.all([
      User.createIndexes().catch((err) => console.warn('User index creation notice:', err.message)),
      Memory.createIndexes().catch((err) => console.warn('Memory index creation notice:', err.message)),
    ]);
  } catch (error) {
    console.warn('Collection/index check notice:', error.message);
  }
};

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  // Support both MONGODB_URI and MONGO_URI
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/memory-vault';

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        dbName: process.env.DB_NAME || 'memory-vault',
      })
      .then(async (conn) => {
        console.log(`MongoDB connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
        await ensureCollectionsAndIndexes(conn);
        return conn;
      })
      .catch(async (error) => {
        // In serverless / Vercel, in-memory MongoDB server cannot run
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          console.error('MongoDB connection failed in production:', error.message);
          throw error;
        }

        console.warn('Primary MongoDB connection failed, trying in-memory MongoDB fallback...');

        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const dbPath = path.resolve(__dirname, '../data/mongodb');
          await fs.mkdir(dbPath, { recursive: true });
          mongoMemoryServer = await MongoMemoryServer.create({
            instance: { dbPath },
          });
          const conn = await mongoose.connect(mongoMemoryServer.getUri());
          console.log(`MongoDB connected via memory server: ${conn.connection.host} (Database: ${conn.connection.name})`);
          await ensureCollectionsAndIndexes(conn);
          return conn;
        } catch (fallbackError) {
          console.error('MongoDB connection failed:', fallbackError.message);
          process.exit(1);
        }
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

module.exports = connectDB;
module.exports.ensureCollectionsAndIndexes = ensureCollectionsAndIndexes;
module.exports.disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  cached.conn = null;
  cached.promise = null;
};
