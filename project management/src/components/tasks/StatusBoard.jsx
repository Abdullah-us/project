// src/components/StatusBoard.jsx
import { useState } from 'react';
import { useTeam } from '../../contexts/TeamContext';
import StatusColumn from './StatusColumn';
import { STATUS_TYPES, STATUS_ORDER, STATUS_CONFIG } from '../../constants/status';

function StatusBoard({ 
  projectId, 
  projectName, 
  tasks = [], 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask, 
  onMoveTask 
}) {
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: STATUS_TYPES.NOT_STARTED,
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
    progress: 0,
  });
  
  const { teamMembers } = useTeam();

  // Filter tasks for this specific project
  const projectTasks = tasks.filter(task => task.projectId === projectId);

  // Group tasks by status
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = projectTasks.filter(task => task.status === status);
    return acc;
  }, {});

  const handleAddTask = (newTask) => {
    if (onAddTask) {
      onAddTask(newTask);
    }
  };

  const handleEditTask = (taskId) => {
    const task = projectTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate || '',
        progress: task.progress || 0,
      });
      setShowTaskModal(true);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (onDeleteTask && window.confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(taskId);
    }
  };

  const handleTaskDrop = (taskId, newStatus) => {
    if (onMoveTask) {
      onMoveTask(taskId, newStatus);
    }
  };

  const handleSaveTask = () => {
    // Validate that assignee exists if selected
    if (taskForm.assigneeId && !teamMembers.find(m => m.id.toString() === taskForm.assigneeId.toString())) {
      alert('Selected team member does not exist. Please select a valid team member from the list.');
      return;
    }
    
    if (editingTask) {
      // Update existing task
      if (onUpdateTask) {
        onUpdateTask(editingTask.id, {
          ...taskForm,
          assigneeId: taskForm.assigneeId || null
        });
      }
    } else {
      // Add new task
      if (onAddTask) {
        onAddTask({
          ...taskForm,
          projectId: projectId,
          assigneeId: taskForm.assigneeId || null
        });
      }
    }
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      status: STATUS_TYPES.NOT_STARTED,
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
      progress: 0,
    });
  };

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === STATUS_TYPES.COMPLETED).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{projectName} Task Board</h2>
            <p className="text-gray-600 mt-1">
              {projectTasks.length === 0 
                ? 'No tasks yet. Add your first task!' 
                : `Managing ${projectTasks.length} task${projectTasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-sm text-gray-600">Completion Rate</div>
              <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                setTaskForm({
                  title: '',
                  description: '',
                  status: STATUS_TYPES.NOT_STARTED,
                  priority: 'medium',
                  assigneeId: '',
                  dueDate: '',
                  progress: 0,
                });
                setShowTaskModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_ORDER.map((status) => {
            const config = STATUS_CONFIG[status];
            const statusTasks = tasksByStatus[status] || [];
            return (
              <div key={status} className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <span className={`${config.textColor} font-bold text-lg`}>{statusTasks.length}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {statusTasks.length} task{statusTasks.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUS_ORDER.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            projectId={projectId}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTaskDrop={handleTaskDrop}
          />
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {STATUS_ORDER.map((status) => {
                        const config = STATUS_CONFIG[status];
                        return (
                          <option key={status} value={status}>
                            {config.icon} {config.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <select
                      value={taskForm.assigneeId}
                      onChange={(e) => setTaskForm({...taskForm, assigneeId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Only team members added on Dashboard are available
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {taskForm.status === STATUS_TYPES.IN_PROGRESS && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress ({taskForm.progress}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={taskForm.progress}
                      onChange={(e) => setTaskForm({...taskForm, progress: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  disabled={!taskForm.title.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusBoard;