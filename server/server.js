require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Initial MongoDB connection error:', err.message);
});

// Middleware to ensure DB connection is ready in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({
    success: true,
    message: 'Memory Vault API is running successfully on Vercel!',
  });
});

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/memories', '/memories'], memoryRoutes);
app.use(['/api/users', '/users'], userRoutes);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

