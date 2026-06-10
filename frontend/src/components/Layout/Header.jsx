import React from 'react';
import { useAuthStore, useThemeStore } from '../../utils/store';
import { Bell, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cycle: light → dark → auto → light
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const themeTitle = theme === 'dark' ? 'Dark Mode — click for Auto' : theme === 'light' ? 'Light Mode — click for Dark' : 'Auto Mode — click for Light';

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center transition-colors flex-shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          title={themeTitle}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all"
        >
          <ThemeIcon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
