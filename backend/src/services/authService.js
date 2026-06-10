import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getOne, insertOne, executeQuery } from '../config/database.js';
import { 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  sanitizeObject 
} from '../utils/validation.js';

/**
 * Register a new user
 */
export const registerUser = async (email, username, password) => {
  // Validation
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validateUsername(username)) {
    throw new Error('Username must be 3-30 characters (alphanumeric and underscores only)');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  // Check if user already exists
  const existingUser = await getOne(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with default category
  const userId = uuidv4();
  const newUser = await insertOne(
    `INSERT INTO users (id, email, username, password_hash) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, email, username, created_at`,
    [userId, email, username, hashedPassword]
  );

  // Create default category
  await insertOne(
    `INSERT INTO categories (id, user_id, name, is_default) 
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, 'Default', true]
  );

  // Create user level record
  await insertOne(
    `INSERT INTO user_levels (id, user_id) VALUES ($1, $2)`,
    [uuidv4(), userId]
  );

  return newUser;
};

/**
 * Authenticate user with email and password
 */
export const loginUser = async (email, password) => {
  const user = await getOne(
    `SELECT id, email, username, password_hash, avatar_url, timezone, theme_preference 
     FROM users WHERE email = $1`,
    [email]
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await executeQuery(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  // Return user data without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * Generate JWT Token
 */
export const generateToken = (userId, email) => {
  const token = jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }
  );

  return token;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await getOne(
    `SELECT id, email, username, avatar_url, timezone, theme_preference, language,
            daily_goal, weekly_goal, monthly_goal, notifications_enabled, created_at 
     FROM users WHERE id = $1`,
    [userId]
  );

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const sanitized = sanitizeObject(updates);
  const allowedFields = [
    'username',
    'avatar_url',
    'timezone',
    'theme_preference',
    'language',
    'daily_goal',
    'weekly_goal',
    'monthly_goal',
    'notifications_enabled',
  ];

  const updateFields = [];
  const values = [userId];
  let paramIndex = 2;

  for (const [key, value] of Object.entries(sanitized)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const updatedUser = await insertOne(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = $1 
     RETURNING id, email, username, avatar_url, timezone, theme_preference, language`,
    values
  );

  return updatedUser;
};

/**
 * Change password
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  if (!validatePassword(newPassword)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  const user = await getOne(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await executeQuery(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, userId]
  );

  return true;
};

/**
 * Create or update Google OAuth user
 */
export const createOrUpdateGoogleUser = async (googleId, email, username, avatarUrl) => {
  // Check if user exists with this Google ID
  let user = await getOne(
    'SELECT id, email, username, avatar_url FROM users WHERE google_id = $1',
    [googleId]
  );

  if (user) {
    // Update existing user
    user = await insertOne(
      `UPDATE users SET avatar_url = $1, last_login = CURRENT_TIMESTAMP 
       WHERE google_id = $2 
       RETURNING id, email, username, avatar_url, timezone, theme_preference`,
      [avatarUrl, googleId]
    );
  } else {
    // Check if email already exists
    let existingUser = await getOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      // Link Google ID to existing user
      user = await insertOne(
        `UPDATE users SET google_id = $1, avatar_url = $2, last_login = CURRENT_TIMESTAMP 
         WHERE email = $3 
         RETURNING id, email, username, avatar_url, timezone, theme_preference`,
        [googleId, avatarUrl, email]
      );
    } else {
      // Create new user
      const userId = uuidv4();
      user = await insertOne(
        `INSERT INTO users (id, email, username, google_id, avatar_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, username, avatar_url, timezone, theme_preference`,
        [userId, email, username, googleId, avatarUrl]
      );

      // Create default category
      await insertOne(
        `INSERT INTO categories (id, user_id, name, is_default) 
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), userId, 'Default', true]
      );

      // Create user level record
      await insertOne(
        `INSERT INTO user_levels (id, user_id) VALUES ($1, $2)`,
        [uuidv4(), userId]
      );
    }
  }

  const token = generateToken(user.id, user.email);

  return {
    user,
    token,
  };
};
