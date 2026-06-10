import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email, username, password) =>
    api.post('/auth/register', { email, username, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  verify: () => api.get('/auth/verify'),
  
  googleCallback: (googleId, email, username, avatarUrl) =>
    api.post('/auth/google/callback', { googleId, email, username, avatarUrl }),
};

// Tasks API calls
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  
  create: (data) => api.post('/tasks', data),
  
  update: (id, data) => api.put(`/tasks/${id}`, data),
  
  delete: (id) => api.delete(`/tasks/${id}`),
  
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  
  getSubtasks: (taskId) => api.get(`/tasks/${taskId}/subtasks`),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  
  create: (data) => api.post('/categories', data),
  
  update: (id, data) => api.put(`/categories/${id}`, data),
  
  delete: (id) => api.delete(`/categories/${id}`),
};

// Calendar API calls
export const calendarAPI = {
  getEvents: (startDate, endDate) =>
    api.get('/calendar/events', { params: { startDate, endDate } }),
};

// Analytics API calls
export const analyticsAPI = {
  getStats: (date) => api.get('/analytics/stats', { params: { date } }),
  
  getWeeklyStats: (startDate, endDate) =>
    api.get('/analytics/weekly', { params: { startDate, endDate } }),
  
  getMonthlyStats: (month) =>
    api.get('/analytics/monthly', { params: { month } }),
};

// Notifications API calls
export const notificationsAPI = {
  getAll: (limit, offset) =>
    api.get('/notifications', { params: { limit, offset } }),
  
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// Users API calls
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data) => api.put('/users/profile', data),
  
  changePassword: (oldPassword, newPassword) =>
    api.post('/users/change-password', { oldPassword, newPassword }),
};

export default api;
