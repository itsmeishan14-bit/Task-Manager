import { v4 as uuidv4 } from 'uuid';
import { getMany, insertOne, executeQuery } from '../config/database.js';

/**
 * Get all categories for user
 */
export const getUserCategories = async (userId) => {
  return getMany(
    `SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC`,
    [userId]
  );
};

/**
 * Create new category
 */
export const createCategory = async (userId, categoryData) => {
  const { name, color = '#3B82F6', icon, description } = categoryData;

  return insertOne(
    `INSERT INTO categories (id, user_id, name, color, icon, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [uuidv4(), userId, name, color, icon, description]
  );
};

/**
 * Update category
 */
export const updateCategory = async (userId, categoryId, updates) => {
  const allowedFields = ['name', 'color', 'icon', 'description'];
  const updateFields = [];
  const values = [userId, categoryId];
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
    `UPDATE categories SET ${updateFields.join(', ')} 
     WHERE id = $2 AND user_id = $1 
     RETURNING *`,
    values
  );
};

/**
 * Delete category
 */
export const deleteCategory = async (userId, categoryId) => {
  await executeQuery(
    `UPDATE tasks SET category_id = NULL WHERE category_id = $1 AND user_id = $2`,
    [categoryId, userId]
  );

  await executeQuery(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
    [categoryId, userId]
  );

  return true;
};

/**
 * Get all tags for user
 */
export const getUserTags = async (userId) => {
  return getMany(
    `SELECT * FROM tags WHERE user_id = $1 ORDER BY name ASC`,
    [userId]
  );
};

/**
 * Create new tag
 */
export const createTag = async (userId, tagData) => {
  const { name, color = '#8B5CF6' } = tagData;

  return insertOne(
    `INSERT INTO tags (id, user_id, name, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [uuidv4(), userId, name, color]
  );
};

/**
 * Delete tag
 */
export const deleteTag = async (userId, tagId) => {
  await executeQuery(
    `DELETE FROM task_tags WHERE tag_id = $1`,
    [tagId]
  );

  await executeQuery(
    `DELETE FROM tags WHERE id = $1 AND user_id = $2`,
    [tagId, userId]
  );

  return true;
};
