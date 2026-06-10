import React, { useState } from 'react';
import { useAuthStore, useThemeStore } from '../utils/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Settings, User } from 'lucide-react';

export default function SettingsPage() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="p-8 text-gray-900 dark:text-white transition-colors">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold mb-6">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none transition-shadow"
                >
                  <option value="auto">Auto (System)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold mb-6">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:ring-offset-0" />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Browser Notifications</span>
              </label>
              <label className="flex items-center cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:ring-offset-0" />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Email Reminders</span>
              </label>
              <label className="flex items-center cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:ring-offset-0" />
                <span className="ml-3 text-gray-700 dark:text-gray-300">Daily Digest</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-6 text-red-600 dark:text-red-400">Danger Zone</h2>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.username}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
