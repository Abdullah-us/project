import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TaskProvider } from './contexts/TaskContext';
import { TeamProvider } from './contexts/TeamContext';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import NotFound from './components/common/NotFound';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import TaskBoard from './pages/Task/TaskBoard/index.jsx';
import Analytics from './pages/Analytics';
import Team from './pages/Team';

import './App.css';

// Import hooks from contexts
import { useProjects } from './contexts/ProjectContext';
import { useTasks } from './contexts/TaskContext';
import { useTeam } from './contexts/TeamContext';

function MainDashboard() {
  const navigate = useNavigate();
  
  // USE CONTEXTS INSTEAD OF LOCAL STATE
  const { projects, addProject, updateProject, setProjects } = useProjects();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { teamMembers, addMember, updateMember } = useTeam();
  
  // State Management (only UI state remains local)
  const [notificationCount, setNotificationCount] = useState(0);
  const [taskActions, setTaskActions] = useState([]);
  const [activeSection, setActiveSection] = useState('projects');
  
  // Form States (UI state - remains local)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showProjectSummaryModal, setShowProjectSummaryModal] = useState(false);
  const [showAddMemberToProjectModal, setShowAddMemberToProjectModal] = useState(false);
  const [showWorkflowGuideModal, setShowWorkflowGuideModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectForMember, setSelectedProjectForMember] = useState(null);
  
  // Form Data (UI state - remains local)
  const [newTask, setNewTask] = useState({ title: '', section: 'projects', priority: 'medium' });
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    assignedMembers: []
  });
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [newMemberForProject, setNewMemberForProject] = useState({ 
    name: '', 
    role: '', 
    email: '',
    projectRole: ''
  });

  // Calculate Dashboard Metrics (using context data)
  const dashboardMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    totalTeamMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    overallProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
      : 0,
  };

  // Add Notification
  const addNotification = (message, section) => {
    const newAction = {
      id: Date.now(),
      type: 'add',
      section: section,
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setTaskActions(prev => [newAction, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  // Handle Add Task (using context)
  const handleAddTask = (section) => {
    setNewTask({ ...newTask, section: section });
    setShowAddTaskModal(true);
  };

  const submitNewTask = () => {
    if (!newTask.title.trim()) return;
    
    const newTaskObj = {
      id: Date.now(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    // Use context addTask instead of local setTasks
    addTask(newTaskObj);
    
    // Add notification
    addNotification(`New task added: "${newTask.title}"`, newTask.section);
    
    // Reset and close modal
    setNewTask({ title: '', section: 'projects', priority: 'medium' });
    setShowAddTaskModal(false);
  };

  // Handle Add Project (using context)
  const submitNewProject = () => {
    if (!newProject.name.trim()) return;
    
    const assignedMembersCount = newProject.assignedMembers?.length || 0;
    
    const newProjectObj = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      progress: 0,
      status: 'planning',
      tasks: 0,
      team: assignedMembersCount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedMembers: newProject.assignedMembers || []
    };
    
    // Use context addProject instead of local setProjects
    addProject(newProjectObj);
    
    // Update team members with project assignment
    if (assignedMembersCount > 0) {
      newProject.assignedMembers.forEach(memberId => {
        const member = teamMembers.find(m => m.id === memberId);
        if (member) {
          updateMember(memberId, { 
            projects: (member.projects || 0) + 1,
            assignedProjects: [...(member.assignedProjects || []), newProjectObj.id]
          });
        }
      });
    }
    
    addNotification(`New project created: "${newProject.name}" with ${assignedMembersCount} team members`, 'projects');
    
    setNewProject({ name: '', description: '', assignedMembers: [] });
    setShowAddProjectModal(false);
  };

  // Handle Add Team Member (using context)
  const submitNewMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) return;
    
    const newMemberObj = {
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      status: 'active',
      tasks: 0,
      projects: 0,
      assignedProjects: []
    };
    
    // Use context addMember instead of local setTeamMembers
    addMember(newMemberObj);
    addNotification(`New team member added: "${newMember.name}"`, 'team');
    
    setNewMember({ name: '', role: '', email: '' });
    setShowAddMemberModal(false);
  };

  // Handle Add Member to Project
  const submitMemberToProject = () => {
    if (!newMemberForProject.name.trim() || !newMemberForProject.role.trim()) return;
    
    // Create new team member using context
    const newMemberObj = {
      name: newMemberForProject.name,
      role: newMemberForProject.role,
      email: newMemberForProject.email || '',
      status: 'active',
      tasks: 0,
      projects: 1,
      assignedProjects: [selectedProjectForMember.id],
      projectRole: newMemberForProject.projectRole || newMemberForProject.role
    };
    
    // Add to team members using context
    const addedMember = addMember(newMemberObj);
    
    // Update project with new member
    updateProject(selectedProjectForMember.id, {
      assignedMembers: [...(selectedProjectForMember.assignedMembers || []), addedMember.id],
      team: (selectedProjectForMember.assignedMembers?.length || 0) + 1
    });
    
    // Add notification
    addNotification(`Added ${newMemberForProject.name} to project "${selectedProjectForMember.name}"`, 'projects');
    
    // Reset and close modal
    setNewMemberForProject({ name: '', role: '', email: '', projectRole: '' });
    setShowAddMemberToProjectModal(false);
  };

  // Update Project Progress (using context)
  const updateProjectProgress = (projectId, newProgress) => {
    updateProject(projectId, { progress: Math.min(100, Math.max(0, newProgress)) });
    
    const project = projects.find(p => p.id === projectId);
    if (project) {
      addNotification(`Progress updated for "${project.name}": ${newProgress}%`, 'projects');
    }
  };

  // Update Team Member Status (using context)
  const updateMemberStatus = (memberId, newStatus) => {
    updateMember(memberId, { status: newStatus });
    
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      addNotification(`${member.name} is now ${newStatus}`, 'team');
    }
  };

  // Open Project Summary
  const openProjectSummary = (project) => {
    setSelectedProject(project);
    setShowProjectSummaryModal(true);
  };

  // Open Add Member to Project Modal
  const openAddMemberToProject = (project) => {
    setSelectedProjectForMember(project);
    setShowAddMemberToProjectModal(true);
  };

  // Remove Member from Project
  const removeMemberFromProject = (projectId, memberId) => {
    // Update project
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        assignedMembers: (project.assignedMembers || []).filter(id => id !== memberId),
        team: Math.max(0, (project.assignedMembers?.length || 0) - 1)
      });
    }
    
    // Update member
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      updateMember(memberId, {
        projects: Math.max(0, (member.projects || 0) - 1),
        assignedProjects: (member.assignedProjects || []).filter(id => id !== projectId)
      });
      
      addNotification(`Removed ${member.name} from project "${project?.name}"`, 'projects');
    }
  };

  // Get assigned members for a project
  const getAssignedMembers = (project) => {
    if (!project.assignedMembers || project.assignedMembers.length === 0) return [];
    return teamMembers.filter(member => project.assignedMembers.includes(member.id));
  };

  // Clear Notifications
  const clearNotifications = () => {
    setNotificationCount(0);
    setTaskActions([]);
  };

  // Auto-decrease notifications
  useEffect(() => {
    if (notificationCount > 0) {
      const timer = setTimeout(() => {
        setNotificationCount(prev => prev > 0 ? prev - 1 : 0);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationCount]);

  // Function to handle project creation with workflow check
  const handleAddProjectClick = () => {
    if (teamMembers.length === 0) {
      setShowWorkflowGuideModal(true);
    } else {
      setShowAddProjectModal(true);
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showWorkflowGuideModal) setShowWorkflowGuideModal(false);
        if (showAddMemberModal) setShowAddMemberModal(false);
        if (showAddProjectModal) setShowAddProjectModal(false);
        if (showAddTaskModal) setShowAddTaskModal(false);
        if (showProjectSummaryModal) setShowProjectSummaryModal(false);
        if (showAddMemberToProjectModal) setShowAddMemberToProjectModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showWorkflowGuideModal, showAddMemberModal, showAddProjectModal, showAddTaskModal, showProjectSummaryModal, showAddMemberToProjectModal]);

  // INITIALIZE WITH DEFAULT DATA IF EMPTY
  useEffect(() => {
    // Only initialize if there's no data
    if (projects.length === 0 && teamMembers.length === 0 && tasks.length === 0) {
      const initialProjects = [
        {
          id: 1,
          name: 'Website Redesign',
          description: 'Complete overhaul of company website with modern design',
          progress: 45,
          status: 'active',
          tasks: 12,
          team: 3,
          dueDate: '2024-12-15',
          assignedMembers: [1, 2]
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'Build cross-platform mobile application',
          progress: 20,
          status: 'planning',
          tasks: 8,
          team: 2,
          dueDate: '2024-11-30',
          assignedMembers: [3]
        }
      ];

      const initialTeamMembers = [
        {
          id: 1,
          name: 'Alex Johnson',
          role: 'Frontend Developer',
          email: 'alex@example.com',
          status: 'active',
          tasks: 8,
          projects: 2,
          assignedProjects: [1, 2]
        },
        {
          id: 2,
          name: 'Maria Garcia',
          role: 'UI/UX Designer',
          email: 'maria@example.com',
          status: 'active',
          tasks: 5,
          projects: 1,
          assignedProjects: [1]
        },
        {
          id: 3,
          name: 'David Chen',
          role: 'Backend Developer',
          email: 'david@example.com',
          status: 'active',
          tasks: 7,
          projects: 1,
          assignedProjects: [2]
        }
      ];

      // Set initial data using contexts
      setProjects(initialProjects);
      initialTeamMembers.forEach(member => addMember(member));
    }
  }, []); // Empty dependency array - runs once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar 
        notificationCount={notificationCount} 
        clearNotifications={clearNotifications} 
        taskActions={taskActions} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent mb-2">TaskFlow Pro Dashboard</h1>
              <p className="text-slate-600">Manage projects and team collaboration efficiently</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-emerald-400/50 shadow-sm"></div>
              <span className="text-sm text-slate-500">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Section Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveSection('projects')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'projects'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-sm hover:shadow-md border border-slate-200'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveSection('team')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeSection === 'team'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-sm hover:shadow-md border border-slate-200'
            }`}
          >
            Team
          </button>
        </div>

        {/* Main Content - Shows based on active section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects Section */}
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-xl transition-all duration-300 ${
            activeSection === 'projects' 
              ? 'ring-2 ring-indigo-100 shadow-indigo-100' 
              : ''
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-3 ${
                  activeSection === 'projects'
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-200'
                }`}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Projects</h2>
                  <p className="text-sm text-slate-600">{dashboardMetrics.totalProjects} projects, {dashboardMetrics.totalTasks} tasks</p>
                </div>
              </div>
            </div>
            
            {/* Projects Content */}
            <div className="space-y-6">
              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-indigo-700">{dashboardMetrics.totalProjects}</div>
                  <div className="text-sm text-indigo-600">Total</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-700">{dashboardMetrics.activeProjects}</div>
                  <div className="text-sm text-cyan-600">Active</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-700">{dashboardMetrics.overallProgress}%</div>
                  <div className="text-sm text-emerald-600">Progress</div>
                </div>
              </div>
              
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700">Overall Project Progress</span>
                  <span className="font-semibold text-indigo-700">{dashboardMetrics.overallProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${dashboardMetrics.overallProgress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Projects List */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800">Active Projects</h4>
                
                {projects.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-dashed border-slate-300">
                    <svg className="h-12 w-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="mt-3 text-slate-600">No projects yet</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {teamMembers.length === 0 
                        ? 'Add team members first before creating projects' 
                        : 'Click "+ Project" to add your first project'}
                    </p>
                    <button 
                      onClick={handleAddProjectClick}
                      className={`mt-4 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl ${
                        teamMembers.length === 0
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25'
                          : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/25'
                      }`}
                    >
                      {teamMembers.length === 0 ? 'Add Project' : '+ Project'}
                    </button>
                  </div>
                ) : (
                  <>
                    {projects.map(project => {
                      const assignedMembers = getAssignedMembers(project);
                      
                      return (
                        <div key={project.id} className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm" onClick={() => openProjectSummary(project)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openProjectSummary(project);
                                  }}
                                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-left"
                                >
                                  {project.name}
                                </button>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  project.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  project.status === 'active' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                  'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              
                              {project.description && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <span>{tasks.filter(t => t.projectId === project.id).length} tasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 4.5V5.25A2.25 2.25 0 0018.75 3h-5.25A2.25 2.25 0 0011.25 5.25v13.5A2.25 2.25 0 0013.5 21h5.25a2.25 2.25 0 002.25-2.25z" />
                                  </svg>
                                  <span>{project.team} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{project.dueDate}</span>
                                </div>
                              </div>
                              
                              {/* Assigned Members Section */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-700">Assigned Team Members</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAddMemberToProject(project);
                                    }}
                                    className="text-xs bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 px-2 py-1 rounded hover:from-cyan-100 hover:to-cyan-200 transition-colors border border-cyan-200"
                                  >
                                    + Add Team Member
                                  </button>
                                </div>
                                
                                {assignedMembers.length === 0 ? (
                                  <div className="text-center py-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-dashed border-slate-300">
                                    <p className="text-xs text-slate-500">No team members assigned yet</p>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddMemberToProject(project);
                                      }}
                                      className="text-xs text-cyan-600 hover:text-cyan-700 mt-1"
                                    >
                                      Click to add team members
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {assignedMembers.map(member => (
                                      <div 
                                        key={member.id} 
                                        className="flex items-center gap-1 bg-gradient-to-r from-slate-50 to-blue-50 rounded-full pl-2 pr-3 py-1.5 group/member border border-slate-200"
                                        title={`${member.name} - ${member.projectRole || member.role}`}
                                      >
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                                          <span className="text-xs font-bold text-white">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                          </span>
                                        </div>
                                        <span className="text-xs text-slate-700">{member.name.split(' ')[0]}</span>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeMemberFromProject(project.id, member.id);
                                          }}
                                          className="ml-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover/member:opacity-100 transition-opacity"
                                        >
                                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-lg font-bold text-indigo-700">{project.progress}%</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProjectProgress(project.id, project.progress + 10);
                                }}
                                className="text-xs bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-2 py-1 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={project.progress >= 100}
                              >
                                +10%
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-medium text-indigo-700">{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                                  project.progress < 30 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 
                                  project.progress < 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                }`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* View Tasks Button */}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/tasks', { 
                                  state: { 
                                    projectId: project.id,
                                    projectName: project.name,
                                    projectDescription: project.description,
                                    projectProgress: project.progress,
                                    projectTeam: project.team,
                                    projectDueDate: project.dueDate,
                                    assignedMembers: getAssignedMembers(project)
                                  } 
                                });
                              }}
                              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg shadow-indigo-500/25"
                            >
                              View Tasks on Board
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-center mt-4">
                      <button 
                        onClick={handleAddProjectClick}
                        className={`px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl ${
                          teamMembers.length === 0
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/25'
                        }`}
                      >
                        {teamMembers.length === 0 ? 'Add Team Members First' : '+ Add Another Project'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleAddProjectClick}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
                      teamMembers.length === 0
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 border-amber-200'
                        : 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200'
                    }`}
                  >
                    {teamMembers.length === 0 ? 'Add Team Members First' : 'New Project'}
                  </button>
                  <button 
                    onClick={() => setProjects([])}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-lg hover:from-rose-100 hover:to-rose-200 transition-colors border border-rose-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-xl transition-all duration-300 ${
            activeSection === 'team' 
              ? 'ring-2 ring-rose-100 shadow-rose-100' 
              : ''
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl mr-3 ${
                  activeSection === 'team'
                    ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25'
                    : 'bg-slate-200'
                }`}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 4.5V5.25A2.25 2.25 0 0018.75 3h-5.25A2.25 2.25 0 0011.25 5.25v13.5A2.25 2.25 0 0013.5 21h5.25a2.25 2.25 0 002.25-2.25z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
                  <p className="text-sm text-slate-600">
                    {teamMembers.length === 0 
                      ? 'Add team members first to create projects' 
                      : `${dashboardMetrics.totalTeamMembers} members, ${dashboardMetrics.activeMembers} active`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Team Content */}
            <div className="space-y-6">
              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-rose-700">{dashboardMetrics.totalTeamMembers}</div>
                  <div className="text-sm text-rose-600">Total</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-cyan-700">{dashboardMetrics.activeMembers}</div>
                  <div className="text-sm text-cyan-600">Active</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100 rounded-xl p-3 shadow-sm">
                  <div className="text-2xl font-bold text-indigo-700">
                    {teamMembers.length > 0 
                      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.tasks || 0), 0) / teamMembers.length)
                      : 0}
                  </div>
                  <div className="text-sm text-indigo-600">Avg Tasks</div>
                </div>
              </div>
              
              {/* Team Availability */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-700">Team Availability</span>
                  <span className="font-semibold text-emerald-600">
                    {teamMembers.length > 0 
                      ? Math.round((dashboardMetrics.activeMembers / dashboardMetrics.totalTeamMembers) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-sm transition-all duration-500"
                    style={{ width: `${teamMembers.length > 0 
                      ? (dashboardMetrics.activeMembers / dashboardMetrics.totalTeamMembers) * 100 
                      : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Team Members List */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800">Team Members</h4>
                
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-rose-50 rounded-xl border border-dashed border-slate-300">
                    <svg className="h-12 w-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 4.5V5.25A2.25 2.25 0 0018.75 3h-5.25A2.25 2.25 0 0011.25 5.25v13.5A2.25 2.25 0 0013.5 21h5.25a2.25 2.25 0 002.25-2.25z" />
                    </svg>
                    <p className="mt-3 text-slate-600">No team members yet</p>
                    <p className="text-sm text-slate-500 mt-1">
                      <span className="font-semibold text-rose-600">Required:</span> Add team members first to create projects
                    </p>
                    <button 
                      onClick={() => setShowAddMemberModal(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl shadow-rose-500/25"
                    >
                      Add First Team Member
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {teamMembers.map(member => {
                        const assignedProjects = projects.filter(project => 
                          project.assignedMembers && project.assignedMembers.includes(member.id)
                        );
                        
                        return (
                          <div key={member.id} className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-slate-800">{member.name}</div>
                                <div className="text-xs text-slate-600 mt-1">{member.role}</div>
                                {member.email && (
                                  <div className="text-xs text-slate-500 truncate mt-1">{member.email}</div>
                                )}
                                {member.projectRole && member.projectRole !== member.role && (
                                  <div className="text-xs text-cyan-600 mt-1">
                                    Project Role: {member.projectRole}
                                  </div>
                                )}
                              </div>
                              <div className="relative group">
                                <div className={`h-2 w-2 rounded-full shadow-sm ${
                                  member.status === 'active' ? 'bg-emerald-500' : 
                                  member.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                                }`}></div>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-700">Assigned Projects</span>
                                <span className="text-xs text-slate-500">{assignedProjects.length} projects</span>
                              </div>
                              
                              {assignedProjects.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">Not assigned to any projects</p>
                              ) : (
                                <div className="space-y-1">
                                  {assignedProjects.slice(0, 2).map(project => (
                                    <div key={project.id} className="flex items-center justify-between text-xs">
                                      <span className="text-slate-700 truncate">{project.name}</span>
                                      <span className="text-slate-500">{project.progress}%</span>
                                    </div>
                                  ))}
                                  {assignedProjects.length > 2 && (
                                    <p className="text-xs text-slate-500">+{assignedProjects.length - 2} more</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600">{member.tasks} tasks</span>
                                <span className="text-slate-600">{member.projects} projects</span>
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => updateMemberStatus(member.id, 'active')}
                                  className={`px-2 py-0.5 rounded text-xs border ${
                                    member.status === 'active' 
                                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' 
                                      : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200 hover:from-emerald-50 hover:to-emerald-100'
                                  }`}
                                >
                                  Active
                                </button>
                                <button 
                                  onClick={() => updateMemberStatus(member.id, 'away')}
                                  className={`px-2 py-0.5 rounded text-xs border ${
                                    member.status === 'away' 
                                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200' 
                                      : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200 hover:from-amber-50 hover:to-amber-100'
                                  }`}
                                >
                                  Away
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <button 
                        onClick={() => setShowAddMemberModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl shadow-rose-500/25"
                      >
                        + Add Another Member
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {teamMembers.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Task Distribution</h4>
                  <div className="space-y-2">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center">
                        <div className="w-24">
                          <span className="text-xs text-slate-700 truncate">{member.name}</span>
                        </div>
                        <div className="flex-1 ml-2">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-sm"
                              style={{ width: `${teamMembers.some(m => m.tasks > 0) 
                                ? (member.tasks / Math.max(...teamMembers.map(m => m.tasks > 0 ? m.tasks : 1)) * 100) 
                                : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-8 text-right">
                          <span className="text-xs font-medium text-indigo-700">{member.tasks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Team Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-lg hover:from-rose-100 hover:to-rose-200 transition-colors border border-rose-200"
                  >
                    Add Member
                  </button>
                  <button 
                    onClick={() => {
                      // Clear all team members using context
                      teamMembers.forEach(member => {
                        // First remove from projects
                        member.assignedProjects?.forEach(projectId => {
                          const project = projects.find(p => p.id === projectId);
                          if (project) {
                            updateProject(projectId, {
                              assignedMembers: (project.assignedMembers || []).filter(id => id !== member.id),
                              team: Math.max(0, (project.assignedMembers?.length || 0) - 1)
                            });
                          }
                        });
                      });
                      // Then clear team members
                      teamMembers.forEach(member => deleteMember(member.id));
                    }}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 rounded-lg hover:from-rose-100 hover:to-rose-200 transition-colors border border-rose-200"
                  >
                    Clear Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================== */}
      {/* WORKFLOW GUIDE MODAL - ONBOARDING MODAL              */}
      {/* Opens when clicking "Add Team Members First" button   */}
      {/* ===================================================== */}
      {showWorkflowGuideModal && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowWorkflowGuideModal(false);
            }
          }}
        >
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-slate-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Workflow Required</h3>
                  <p className="text-sm text-slate-600 mt-1">Add team members first to create projects</p>
                </div>
                <button 
                  onClick={() => setShowWorkflowGuideModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-amber-800">Project Creation Requires Team Members</h3>
                      <div className="mt-2 text-amber-700">
                        <p>In TaskFlow Pro, you must follow this workflow:</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-1">
                          <li>Add team members first</li>
                          <li>Then create projects</li>
                          <li>Assign team members to projects</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* CLICKABLE STEP 1 */}
                  <button 
                    onClick={() => {
                      setShowWorkflowGuideModal(false);
                      setActiveSection('team');
                      setShowAddMemberModal(true);
                    }}
                    className="w-full flex items-start gap-4 p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg hover:from-cyan-100 hover:to-cyan-200 transition-colors text-left group border border-cyan-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-200 group-hover:to-cyan-300 transition-colors">
                      <span className="text-cyan-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Add Team Members</p>
                      <p className="text-sm text-slate-600 mt-1">First, add your team members who will work on projects</p>
                      <p className="text-xs text-cyan-600 mt-2 font-medium">Click here to add team members →</p>
                    </div>
                  </button>
                  
                  {/* STEP 2 */}
                  <div className="flex items-start gap-4 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Create Projects</p>
                      <p className="text-sm text-slate-600 mt-1">Then create projects and assign team members to them</p>
                    </div>
                  </div>
                  
                  {/* STEP 3 */}
                  <div className="flex items-start gap-4 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-600 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Add Tasks</p>
                      <p className="text-sm text-slate-600 mt-1">Finally, add tasks to projects and track progress</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setShowWorkflowGuideModal(false)}
                  className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowWorkflowGuideModal(false);
                    setActiveSection('team');
                    setShowAddMemberModal(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-md shadow-rose-500/25"
                >
                  Add Team Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member to Project Modal */}
      {showAddMemberToProjectModal && selectedProjectForMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Add Team Member to Project</h3>
                  <p className="text-sm text-slate-600 mt-1">Add a new team member to "{selectedProjectForMember.name}"</p>
                </div>
                <button 
                  onClick={() => setShowAddMemberToProjectModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg mb-6 border border-cyan-200">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedProjectForMember.name}</p>
                    <p className="text-xs text-slate-600">Enter team member details below</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newMemberForProject.name}
                      onChange={(e) => setNewMemberForProject({...newMemberForProject, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/50"
                      placeholder="Enter team member's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role in Project *
                    </label>
                    <input
                      type="text"
                      value={newMemberForProject.projectRole}
                      onChange={(e) => setNewMemberForProject({...newMemberForProject, projectRole: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/50"
                      placeholder="e.g., Frontend Developer, Project Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      General Role
                    </label>
                    <input
                      type="text"
                      value={newMemberForProject.role}
                      onChange={(e) => setNewMemberForProject({...newMemberForProject, role: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/50"
                      placeholder="e.g., Software Engineer, Designer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newMemberForProject.email}
                      onChange={(e) => setNewMemberForProject({...newMemberForProject, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/50"
                      placeholder="team.member@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setShowAddMemberToProjectModal(false)}
                  className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitMemberToProject}
                  disabled={!newMemberForProject.name.trim() || !newMemberForProject.projectRole.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Summary Modal */}
      {showProjectSummaryModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowProjectSummaryModal(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                    <span>Back to Dashboard</span>
                  </button>
                </div>
                <button 
                  onClick={() => setShowProjectSummaryModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full border ${
                      selectedProject.status === 'completed' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200' :
                      selectedProject.status === 'active' ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-800 border-cyan-200' :
                      'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {selectedProject.status}
                    </span>
                    <span className="text-sm text-slate-600">Due: {selectedProject.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Project Description</h4>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-slate-700">{selectedProject.description || "No description provided."}</p>
                </div>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-700">{selectedProject.progress}%</div>
                  <div className="text-sm text-emerald-600 mt-1">Progress</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 text-center border border-cyan-200">
                  <div className="text-3xl font-bold text-cyan-700">{tasks.filter(t => t.projectId === selectedProject.id).length}</div>
                  <div className="text-sm text-cyan-600 mt-1">Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center border border-rose-200">
                  <div className="text-3xl font-bold text-rose-700">{selectedProject.team}</div>
                  <div className="text-sm text-rose-600 mt-1">Team Members</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center border border-indigo-200">
                  <div className="text-lg font-bold text-indigo-700">{selectedProject.dueDate}</div>
                  <div className="text-sm text-indigo-600 mt-1">Due Date</div>
                </div>
              </div>

              {/* Assigned Members in Summary */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-800">Assigned Team Members</h4>
                  <button 
                    onClick={() => {
                      setShowProjectSummaryModal(false);
                      setTimeout(() => openAddMemberToProject(selectedProject), 100);
                    }}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 rounded-lg hover:from-cyan-100 hover:to-cyan-200 transition-colors border border-cyan-200"
                  >
                    + Add Team Member
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                  {getAssignedMembers(selectedProject).length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-slate-500">No team members assigned to this project yet.</p>
                      <button 
                        onClick={() => {
                          setShowProjectSummaryModal(false);
                          setTimeout(() => openAddMemberToProject(selectedProject), 100);
                        }}
                        className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        Click to add team members
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getAssignedMembers(selectedProject).map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-bold text-white">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{member.name}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-600">{member.role}</span>
                                {member.projectRole && member.projectRole !== member.role && (
                                  <>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-cyan-600">Project: {member.projectRole}</span>
                                  </>
                                )}
                              </div>
                              {member.email && (
                                <p className="text-xs text-slate-500 mt-1">{member.email}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeMemberFromProject(selectedProject.id, member.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-700 font-medium">Project Progress</span>
                  <span className="font-semibold text-indigo-700">{selectedProject.progress}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                      selectedProject.progress < 30 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 
                      selectedProject.progress < 70 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => {
                      updateProjectProgress(selectedProject.id, selectedProject.progress + 10);
                      setShowProjectSummaryModal(false);
                    }}
                    className="text-sm bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedProject.progress >= 100}
                  >
                    Mark +10% Progress
                  </button>
                </div>
              </div>

              {/* Task Board Button */}
              <div className="mb-8 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-cyan-900">Manage Tasks on Task Board</h4>
                    <p className="text-sm text-cyan-700 mt-1">
                      View and manage all tasks for this project on the interactive task board
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowProjectSummaryModal(false);
                      navigate('/tasks', { 
                        state: { 
                          projectId: selectedProject.id,
                          projectName: selectedProject.name,
                          projectDescription: selectedProject.description,
                          projectProgress: selectedProject.progress,
                          projectTeam: selectedProject.team,
                          projectDueDate: selectedProject.dueDate,
                          assignedMembers: getAssignedMembers(selectedProject)
                        } 
                      });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md shadow-cyan-500/25"
                  >
                    Open Task Board
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setShowProjectSummaryModal(false)}
                  className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-300"
                >
                  <FiHome className="h-5 w-5" />
                  Back to Home
                </button>
                <button 
                  onClick={() => {
                    updateProjectProgress(selectedProject.id, 100);
                    setShowProjectSummaryModal(false);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md shadow-emerald-500/25"
                  disabled={selectedProject.progress >= 100}
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/50"
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select
                  value={newTask.section}
                  onChange={(e) => setNewTask({...newTask, section: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                >
                  <option value="projects">Projects</option>
                  <option value="team">Team</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewTask}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md shadow-cyan-500/25"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                  rows="3"
                  placeholder="Brief project description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assign Team Members ({teamMembers.length} available)
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 bg-white/50">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">
                      <p>No team members available</p>
                      <p className="text-sm">Add team members first</p>
                    </div>
                  ) : (
                    teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded">
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={newProject.assignedMembers?.includes(member.id) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProject({
                                ...newProject,
                                assignedMembers: [...(newProject.assignedMembers || []), member.id]
                              });
                            } else {
                              setNewProject({
                                ...newProject,
                                assignedMembers: newProject.assignedMembers?.filter(id => id !== member.id) || []
                              });
                            }
                          }}
                          className="h-4 w-4 text-cyan-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium text-slate-800">{member.name}</div>
                          <div className="text-xs text-slate-600">{member.role}</div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Select team members to assign to this project
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddProjectModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewProject}
                disabled={!newProject.name.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/25"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                  placeholder="Job role"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white/50"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={submitNewMember}
                disabled={!newMember.name.trim() || !newMember.role.trim()}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-500/25"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <div className="app">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<MainDashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/tasks" element={<TaskBoard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/team" element={<Team />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;