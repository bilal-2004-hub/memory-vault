require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs/promises');
const Memory = require('../models/Memory');
const connectDB = require('../config/db');
const { uploadsDirectory, getLocalImageUrl } = require('../utils/localImages');

const extensionByMimeType = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const migrateLocalImages = async () => {
  await connectDB();
  await fs.mkdir(uploadsDirectory, { recursive: true });

  let migratedCount = 0;
  const memories = await Memory.find({});

  for (const memory of memories) {
    let changed = false;
    const images = [];

    for (const image of memory.images || []) {
      const match = typeof image === 'string'
        ? image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/)
        : null;

      if (!match) {
        images.push(image);
        continue;
      }

      const filename = `${crypto.randomUUID()}${extensionByMimeType[match[1]]}`;
      await fs.writeFile(`${uploadsDirectory}/${filename}`, Buffer.from(match[2], 'base64'));
      images.push(getLocalImageUrl(filename));
      migratedCount += 1;
      changed = true;
    }

    if (changed) {
      memory.images = images;
      await memory.save();
    }
  }

  console.log(`Migrated ${migratedCount} image(s) to server/uploads.`);
};

migrateLocalImages()
  .catch((error) => {
    console.error('Image migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => connectDB.disconnectDB());