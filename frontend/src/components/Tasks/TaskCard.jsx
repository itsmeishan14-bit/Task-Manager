import React from 'react';
import { Pencil, Trash2, Calendar } from 'lucide-react';

export default function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30';
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30';
      case 'low':
      default:
        return 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600/30';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 card-shadow border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all flex items-start gap-4 text-gray-900 dark:text-white">
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => onComplete(task.id)}
        className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-lg truncate ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          {task.priority && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
              {task.priority}
            </span>
          )}
          {task.category_name && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: task.category_color || '#3B82F6' }}
            >
              {task.category_name}
            </span>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium ml-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-center">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Edit Task"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Delete Task"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
