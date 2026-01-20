import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { useProjects } from '../../contexts/ProjectContext';
import { useTasks } from '../../contexts/TaskContext';

function Dashboard() {
  const { projects = [] } = useProjects();
  const { tasks = [] } = useTasks();
  const [activeSection] = useState('projects');

  // Calculate dashboard metrics with fallbacks
  const dashboardMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    totalTeamMembers: 0, // Will come from context later
    overallProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
      : 0,
  };

  // Stats configuration
  const stats = [
    { 
      title: 'Active Projects', 
      value: dashboardMetrics.activeProjects, 
      change: '+2', 
      trend: 'up',
      icon: '📊',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      title: 'Completed Tasks', 
      value: dashboardMetrics.completedTasks, 
      change: '+12%', 
      trend: 'up',
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      title: 'Pending Review', 
      value: '7', 
      change: '-3', 
      trend: 'down',
      icon: '⏰',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    { 
      title: 'Team Members', 
      value: dashboardMetrics.totalTeamMembers, 
      change: '+3', 
      trend: 'up',
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
  ];

  const quickActions = [
    { icon: '📋', label: 'New Task', color: 'bg-blue-100 text-blue-600', path: '/task-board' },
    { icon: '📁', label: 'New Project', color: 'bg-emerald-100 text-emerald-600', path: '/projects' },
    { icon: '👥', label: 'Add Member', color: 'bg-purple-100 text-purple-600', path: '/team' },
    { icon: '📊', label: 'Generate Report', color: 'bg-amber-100 text-amber-600', path: '/analytics' },
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-8" role="main" aria-label="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <article 
            key={index} 
            className={`bg-white border ${stat.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
            aria-label={`${stat.title}: ${stat.value}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <span 
                    className={`ml-3 px-2.5 py-1 text-xs font-semibold rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    aria-label={`${stat.trend === 'up' ? 'Increase' : 'Decrease'} of ${stat.change}`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div 
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                aria-hidden="true"
              >
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {/* Recent Activity & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
            <Link 
              to="/projects" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              aria-label="View all projects"
            >
              View All
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <article 
                  key={project.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.name || 'Unnamed Project'}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUsers className="h-4 w-4 mr-1" aria-hidden="true" />
                          {project.team || 0} members
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {project.tasks || 0} tasks
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="h-4 w-4 mr-1" aria-hidden="true" />
                            Due {project.dueDate}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-blue-600">{project.progress || 0}%</div>
                      <Link 
                        to={`/task-board?project=${project.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                        aria-label={`View tasks for ${project.name}`}
                      >
                        View Tasks
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-8" role="status">
                <p className="text-gray-500">No projects yet</p>
                <Link 
                  to="/projects" 
                  className="mt-2 inline-block text-blue-600 hover:text-blue-700"
                  aria-label="Create your first project"
                >
                  Create your first project
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`p-4 rounded-xl ${action.color} hover:opacity-90 transition-opacity flex flex-col items-center`}
                aria-label={action.label}
              >
                <span className="text-2xl mb-2" aria-hidden="true">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Additional helpful info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalProjects}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.overallProgress}%</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;