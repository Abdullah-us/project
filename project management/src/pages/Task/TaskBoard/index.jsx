// src/pages/Task/TaskBoard/index.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGrid, FiUsers } from 'react-icons/fi';
import StatusBoard from '../../../components/tasks/StatusBoard';
import TeamMemberTasks from '../../../components/tasks/TeamMemberTasks';
import { useTasks } from '../../../contexts/TaskContext';
import { useTeam } from '../../../contexts/TeamContext';

function TaskBoardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { teamMembers } = useTeam();
  const [project, setProject] = useState(null);
  const [viewMode, setViewMode] = useState('status'); // 'status' or 'team'
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    assigneeId: '',
    dueDate: '',
  });

  // Get project data from navigation state
  useEffect(() => {
    if (location.state) {
      setProject({
        id: location.state.projectId,
        name: location.state.projectName,
        description: location.state.projectDescription,
        progress: location.state.projectProgress,
        team: location.state.projectTeam,
        dueDate: location.state.projectDueDate,
        assignedMembers: location.state.assignedMembers || []
      });
    }
  }, [location.state]);

  // Filter tasks for this project
  const projectTasks = project ? tasks.filter(task => task.projectId === project.id) : [];

  // Get assigned team members for this project
  const assignedTeamMembers = project ? 
    teamMembers.filter(member => project.assignedMembers?.includes(member.id)) : [];

  const handleAddTask = (taskData) => {
    if (!project) return;
    
    const newTask = {
      id: Date.now(),
      ...taskData,
      projectId: project.id,
      createdAt: new Date().toISOString()
    };
    
    addTask(newTask);
  };

  const handleUpdateTask = (taskId, updates) => {
    updateTask(taskId, updates);
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleMoveTask = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleEditTask = (taskId) => {
    const task = projectTasks.find(t => t.id === taskId);
    if (task) {
      setNewTaskForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate || '',
      });
      setShowTaskModal(true);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading project data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors mr-6"
              >
                <FiArrowLeft className="h-6 w-6" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                  <FiGrid className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {project.name} Task Board
                    </span>
                  </h1>
                  <p className="text-xs text-gray-400">Project Management & Task Tracking</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Project Progress</p>
                <p className="text-lg font-bold text-emerald-400">{project.progress}%</p>
              </div>
              <div className="h-10 w-px bg-gray-700"></div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Team Members</p>
                <p className="text-lg font-bold text-white">{assignedTeamMembers.length}</p>
              </div>
              <div className="h-10 w-px bg-gray-700"></div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Due Date</p>
                <p className="text-lg font-bold text-amber-400">{project.dueDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.description || "No description provided."}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Project ID: {project.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-700">Progress: {project.progress}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-700">Due: {project.dueDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{projectTasks.length}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <button 
                onClick={() => navigate('/projects')}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Projects
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Project Progress</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('status')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'status'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-300'
              }`}
            >
              <FiGrid className="inline-block h-4 w-4 mr-2" />
              Status View
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'team'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-300'
              }`}
            >
              <FiUsers className="inline-block h-4 w-4 mr-2" />
              Team View
            </button>
          </div>
          
          <button
            onClick={() => {
              setNewTaskForm({
                title: '',
                description: '',
                status: 'not-started',
                priority: 'medium',
                assigneeId: '',
                dueDate: '',
              });
              setShowTaskModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
          >
            + New Task
          </button>
        </div>

        {/* Task Board - Based on View Mode */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
          {viewMode === 'status' ? (
            <StatusBoard
              projectId={project.id}
              projectName={project.name}
              tasks={projectTasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
            />
          ) : (
            <TeamMemberTasks
              projectId={project.id}
              tasks={projectTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
            />
          )}
        </div>

        {/* Team Members Section */}
        {assignedTeamMembers.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assigned Team Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {assignedTeamMembers.map(member => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      {member.projectRole && member.projectRole !== member.role && (
                        <p className="text-xs text-blue-600">Project: {member.projectRole}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
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
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm({...newTaskForm, description: e.target.value})}
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
                      value={newTaskForm.status}
                      onChange={(e) => setNewTaskForm({...newTaskForm, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({...newTaskForm, priority: e.target.value})}
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
                      value={newTaskForm.assigneeId}
                      onChange={(e) => setNewTaskForm({...newTaskForm, assigneeId: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {assignedTeamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Only team members from Dashboard
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({...newTaskForm, dueDate: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Validate assignee
                    if (newTaskForm.assigneeId && !assignedTeamMembers.find(m => m.id.toString() === newTaskForm.assigneeId.toString())) {
                      alert('Please select a valid team member from the list.');
                      return;
                    }
                    
                    handleAddTask({
                      ...newTaskForm,
                      assigneeId: newTaskForm.assigneeId || null
                    });
                    setShowTaskModal(false);
                    setNewTaskForm({
                      title: '',
                      description: '',
                      status: 'not-started',
                      priority: 'medium',
                      assigneeId: '',
                      dueDate: '',
                    });
                  }}
                  disabled={!newTaskForm.title.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskBoardPage;