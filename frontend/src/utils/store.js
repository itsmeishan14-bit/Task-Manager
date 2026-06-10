import { create } from 'zustand';
import { authAPI, tasksAPI, categoriesAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(email, username, password);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  verify: async () => {
    try {
      const response = await authAPI.verify();
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      return false;
    }
  },

  googleLogin: async (googleId, email, username, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.googleCallback(googleId, email, username, avatarUrl);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },
}));

export const useTaskStore = create((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filter: {
    status: 'all',
    category: null,
    priority: 'all',
    search: '',
  },

  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filter } = useTaskStore.getState();
      const params = {};
      if (filter.status && filter.status !== 'all') params.status = filter.status;
      if (filter.category) params.category_id = filter.category;
      if (filter.priority && filter.priority !== 'all') params.priority = filter.priority;
      if (filter.search) params.search = filter.search;

      const response = await tasksAPI.getAll(params);
      set({ tasks: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.create(taskData);
      set({ isLoading: false });
      await useTaskStore.getState().fetchTasks();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create task', isLoading: false });
      return false;
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.update(id, taskData);
      set({ isLoading: false });
      await useTaskStore.getState().fetchTasks();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update task', isLoading: false });
      return false;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.delete(id);
      set({ isLoading: false });
      await useTaskStore.getState().fetchTasks();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete task', isLoading: false });
      return false;
    }
  },

  completeTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tasksAPI.complete(id);
      set({ isLoading: false });
      await useTaskStore.getState().fetchTasks();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to complete task', isLoading: false });
      return false;
    }
  },
}));

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoriesAPI.getAll();
      set({ categories: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesAPI.create(categoryData);
      set({ isLoading: false });
      await useCategoryStore.getState().fetchCategories();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create category', isLoading: false });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoriesAPI.delete(id);
      set({ isLoading: false });
      await useCategoryStore.getState().fetchCategories();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete category', isLoading: false });
      return false;
    }
  },
}));

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'auto',
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
}));
