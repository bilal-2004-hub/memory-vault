const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongoMemoryServer;

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/memory-vault';

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
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
          console.log(`MongoDB connected via memory server: ${conn.connection.host}`);
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
module.exports.disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  cached.conn = null;
  cached.promise = null;
};

