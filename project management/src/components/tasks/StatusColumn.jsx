// src/components/StatusColumn.jsx
import { useState } from 'react';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import TaskCard from './TaskCard';
import { STATUS_CONFIG } from '../../constants/status';

function StatusColumn({ 
  status, 
  tasks = [], 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onTaskDrop,
  projectId 
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const config = STATUS_CONFIG[status];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-opacity-50', config.bgColor.replace('bg-', 'bg-'));
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-opacity-50', config.bgColor.replace('bg-', 'bg-'));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-50', config.bgColor.replace('bg-', 'bg-'));
    
    const taskId = e.dataTransfer.getData('taskId');
    const fromProjectId = e.dataTransfer.getData('projectId');
    const currentStatus = e.dataTransfer.getData('currentStatus');
    
    // Fix: Only pass taskId and new status (matching StatusBoard expectations)
    if (taskId && onTaskDrop) {
      onTaskDrop(taskId, status);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        status: status,
        createdAt: new Date().toISOString(),
        projectId: projectId,
        assigneeId: null, // Start as unassigned by default
        priority: 'medium'
      };
      onAddTask(newTask);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full min-h-[500px] ${config.bgColor} ${config.borderColor} border rounded-2xl overflow-hidden`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={`${config.color} px-4 py-3 border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <h3 className="font-semibold">{config.label}</h3>
            <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs font-medium">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingTask(true)}
              className="p-1.5 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors"
              title="Add task"
            >
              <FiPlus className="h-4 w-4" />
            </button>
            <button className="p-1.5 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors">
              <FiMoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="p-3 border-b border-gray-200">
          <div className="space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 opacity-20">{config.icon}</div>
            <p className="text-gray-500 text-sm">No tasks yet</p>
            <button
              onClick={() => setIsAddingTask(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              + Add first task
            </button>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={(newStatus) => {
                  // Handle status change if needed
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Column Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white bg-opacity-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Drop tasks here</span>
          <span>Drag to reorder</span>
        </div>
      </div>
    </div>
  );
}

export default StatusColumn;