import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useTaskStore, useCategoryStore } from '../utils/store';
import TaskCard from '../components/Tasks/TaskCard';
import TaskModal from '../components/Tasks/TaskModal';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const filter = useTaskStore((state) => state.filter);
  const setFilter = useTaskStore((state) => state.setFilter);
  
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const completeTask = useTaskStore((state) => state.completeTask);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [fetchTasks, fetchCategories]);

  // Handle filter changes
  const handleSearchChange = (e) => {
    setFilter({ search: e.target.value });
    fetchTasks();
  };

  const handleStatusChange = (e) => {
    setFilter({ status: e.target.value });
    fetchTasks();
  };

  // Actions
  const handleCompleteTask = async (id) => {
    const success = await completeTask(id);
    if (success) {
      toast.success('Task updated successfully');
    } else {
      toast.error('Failed to update task');
    }
  };

  const handleEditTaskClick = (task) => {
    // Format date for the input field (YYYY-MM-DD)
    const formattedTask = { ...task };
    if (task.due_date) {
      formattedTask.due_date = task.due_date.split('T')[0];
    }
    setEditingTask(formattedTask);
    setIsModalOpen(true);
  };

  const handleDeleteTaskClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(id);
      if (success) {
        toast.success('Task deleted successfully');
      } else {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleSaveTask = async (formData) => {
    let success;
    if (editingTask) {
      success = await updateTask(editingTask.id, formData);
      if (success) toast.success('Task updated successfully');
    } else {
      success = await createTask(formData);
      if (success) toast.success('Task created successfully');
    }

    if (success) {
      setIsModalOpen(false);
      setEditingTask(null);
    } else {
      toast.error('Failed to save task');
    }
  };

  const handleNewTaskClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 text-gray-900 dark:text-white transition-colors min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Tasks</h1>
        <button 
          onClick={handleNewTaskClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <select
          value={filter.status}
          onChange={handleStatusChange}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
        >
          <option value="all">All Tasks</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center card-shadow border border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks found. Create your first task to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onEdit={handleEditTaskClick}
              onDelete={handleDeleteTaskClick}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
