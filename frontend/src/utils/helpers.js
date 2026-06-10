export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority] || colors.medium;
};

export const getPriorityBgColor = (priority) => {
  const colors = {
    low: '#DBEAFE',
    medium: '#FEF3C7',
    high: '#FFEDD5',
    critical: '#FEE2E2',
  };
  return colors[priority] || colors.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-800',
    archived: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || colors.not_started;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
};

export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = new Date(date);
  return (
    tomorrow.getFullYear() === checkDate.getFullYear() &&
    tomorrow.getMonth() === checkDate.getMonth() &&
    tomorrow.getDate() === checkDate.getDate()
  );
};

export const isOverdue = (dueDate, status) => {
  if (status === 'completed' || status === 'cancelled') return false;
  const today = new Date();
  const due = new Date(dueDate);
  due.setHours(23, 59, 59);
  return due < today;
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

export const groupTasksByDate = (tasks) => {
  const grouped = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
    overdue: [],
  };

  tasks.forEach((task) => {
    if (isOverdue(task.due_date, task.status)) {
      grouped.overdue.push(task);
    } else if (isToday(task.due_date)) {
      grouped.today.push(task);
    } else if (isTomorrow(task.due_date)) {
      grouped.tomorrow.push(task);
    } else {
      const due = new Date(task.due_date);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        grouped.thisWeek.push(task);
      } else if (diffDays <= 30) {
        grouped.thisMonth.push(task);
      } else {
        grouped.later.push(task);
      }
    }
  });

  return grouped;
};
