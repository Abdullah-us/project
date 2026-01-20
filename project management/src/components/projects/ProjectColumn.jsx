// src/components/ProjectColumn.jsx
import { useState } from 'react';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import TaskCard from '../TaskCard';
import { STATUS_ORDER, STATUS_CONFIG } from '../../constants/status';

function ProjectColumn({ 
  project, 
  tasks = [], 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onTaskDrop,
  teamMembers = []
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('not-started');

  // Group tasks by status for this project
  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {});

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        status: selectedStatus,
        projectId: project.id,
        projectName: project.name,
        createdAt: new Date().toISOString(),
      };
      onAddTask(newTask);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  // Calculate project completion percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Column Header */}
      <div className=" from-indigo-500 to-purple-600 px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{project.name}</h3>
                <p className="text-white/80 text-sm truncate">{project.description || "No description"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingTask(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Add task"
            >
              <FiPlus className="h-4 w-4 text-white" />
            </button>
            <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <FiMoreVertical className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-white font-bold">{totalTasks}</div>
              <div className="text-white/80 text-xs">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{project.team || 0}</div>
              <div className="text-white/80 text-xs">Members</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">{completionRate}%</div>
              <div className="text-white/80 text-xs">Complete</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-xs">Due: {project.dueDate}</div>
            <div className="text-white text-sm font-medium">{project.progress}% Progress</div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Project Progress Bar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Project Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full  from-green-500 to-emerald-500 rounded-full"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks Content - 4 Status Sections */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-4">
          {STATUS_ORDER.map((status) => {
            const config = STATUS_CONFIG[status];
            const statusTasks = tasksByStatus[status] || [];
            
            return (
              <div 
                key={status}
                className={`border rounded-lg overflow-hidden ${config.borderColor}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('taskId');
                  const currentProjectId = e.dataTransfer.getData('projectId');
                  
                  if (taskId && onTaskDrop) {
                    // Only allow dropping if it's from the same project
                    if (parseInt(currentProjectId) === project.id) {
                      onTaskDrop(taskId, status, project.id);
                    }
                  }
                }}
              >
                {/* Status Header */}
                <div className={`${config.bgColor} ${config.borderColor} border-b px-3 py-2 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                  <span className={`text-xs font-medium ${config.textColor} bg-white/50 px-2 py-0.5 rounded-full`}>
                    {statusTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="min-h-[100px] max-h-[200px] overflow-y-auto p-2">
                  {statusTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-2xl mb-1 opacity-30">{config.icon}</div>
                      <p className="text-gray-400 text-xs">No tasks</p>
                      <p className="text-gray-400 text-xs mt-1">Drop tasks here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          projectId={project.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column Footer */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{totalTasks} total tasks</span>
          <span>Drag tasks between sections</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectColumn;