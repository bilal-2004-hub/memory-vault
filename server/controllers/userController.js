const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.json({
    success: true,
    data: user,
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, profilePicture, bio, preferences, notifications, theme, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use',
        });
      }

      user.email = email.toLowerCase();
    }

    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bio !== undefined) user.bio = bio;

    if (!user.preferences) {
      user.preferences = { theme: 'light', notifications: true };
    }
    if (preferences && typeof preferences === 'object') {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.notifications !== undefined) user.preferences.notifications = Boolean(preferences.notifications);
    }
    if (notifications !== undefined) user.preferences.notifications = Boolean(notifications);
    if (theme) user.preferences.theme = theme;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current and new passwords are required to change password',
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
