require('dotenv').config();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Memory = require('../models/Memory');

const seedData = async () => {
  console.log('🌱 Starting MongoDB Data Seeder...\n');

  await connectDB();

  const demoEmail = 'demo@memoryvault.com';
  let user = await User.findOne({ email: demoEmail });

  if (!user) {
    console.log(`Creating demo user: ${demoEmail}...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    user = await User.create({
      fullName: 'Bilal Demo',
      email: demoEmail,
      password: hashedPassword,
      bio: 'Memory Vault explorer and traveler.',
      preferences: { theme: 'light', notifications: true },
    });
    console.log(`✔ Demo user created! (Email: ${demoEmail}, Password: password123)`);
  } else {
    console.log(`✔ Using existing demo user: ${demoEmail}`);
  }

  const sampleMemories = [
    {
      userId: user._id,
      title: 'Trip to Hunza Valley',
      description: 'An unforgettable road trip through the Karakoram highway with friends. Spectacular mountain views and apricots everywhere.',
      date: new Date('2024-06-15'),
      location: 'Hunza Valley, Gilgit-Baltistan',
      mood: '🤩 Amazing',
      tags: ['Travel', 'Adventure', 'Mountains', 'Friends'],
      images: [],
      isFavorite: true,
    },
    {
      userId: user._id,
      title: 'University Graduation Day',
      description: 'Four years of hard work, late night study sessions, and incredible memories culminated in this special day.',
      date: new Date('2023-11-20'),
      location: 'University Campus',
      mood: '🔥 Proud',
      tags: ['University', 'Graduation', 'Achievement'],
      images: [],
      isFavorite: true,
    },
    {
      userId: user._id,
      title: 'Family Eid Celebration',
      description: 'Gathered with the whole family, enjoyed delicious sheer khurma, and shared laughter and stories all afternoon.',
      date: new Date('2024-04-10'),
      location: 'Family Home',
      mood: '❤️ Loved',
      tags: ['Family', 'Eid', 'Celebration'],
      images: [],
      isFavorite: false,
    },
    {
      userId: user._id,
      title: 'Peaceful Evening at the Beach',
      description: 'Watched the sunset over the Arabian Sea. The gentle sea breeze and calm waves were just what I needed after a busy week.',
      date: new Date('2024-09-05'),
      location: 'Clifton Beach',
      mood: '😌 Peaceful',
      tags: ['Travel', 'Nature', 'Sunset'],
      images: [],
      isFavorite: false,
    },
  ];

  let addedCount = 0;
  for (const memoryData of sampleMemories) {
    const exists = await Memory.findOne({ userId: user._id, title: memoryData.title });
    if (!exists) {
      await Memory.create(memoryData);
      console.log(`   ✔ Added memory: "${memoryData.title}"`);
      addedCount++;
    } else {
      console.log(`   ℹ Memory already exists: "${memoryData.title}" (Skipped)`);
    }
  }

  console.log(`\n🎉 Seeding completed! Added ${addedCount} new sample memory(ies).`);
  console.log('----------------------------------------------------');
  console.log('Demo Login Credentials:');
  console.log(`📧 Email:    ${demoEmail}`);
  console.log('🔑 Password: password123');
  console.log('----------------------------------------------------\n');
};

seedData()
  .catch((err) => {
    console.error('❌ Seeding error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    connectDB.disconnectDB().catch(() => {});
  });
