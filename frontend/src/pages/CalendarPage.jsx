import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../utils/store';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Padding days for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get tasks due on a specific day
  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0];
    
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      return t.due_date.split('T')[0] === dateStr;
    });
  };

  // Get tasks for the selected date
  const selectedDateTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return t.due_date.split('T')[0] === dateStr;
  });

  return (
    <div className="p-8 text-gray-900 dark:text-white transition-colors min-h-full">
      <h1 className="text-4xl font-bold mb-8">Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-400 dark:text-gray-500 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isSelected = day && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === currentMonth.getMonth() && 
                selectedDate.getFullYear() === currentMonth.getFullYear();

              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === currentMonth.getMonth() && 
                new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <div
                  key={index}
                  className={`p-3 min-h-[70px] border dark:border-gray-700/50 rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                    day === null
                      ? 'bg-gray-50/50 dark:bg-gray-800/10 border-transparent'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : isToday
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-100 dark:border-gray-700/30'
                  }`}
                  onClick={() => day && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                >
                  <span className="text-sm font-semibold">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex justify-center gap-1 mt-1">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span 
                          key={t.id} 
                          className={`w-2 h-2 rounded-full ${
                            isSelected 
                              ? 'bg-white' 
                              : t.priority === 'critical' || t.priority === 'high'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className={`text-[8px] font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>+</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 card-shadow border border-gray-100 dark:border-gray-700/50 transition-colors h-fit">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700/50 pb-4">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          
          <div className="space-y-4">
            {selectedDateTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks scheduled for this date</p>
            ) : (
              selectedDateTasks.map((t) => (
                <div 
                  key={t.id} 
                  className={`p-4 border dark:border-gray-700/30 rounded-xl flex items-start gap-3 transition-colors ${
                    t.status === 'completed'
                      ? 'bg-gray-50/50 dark:bg-gray-800/20 border-transparent'
                      : 'bg-white dark:bg-gray-700/20 border-gray-100 dark:border-gray-700/20'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    t.priority === 'critical'
                      ? 'bg-red-500'
                      : t.priority === 'high'
                      ? 'bg-orange-500'
                      : t.priority === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`} />
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm ${t.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {t.title}
                    </h4>
                    {t.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{t.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
