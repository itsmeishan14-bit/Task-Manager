import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryService.js';

const router = express.Router();

/**
 * Get all categories for user
 * GET /api/categories
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await getUserCategories(req.userId);
    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create new category
 * POST /api/categories
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const newCategory = await createCategory(req.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update category
 * PUT /api/categories/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedCategory = await updateCategory(req.userId, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete category
 * DELETE /api/categories/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await deleteCategory(req.userId, req.params.id);
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
