import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getOne } from '../config/database.js';

const router = express.Router();

/**
 * Get productivity stats for a specific date
 * GET /api/analytics/stats
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required',
      });
    }

    const stats = await getOne(
      `SELECT * FROM productivity_stats 
       WHERE user_id = $1 AND stat_date = $2`,
      [req.userId, date]
    );

    res.json({
      success: true,
      data: stats || {
        completed_tasks_count: 0,
        pending_tasks_count: 0,
        overdue_tasks_count: 0,
        total_hours_worked: 0,
        productivity_score: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
