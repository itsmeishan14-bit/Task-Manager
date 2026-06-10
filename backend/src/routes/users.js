import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getUserById, updateUserProfile, changePassword } from '../services/authService.js';

const router = express.Router();

/**
 * Get current user profile
 * GET /api/users/profile
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await updateUserProfile(req.userId, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Change password
 * POST /api/users/change-password
 */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    await changePassword(req.userId, oldPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
