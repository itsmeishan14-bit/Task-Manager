import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMany } from '../config/database.js';

const router = express.Router();

/**
 * Get calendar events for a date range
 * GET /api/calendar/events
 */
router.get('/events', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const events = await getMany(
      `SELECT * FROM calendar_events 
       WHERE user_id = $1 AND event_date BETWEEN $2 AND $3
       ORDER BY event_date ASC, start_time ASC`,
      [req.userId, startDate, endDate]
    );

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
