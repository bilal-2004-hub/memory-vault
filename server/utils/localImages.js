const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const uploadsDirectory = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(__dirname, '../uploads');
const imageUrlPrefix = '/memories/images/';

const getLocalImageUrl = (filename) => `${imageUrlPrefix}${path.basename(filename)}`;

const getLocalImagePath = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith(imageUrlPrefix)) return null;

  const filename = imageUrl.slice(imageUrlPrefix.length);
  if (!filename || filename !== path.basename(filename)) return null;

  return path.join(uploadsDirectory, filename);
};

const removeLocalImages = async (images = []) => {
  await Promise.all(
    images.map(async (image) => {
      const imagePath = getLocalImagePath(image);
      if (!imagePath) return;

      try {
        await fs.unlink(imagePath);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    })
  );
};

module.exports = { uploadsDirectory, getLocalImageUrl, getLocalImagePath, removeLocalImages };