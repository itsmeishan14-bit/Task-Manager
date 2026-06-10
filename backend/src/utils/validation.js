/**
 * Input Validation Utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // 3-30 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

export const validateTaskTitle = (title) => {
  return title && title.trim().length > 0 && title.length <= 255;
};

export const validatePriority = (priority) => {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
};

export const validateTaskStatus = (status) => {
  return ['not_started', 'in_progress', 'completed', 'overdue', 'cancelled', 'archived'].includes(status);
};

export const validateDueDate = (dueDate) => {
  const date = new Date(dueDate);
  return date instanceof Date && !isNaN(date);
};

export const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim();
};

export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
