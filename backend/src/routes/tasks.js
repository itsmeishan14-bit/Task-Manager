import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getUserTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTaskStats,
  getTaskDetails
} from '../services/taskService.js';

const router = express.Router();

/**
 * Get task stats for user
 * GET /api/tasks/stats
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const stats = await getTaskStats(req.userId, date);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get all tasks for user
 * GET /api/tasks
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, category_id, priority, search } = req.query;
    const tasks = await getUserTasks(req.userId, { status, category_id, priority, search });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get single task details
 * GET /api/tasks/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await getTaskDetails(req.userId, req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create new task
 * POST /api/tasks
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const newTask = await createTask(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update task
 * PUT /api/tasks/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedTask = await updateTask(req.userId, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Complete task
 * PATCH /api/tasks/:id/complete
 */
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const completed = await completeTask(req.userId, req.params.id);
    res.json({
      success: true,
      message: 'Task marked as completed',
      data: completed,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete task (soft delete)
 * DELETE /api/tasks/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await deleteTask(req.userId, req.params.id);
    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
