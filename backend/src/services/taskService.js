import { v4 as uuidv4 } from 'uuid';
import { getMany, insertOne, getOne, executeQuery } from '../config/database.js';

/**
 * Get all tasks for a user with filters
 */
export const getUserTasks = async (userId, filters = {}) => {
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color,
           (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtasks_count,
           (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND is_completed = true) as completed_subtasks_count
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1 AND t.deleted_at IS NULL
  `;

  const params = [userId];
  let paramIndex = 2;

  if (filters.status && filters.status !== 'all') {
    query += ` AND t.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.category_id) {
    query += ` AND t.category_id = $${paramIndex}`;
    params.push(filters.category_id);
    paramIndex++;
  }

  if (filters.priority && filters.priority !== 'all') {
    query += ` AND t.priority = $${paramIndex}`;
    params.push(filters.priority);
    paramIndex++;
  }

  if (filters.search) {
    query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.due_date) {
    query += ` AND DATE(t.due_date) = $${paramIndex}`;
    params.push(filters.due_date);
    paramIndex++;
  }

  query += ` ORDER BY t.due_date ASC, t.priority DESC LIMIT 1000`;

  return getMany(query, params);
};

/**
 * Create a new task
 */
export const createTask = async (userId, taskData) => {
  const taskId = uuidv4();
  const {
    title,
    description,
    category_id,
    priority = 'medium',
    due_date,
    due_time,
    estimated_hours,
    repeat_option,
    tags = [],
  } = taskData;

  const task = await insertOne(
    `INSERT INTO tasks (
      id, user_id, title, description, category_id, priority, 
      due_date, due_time, estimated_hours, repeat_option
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      taskId,
      userId,
      title,
      description,
      category_id || null,
      priority,
      due_date || null,
      due_time || null,
      estimated_hours || null,
      repeat_option || 'none',
    ]
  );

  // Add tags
  for (const tagId of tags) {
    await insertOne(
      `INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [taskId, tagId]
    );
  }

  // Create task history record
  await insertOne(
    `INSERT INTO task_history (id, user_id, task_id, action) 
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, taskId, 'created']
  );

  return task;
};

/**
 * Update a task
 */
export const updateTask = async (userId, taskId, updates) => {
  const updateFields = [];
  const values = [userId, taskId];
  let paramIndex = 3;

  const allowedFields = [
    'title', 'description', 'category_id', 'priority', 'status',
    'due_date', 'due_time', 'estimated_hours', 'actual_hours',
    'progress_percentage', 'repeat_option', 'color_label'
  ];

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

  const task = await insertOne(
    `UPDATE tasks SET ${updateFields.join(', ')} 
     WHERE id = $2 AND user_id = $1 
     RETURNING *`,
    values
  );

  // Create history record
  await insertOne(
    `INSERT INTO task_history (id, user_id, task_id, action) 
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, taskId, 'updated']
  );

  return task;
};

/**
 * Complete a task
 */
export const completeTask = async (userId, taskId) => {
  const now = new Date();
  
  const task = await updateTask(userId, taskId, {
    status: 'completed',
  });

  // Calculate completion time
  const taskCreated = await getOne(
    'SELECT created_at FROM tasks WHERE id = $1',
    [taskId]
  );

  if (taskCreated) {
    const completionMinutes = Math.round(
      (now.getTime() - new Date(taskCreated.created_at).getTime()) / 60000
    );

    await insertOne(
      `INSERT INTO task_history (id, user_id, task_id, action, completion_time_minutes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), userId, taskId, 'completed', completionMinutes]
    );
  }

  return task;
};

/**
 * Delete a task (soft delete)
 */
export const deleteTask = async (userId, taskId) => {
  await executeQuery(
    'UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );

  await insertOne(
    `INSERT INTO task_history (id, user_id, task_id, action) 
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, taskId, 'deleted']
  );

  return true;
};

/**
 * Get task with full details
 */
export const getTaskDetails = async (userId, taskId) => {
  const task = await getOne(
    `SELECT t.*, c.name as category_name, c.color as category_color
     FROM tasks t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
    [taskId, userId]
  );

  if (!task) return null;

  // Get tags
  const tags = await getMany(
    `SELECT t.* FROM tags t
     INNER JOIN task_tags tt ON t.id = tt.tag_id
     WHERE tt.task_id = $1`,
    [taskId]
  );

  // Get subtasks
  const subtasks = await getMany(
    `SELECT * FROM subtasks WHERE task_id = $1 ORDER BY order_index ASC`,
    [taskId]
  );

  // Get notes
  const notes = await getOne(
    `SELECT * FROM notes WHERE task_id = $1`,
    [taskId]
  );

  // Get attachments
  const attachments = await getMany(
    `SELECT * FROM attachments WHERE task_id = $1`,
    [taskId]
  );

  return {
    ...task,
    tags,
    subtasks,
    notes,
    attachments,
  };
};

/**
 * Add subtask
 */
export const addSubtask = async (taskId, title) => {
  const maxOrder = await getOne(
    'SELECT MAX(order_index) as max_order FROM subtasks WHERE task_id = $1',
    [taskId]
  );

  const orderIndex = (maxOrder?.max_order || 0) + 1;

  return insertOne(
    `INSERT INTO subtasks (id, task_id, title, order_index) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [uuidv4(), taskId, title, orderIndex]
  );
};

/**
 * Toggle subtask completion
 */
export const toggleSubtask = async (subtaskId, isCompleted) => {
  return insertOne(
    `UPDATE subtasks SET is_completed = $1, completed_at = $2 
     WHERE id = $3 
     RETURNING *`,
    [isCompleted, isCompleted ? new Date() : null, subtaskId]
  );
};

/**
 * Add note to task
 */
export const addNote = async (taskId, content, markdownContent) => {
  return insertOne(
    `INSERT INTO notes (id, task_id, content, markdown_content) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [uuidv4(), taskId, content, markdownContent]
  );
};

/**
 * Get task statistics for user
 */
export const getTaskStats = async (userId, date) => {
  const stats = {
    completed_today: 0,
    pending_today: 0,
    overdue: 0,
    in_progress: 0,
    total_tasks: 0,
  };

  // Completed today
  const completed = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND status = 'completed' 
     AND DATE(completion_time) = $2 AND deleted_at IS NULL`,
    [userId, date]
  );
  stats.completed_today = parseInt(completed?.count || 0);

  // Pending today
  const pending = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND status IN ('not_started', 'in_progress')
     AND DATE(due_date) = $2 AND deleted_at IS NULL`,
    [userId, date]
  );
  stats.pending_today = parseInt(pending?.count || 0);

  // Overdue
  const overdue = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled')
     AND due_date < NOW()::DATE AND deleted_at IS NULL`,
    [userId]
  );
  stats.overdue = parseInt(overdue?.count || 0);

  // In progress
  const inProgress = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND status = 'in_progress' AND deleted_at IS NULL`,
    [userId]
  );
  stats.in_progress = parseInt(inProgress?.count || 0);

  // Total tasks
  const total = await getOne(
    `SELECT COUNT(*) as count FROM tasks 
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  stats.total_tasks = parseInt(total?.count || 0);

  return stats;
};
