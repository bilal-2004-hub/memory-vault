const Memory = require('../models/Memory');
const { getLocalImageUrl, getLocalImagePath, removeLocalImages } = require('../utils/localImages');

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatMemoryResponse = (memory) => ({
  ...memory.toObject(),
  date: memory.date ? new Date(memory.date).toISOString() : null,
});

const getMemories = async (req, res, next) => {
  try {
    const { mood, tag, year, favorite, location, q } = req.query;
    const filter = { userId: req.user._id };

    if (mood) filter.mood = mood;
    if (favorite !== undefined) filter.isFavorite = favorite === 'true';
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (tag) filter.tags = { $in: [tag] };
    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      filter.date = { $gte: start, $lt: end };
    }

    let memories = await Memory.find(filter).sort({ date: -1 });

    if (q) {
      memories = memories.filter((memory) => {
        const haystack = [
          memory.title,
          memory.description,
          Array.isArray(memory.tags) ? memory.tags.join(' ') : '',
          memory.location,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(q.toLowerCase());
      });
    }

    return res.json({
      success: true,
      data: memories.map(formatMemoryResponse),
    });
  } catch (error) {
    next(error);
  }
};

const createMemory = async (req, res, next) => {
  try {
    const { title, description, date, location, mood, tags, isFavorite } = req.body;

    if (!title || !description || !date) {
      await removeLocalImages((req.files || []).map((file) => getLocalImageUrl(file.filename)));
      return res.status(400).json({
        success: false,
        message: 'Title, description and date are required',
      });
    }

    const normalizedTags = parseArrayField(tags).map((tag) => String(tag).trim()).filter(Boolean);
    const uploadedImages = (req.files || []).map((file) => getLocalImageUrl(file.filename));

    const memory = await Memory.create({
      userId: req.user._id,
      title,
      description,
      date: new Date(date),
      location: location || '',
      mood: mood || '😊 Happy',
      tags: normalizedTags,
      images: uploadedImages,
      isFavorite: Boolean(isFavorite),
    });

    return res.status(201).json({
      success: true,
      message: 'Memory created successfully',
      data: formatMemoryResponse(memory),
    });
  } catch (error) {
    await removeLocalImages((req.files || []).map((file) => getLocalImageUrl(file.filename))).catch(() => {});
    next(error);
  }
};

const getMemoryById = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    return res.json({
      success: true,
      data: formatMemoryResponse(memory),
    });
  } catch (error) {
    next(error);
  }
};

const getMemoryImage = async (req, res, next) => {
  try {
    const imageUrl = getLocalImageUrl(req.params.filename);
    const memory = await Memory.findOne({ userId: req.user._id, images: imageUrl });

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const imagePath = getLocalImagePath(imageUrl);
    if (!imagePath) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    return res.sendFile(imagePath, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
};

const updateMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      await removeLocalImages((req.files || []).map((file) => getLocalImageUrl(file.filename)));
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    const { title, description, date, location, mood, tags, existingImages, isFavorite } = req.body;

    if (title) memory.title = title;
    if (description) memory.description = description;
    if (date) memory.date = new Date(date);
    if (location !== undefined) memory.location = location;
    if (mood) memory.mood = mood;
    if (tags !== undefined) memory.tags = parseArrayField(tags).map((tag) => String(tag).trim()).filter(Boolean);
    const previousImages = [...memory.images];
    if (existingImages !== undefined || req.files?.length) {
      const retainedImages = parseArrayField(existingImages).filter((image) => previousImages.includes(image));
      memory.images = [
        ...retainedImages,
        ...(req.files || []).map((file) => getLocalImageUrl(file.filename)),
      ];
    }
    if (isFavorite !== undefined) memory.isFavorite = Boolean(isFavorite);

    await memory.save();
    await removeLocalImages(previousImages.filter((image) => !memory.images.includes(image)));

    return res.json({
      success: true,
      message: 'Memory updated successfully',
      data: formatMemoryResponse(memory),
    });
  } catch (error) {
    next(error);
  }
};

const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    await removeLocalImages(memory.images);
    await memory.deleteOne();

    return res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    memory.isFavorite = !memory.isFavorite;
    await memory.save();

    return res.json({
      success: true,
      message: 'Favorite updated successfully',
      data: formatMemoryResponse(memory),
    });
  } catch (error) {
    next(error);
  }
};

const getOnThisDay = async (req, res, next) => {
  try {
    const memories = await Memory.find({ userId: req.user._id }).sort({ date: -1 });
    const today = new Date();
    const currentYear = today.getFullYear();

    const results = memories.filter((memory) => {
      const date = new Date(memory.date);
      const yearDifference = currentYear - date.getFullYear();

      return (
        yearDifference >= 1 &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });

    return res.json({
      success: true,
      data: results.map(formatMemoryResponse),
    });
  } catch (error) {
    next(error);
  }
};

const searchMemories = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const memories = await Memory.find({ userId: req.user._id }).sort({ date: -1 });

    const matched = memories.filter((memory) => {
      const haystack = [
        memory.title,
        memory.description,
        memory.location,
        (memory.tags || []).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q.toLowerCase());
    });

    return res.json({
      success: true,
      data: matched.map(formatMemoryResponse),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemories,
  createMemory,
  getMemoryById,
  getMemoryImage,
  updateMemory,
  deleteMemory,
  toggleFavorite,
  getOnThisDay,
  searchMemories,
};
