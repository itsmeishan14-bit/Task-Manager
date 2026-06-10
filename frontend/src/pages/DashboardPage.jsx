import React, { useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { useTaskStore } from '../utils/store';

export default function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const isLoading = useTaskStore((state) => state.isLoading);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  // Format today's date in YYYY-MM-DD
  const todayStr = today.toISOString().split('T')[0];

  // 1. Completed Today
  const completedToday = tasks.filter((t) => 
    t.status === 'completed' && 
    (t.completion_time && t.completion_time.startsWith(todayStr))
  ).length;

  // 2. In Progress
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;

  // 3. Overdue
  const overdue = tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled' || !t.due_date) return false;
    // Extract date string
    const dueDateStr = t.due_date.split('T')[0];
    return dueDateStr < todayStr;
  }).length;

  // 4. Daily Progress (Tasks due today or completed today)
  const tasksToday = tasks.filter((t) => {
    const isDueToday = t.due_date && t.due_date.startsWith(todayStr);
    const isCompletedToday = t.status === 'completed' && t.completion_time && t.completion_time.startsWith(todayStr);
    return isDueToday || isCompletedToday;
  });

  const totalTasksToday = tasksToday.length;
  const completedTasksTodayCount = tasksToday.filter((t) => t.status === 'completed').length;
  const dailyProgressPercent = totalTasksToday > 0 ? Math.round((completedTasksTodayCount / totalTasksToday) * 100) : 0;

  // 5. Weekly Stats (Sunday - Saturday)
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyTasks = tasks.filter((t) => {
    const compareDate = t.completion_time ? new Date(t.completion_time) : (t.due_date ? new Date(t.due_date) : null);
    return compareDate && compareDate >= startOfWeek && compareDate <= endOfWeek;
  });

  const completedThisWeek = weeklyTasks.filter((t) => t.status === 'completed').length;
  const pendingThisWeek = weeklyTasks.filter((t) => t.status !== 'completed').length;

  // 6. Monthly Stats
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthlyTasks = tasks.filter((t) => {
    const compareDate = t.completion_time ? new Date(t.completion_time) : (t.due_date ? new Date(t.due_date) : null);
    return compareDate && compareDate >= startOfMonth && compareDate <= endOfMonth;
  });

  const completedThisMonth = monthlyTasks.filter((t) => t.status === 'completed').length;
  const pendingThisMonth = monthlyTasks.filter((t) => t.status !== 'completed').length;

  // 7. Productivity Score
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const productivityScore = totalTasks > 0 ? ((totalCompleted / totalTasks) * 10).toFixed(1) : '0.0';

  // 8. Streak calculation (consecutive days with completed tasks)
  const getStreak = () => {
    if (tasks.length === 0) return 0;
    const completionDates = tasks
      .filter((t) => t.status === 'completed' && t.completion_time)
      .map((t) => t.completion_time.split('T')[0]);
    
    const uniqueDates = [...new Set(completionDates)].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();
    
    // Check if we completed something today
    const hasCompletedToday = uniqueDates.includes(todayStr);
    // Check if we completed something yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

    if (!hasCompletedToday && !hasCompletedYesterday) return 0;

    if (!hasCompletedToday && hasCompletedYesterday) {
      checkDate = yesterday;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const formattedCheckDate = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(formattedCheckDate)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  return (
    <div className="p-8 text-gray-900 dark:text-white transition-colors min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            {greeting}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isLoading && (
          <div className="text-sm text-blue-500 animate-pulse font-medium">
            Syncing data...
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Completed Today */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Completed Today</p>
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{completedToday}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">In Progress</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{inProgress}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Overdue</p>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{overdue}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
        </div>

        {/* Daily Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Daily Progress</p>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{dailyProgressPercent}%</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <TrendingUp className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Progress Bar Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 mb-8 transition-colors">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Today's Goals</h2>
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              Completed <span className="font-bold text-gray-900 dark:text-white">{completedTasksTodayCount}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalTasksToday}</span> tasks due/completed today
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{dailyProgressPercent}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-600/30">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500" 
              style={{ width: `${dailyProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> This Week
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed tasks</span>
              <span className="font-bold text-green-600 dark:text-green-400">{completedThisWeek}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending tasks</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{pendingThisWeek}</span>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" /> This Month
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed tasks</span>
              <span className="font-bold text-green-600 dark:text-green-400">{completedThisMonth}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending tasks</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{pendingThisMonth}</span>
            </div>
          </div>
        </div>

        {/* Productivity & Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Productivity score</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{productivityScore}/10</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active streak</span>
              <span className="font-extrabold text-orange-500 dark:text-orange-400">{streak} {streak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
