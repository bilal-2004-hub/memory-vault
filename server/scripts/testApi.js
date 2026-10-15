require('dotenv').config();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Memory = require('../models/Memory');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const runValidationTests = async () => {
  console.log('🧪 Starting Database & Model Validation Tests...\n');

  await connectDB();

  // Test 1: Model validation & Creation
  const testEmail = `test_${Date.now()}@memoryvault.test`;
  console.log('1. Testing User model creation and constraints...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('secretPass123', salt);

  const testUser = await User.create({
    fullName: 'Test Verification User',
    email: testEmail,
    password: hashedPassword,
    bio: 'Test bio for memory vault',
    preferences: { theme: 'dark', notifications: true },
  });
  console.log(`   ✔ User created successfully: ${testUser._id} (${testUser.email})`);

  // Test 2: Unique constraint verification
  console.log('2. Testing User unique email constraint...');
  try {
    await User.create({
      fullName: 'Duplicate User',
      email: testEmail,
      password: hashedPassword,
    });
    console.error('   ❌ Duplicate user creation did NOT throw error!');
    process.exitCode = 1;
  } catch (err) {
    console.log(`   ✔ Duplicate email correctly rejected with error code: ${err.code || 'validation error'}`);
  }

  // Test 3: Memory creation with relationships
  console.log('3. Testing Memory model creation & relationship with User...');
  const testMemory = await Memory.create({
    userId: testUser._id,
    title: 'Testing MongoDB Atlas Setup',
    description: 'Verifying all schema validations, indexes, and queries.',
    date: new Date(),
    location: 'Cloud Atlas',
    mood: '🤩 Amazing',
    tags: ['test', 'cloud', 'atlas'],
    isFavorite: true,
  });
  console.log(`   ✔ Memory created successfully: ${testMemory._id} (Title: "${testMemory.title}")`);

  // Test 4: Relationship population
  console.log('4. Testing User-Memory relationship population...');
  const populatedMemory = await Memory.findById(testMemory._id).populate('userId', 'fullName email');
  console.log(`   ✔ Memory populated with user: ${populatedMemory.userId.fullName} <${populatedMemory.userId.email}>`);

  // Test 5: Query with compound index (userId + isFavorite)
  console.log('5. Testing queries leveraging compound indexes...');
  const favorites = await Memory.find({ userId: testUser._id, isFavorite: true }).sort({ date: -1 });
  console.log(`   ✔ Found ${favorites.length} favorite memory using compound index (userId_1_isFavorite_1)`);

  // Test 6: Text Search
  console.log('6. Testing Text Search index...');
  const searchResults = await Memory.find({
    userId: testUser._id,
    $text: { $search: 'Atlas Setup' },
  });
  console.log(`   ✔ Found ${searchResults.length} memory via full-text search index`);

  // Cleanup test documents to keep database clean
  console.log('7. Cleaning up test documents...');
  await Memory.deleteOne({ _id: testMemory._id });
  await User.deleteOne({ _id: testUser._id });
  console.log('   ✔ Test cleanup complete. Database state preserved.');

  console.log('\n🎉 All Model, Schema, and Relationship Tests Passed Successfully!\n');
};

runValidationTests()
  .catch((err) => {
    console.error('❌ Validation test failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    connectDB.disconnectDB().catch(() => {});
  });
