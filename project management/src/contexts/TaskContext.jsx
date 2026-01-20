// src/contexts/TaskContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: task.id || Date.now(),
      // Use assigneeId instead of assignee string
      assigneeId: task.assigneeId || null,
      // Remove assignee string if it exists
      assignee: undefined,
      projectId: task.projectId || null,
      status: task.status || 'not-started',
      priority: task.priority || 'medium',
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Clean up any assignee string that might have been passed
    delete newTask.assignee;
    
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { 
        ...t, 
        ...updates, 
        // Ensure assigneeId is used, not assignee string
        assigneeId: updates.assigneeId !== undefined ? updates.assigneeId : t.assigneeId,
        // Remove assignee string if it exists in updates
        assignee: undefined,
        updatedAt: new Date().toISOString() 
      } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getTasksByProject = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTasksByAssignee = (assigneeId) => {
    return tasks.filter(task => task.assigneeId === assigneeId);
  };

  const value = useMemo(() => ({
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksByProject,
    getTasksByAssignee
  }), [tasks]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};