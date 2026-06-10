import { v4 as uuidv4 } from 'uuid';
import { getMany, insertOne, getOne } from '../config/database.js';

/**
 * Get productivity stats for a date
 */
export const getDailyStats = async (userId, date) => {
  let stats = await getOne(
    `SELECT * FROM productivity_stats WHERE user_id = $1 AND stat_date = $2`,
    [userId, date]
  );

  if (!stats) {
    // Create new stats record
    stats = await insertOne(
      `INSERT INTO productivity_stats (id, user_id, stat_date) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [uuidv4(), userId, date]
    );
  }

  return stats;
};

/**
 * Update daily stats
 */
export const updateDailyStats = async (userId, date, updates) => {
  const allowedFields = [
    'completed_tasks_count',
    'pending_tasks_count',
    'overdue_tasks_count',
    'total_hours_worked',
    'productivity_score',
    'focus_hours',
    'streak_count',
  ];

  const updateFields = [];
  const values = [userId, date];
  let paramIndex = 3;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  return insertOne(
    `UPDATE productivity_stats 
     SET ${updateFields.join(', ')} 
     WHERE user_id = $1 AND stat_date = $2 
     RETURNING *`,
    values
  );
};

/**
 * Get weekly statistics
 */
export const getWeeklyStats = async (userId, startDate, endDate) => {
  return getMany(
    `SELECT * FROM productivity_stats 
     WHERE user_id = $1 AND stat_date BETWEEN $2 AND $3
     ORDER BY stat_date ASC`,
    [userId, startDate, endDate]
  );
};

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return getMany(
    `SELECT * FROM productivity_stats 
     WHERE user_id = $1 AND stat_date BETWEEN $2 AND $3
     ORDER BY stat_date ASC`,
    [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
  );
};

/**
 * Calculate productivity score
 */
export const calculateProductivityScore = async (userId, date) => {
  const completed = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND status = 'completed' 
     AND DATE(completion_time) = $2`,
    [userId, date]
  );

  const totalTasks = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND DATE(due_date) = $2 OR DATE(created_at) = $2`,
    [userId, date]
  );

  const completedCount = parseInt(completed?.count || 0);
  const totalCount = parseInt(totalTasks?.count || 0);

  if (totalCount === 0) return 0;

  return (completedCount / totalCount) * 10;
};

/**
 * Get streak information
 */
export const getStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const results = await getMany(
    `SELECT DISTINCT stat_date 
     FROM productivity_stats 
     WHERE user_id = $1 
     ORDER BY stat_date DESC 
     LIMIT 365`,
    [userId]
  );

  if (results.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  for (const result of results) {
    const resultDate = new Date(result.stat_date);
    const diffDays = Math.floor((currentDate - resultDate) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
      currentDate = new Date(resultDate);
    } else {
      break;
    }
  }

  return streak;
};
