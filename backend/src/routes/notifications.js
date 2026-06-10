import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMany } from '../config/database.js';

const router = express.Router();

/**
 * Get all notifications for user
 * GET /api/notifications
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const notifications = await getMany(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
