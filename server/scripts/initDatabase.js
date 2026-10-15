require('dotenv').config();
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Memory = require('../models/Memory');

const verifyAndInitDatabase = async () => {
  const activeUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log('====================================================');
  console.log('🔍 MongoDB Atlas Database & Collections Configurator');
  console.log('====================================================');

  if (!activeUri) {
    console.warn('⚠️ Neither MONGODB_URI nor MONGO_URI is defined in your environment files.');
    console.warn('   Defaulting to local fallback URI: mongodb://127.0.0.1:27017/memory-vault');
  } else {
    // Mask credentials for safe logging
    const maskedUri = activeUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
    console.log(`📡 Target URI: ${maskedUri}`);
  }

  console.log('\n🔌 Connecting to MongoDB...');
  const conn = await connectDB();
  const db = conn.connection.db;
  const dbName = conn.connection.name;

  console.log(`✅ Connected successfully to: ${conn.connection.host}`);
  console.log(`📂 Active Database: "${dbName}"`);

  console.log('\n----------------------------------------------------');
  console.log('📋 Existing Collections Inspection:');
  console.log('----------------------------------------------------');
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map((c) => c.name);

  if (existingCollectionNames.length === 0) {
    console.log('   No existing collections found in this database yet.');
  } else {
    for (const col of existingCollections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   - "${col.name}" (Existing documents: ${count})`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log('🛠️ Creating Missing Collections (Safe & Non-Destructive):');
  console.log('----------------------------------------------------');
  const requiredCollections = [
    { name: 'users', model: User, description: 'Stores user accounts, credentials, profiles, and preferences' },
    { name: 'memories', model: Memory, description: 'Stores user memories, journals, moods, tags, locations, and images' },
  ];

  for (const item of requiredCollections) {
    if (existingCollectionNames.includes(item.name)) {
      console.log(`   ✔ Collection "${item.name}" already exists. Preserved existing data!`);
    } else {
      await db.createCollection(item.name);
      console.log(`   ✨ Created collection "${item.name}" successfully!`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log('⚡ Synchronizing and Building Schema Indexes:');
  console.log('----------------------------------------------------');
  for (const item of requiredCollections) {
    console.log(`   Building indexes for "${item.name}"...`);
    await item.model.createIndexes();
    const indexes = await db.collection(item.name).indexes();
    console.log(`   Indexes for "${item.name}":`);
    indexes.forEach((idx) => {
      const keys = Object.entries(idx.key)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const flags = [];
      if (idx.unique) flags.push('unique');
      if (idx.weights) flags.push('text-search');
      const flagStr = flags.length ? ` (${flags.join(', ')})` : '';
      console.log(`     • ${idx.name} [ ${keys} ]${flagStr}`);
    });
  }

  console.log('\n----------------------------------------------------');
  console.log('🧪 Testing Model Queries (Read Verification):');
  console.log('----------------------------------------------------');
  const userCount = await User.countDocuments();
  const memoryCount = await Memory.countDocuments();
  console.log(`   ✔ User.countDocuments(): ${userCount} record(s)`);
  console.log(`   ✔ Memory.countDocuments(): ${memoryCount} record(s)`);

  console.log('\n====================================================');
  console.log('🎉 All Collections & Indexes Successfully Configured!');
  console.log('====================================================\n');
};

verifyAndInitDatabase()
  .catch((err) => {
    console.error('\n❌ Database initialization error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    connectDB.disconnectDB().catch(() => {});
  });
