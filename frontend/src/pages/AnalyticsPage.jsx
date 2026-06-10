import React, { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '../utils/store';
import { Calendar, TrendingUp, Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Calculate start of current week (Sunday)
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split('T')[0];

  // Group tasks by day of current week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = daysOfWeek.map((dayName, idx) => {
    const checkDate = new Date(startOfWeek);
    checkDate.setDate(startOfWeek.getDate() + idx);
    const dateStr = checkDate.toISOString().split('T')[0];

    const completed = tasks.filter((t) => 
      t.status === 'completed' && 
      t.completion_time && t.completion_time.startsWith(dateStr)
    ).length;

    const pending = tasks.filter((t) => 
      t.status !== 'completed' && 
      t.due_date && t.due_date.startsWith(dateStr)
    ).length;

    return { day: dayName, completed, pending };
  });

  // Calculate overall metrics
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  
  // Avg tasks per day (for the current week)
  const weeklyTasksCount = tasks.filter((t) => {
    const compareDate = t.completion_time ? new Date(t.completion_time) : (t.due_date ? new Date(t.due_date) : null);
    return compareDate && compareDate >= startOfWeek;
  }).length;
  const avgTasksPerDay = (weeklyTasksCount / 7).toFixed(1);

  // Completion rate
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Streak calculation
  const getStreak = () => {
    if (tasks.length === 0) return 0;
    const completionDates = tasks
      .filter((t) => t.status === 'completed' && t.completion_time)
      .map((t) => t.completion_time.split('T')[0]);
    
    const uniqueDates = [...new Set(completionDates)].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();
    
    const hasCompletedToday = uniqueDates.includes(todayStr);
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
      <h1 className="text-4xl font-bold mb-8">Analytics & Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Productivity Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Weekly Productivity</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="opacity-10 dark:opacity-30" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Completed" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Completion Rate</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="opacity-10 dark:opacity-30" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="pending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Avg Tasks / Day</h3>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{avgTasksPerDay}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Completion Rate</h3>
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{completionRate}%</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 flex items-center justify-between transition-colors">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">Current Streak</h3>
            <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{streak} {streak === 1 ? 'day' : 'days'}</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <Trophy className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
