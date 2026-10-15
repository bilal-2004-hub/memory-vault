const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const protect = require('../middleware/authMiddleware');
const { uploadsDirectory } = require('../utils/localImages');
const {
  getMemories,
  createMemory,
  getMemoryById,
  getMemoryImage,
  updateMemory,
  deleteMemory,
  toggleFavorite,
  getOnThisDay,
  searchMemories,
} = require('../controllers/memoryController');

const router = express.Router();
try {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
} catch {
  // Ignore in read-only environment
}
const extensionByMimeType = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${extensionByMimeType[file.mimetype] || ''}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }

    cb(null, true);
  },
});

router.use(protect);
router.get('/on-this-day', getOnThisDay);
router.get('/search', searchMemories);
router.get('/images/:filename', getMemoryImage);
router.get('/', getMemories);
router.post('/', upload.array('images', 10), createMemory);
router.get('/:id', getMemoryById);
router.put('/:id', upload.array('images', 10), updateMemory);
router.delete('/:id', deleteMemory);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
