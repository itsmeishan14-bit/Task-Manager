import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserById, 
  createOrUpdateGoogleUser 
} from '../services/authService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Register endpoint
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required',
      });
    }

    const user = await registerUser(email, username, password);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
 * Login endpoint
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const { user, token } = await loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Google OAuth callback
 * POST /api/auth/google/callback
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { googleId, email, username, avatarUrl } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required',
      });
    }

    const { user, token } = await createOrUpdateGoogleUser(
      googleId,
      email,
      username || email.split('@')[0],
      avatarUrl
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Verify token endpoint
 * GET /api/auth/verify
 */
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);

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

export default router;
