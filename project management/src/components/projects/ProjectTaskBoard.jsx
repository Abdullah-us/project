import { useState, useEffect, useMemo } from 'react';
import ProjectColumn from "./ProjectColumn.jsx";

function ProjectTaskBoard({ projects, teamMembers, onUpdateProjectTasks }) {
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Use useMemo instead of useState+useEffect to avoid unnecessary state updates
  const allTasks = useMemo(() => {
    const tasks = [];
    projects.forEach(project => {
      if (project.columnTasks) {
        Object.entries(project.columnTasks).forEach(([status, taskList]) => {
          taskList.forEach(task => {
            tasks.push({
              ...task,
              projectId: project.id,
              projectName: project.name,
              status: status
            });
          });
        });
      }
    });
    return tasks;
  }, [projects]);

  const handleAddTask = (taskData) => {
    if (!selectedProject) return;
    
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...taskData,
      createdAt: new Date().toISOString(),
      projectId: selectedProject.id
    };

    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject.id) {
        const currentTasks = project.columnTasks?.[taskData.status] || [];
        return {
          ...project,
          columnTasks: {
            ...project.columnTasks,
            [taskData.status]: [...currentTasks, newTask]
          },
          taskCount: (project.taskCount || 0) + 1
        };
      }
      return project;
    });

    onUpdateProjectTasks?.(updatedProjects);
  };

  const handleMoveTask = (taskId, newStatus, projectId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        let movedTask = null;
        const updatedColumnTasks = { ...project.columnTasks };
        
        // Remove from old status
        Object.keys(updatedColumnTasks).forEach(status => {
          updatedColumnTasks[status] = updatedColumnTasks[status].filter(task => {
            if (task.id === taskId) {
              movedTask = { ...task, status: newStatus };
              return false;
            }
            return true;
          });
        });

        // Add to new status
        if (movedTask) {
          const currentTasks = updatedColumnTasks[newStatus] || [];
          updatedColumnTasks[newStatus] = [...currentTasks, movedTask];
        }

        return {
          ...project,
          columnTasks: updatedColumnTasks
        };
      }
      return project;
    });

    onUpdateProjectTasks?.(updatedProjects);
  };

  const handleUpdateTask = (taskId, updates) => {
    const updatedProjects = projects.map(project => {
      const updatedColumnTasks = { ...project.columnTasks };
      let taskUpdated = false;

      Object.keys(updatedColumnTasks).forEach(status => {
        updatedColumnTasks[status] = updatedColumnTasks[status].map(task => {
          if (task.id === taskId) {
            taskUpdated = true;
            const updatedTask = { ...task, ...updates };
            // If status changed, we need to move it
            if (updates.status && updates.status !== status) {
              // This task will be removed from this column in the next step
              return null;
            }
            return updatedTask;
          }
          return task;
        }).filter(task => task !== null); // Remove null tasks
      });

      // Handle status change by moving task to new column
      if (updates.status) {
        Object.keys(updatedColumnTasks).forEach(status => {
          // Find task that needs to be moved
          updatedColumnTasks[status] = updatedColumnTasks[status].filter(task => {
            if (task && task.id === taskId && updates.status !== status) {
              const movedTask = { ...task, status: updates.status };
              const currentTasks = updatedColumnTasks[updates.status] || [];
              updatedColumnTasks[updates.status] = [...currentTasks, movedTask];
              return false;
            }
            return true;
          });
        });
      }

      if (taskUpdated) {
        return { ...project, columnTasks: updatedColumnTasks };
      }
      return project;
    });

    onUpdateProjectTasks?.(updatedProjects);
  };

  const handleDeleteTask = (taskId) => {
    const updatedProjects = projects.map(project => {
      let taskDeleted = false;
      const updatedColumnTasks = { ...project.columnTasks };
      
      Object.keys(updatedColumnTasks).forEach(status => {
        const originalLength = updatedColumnTasks[status].length;
        updatedColumnTasks[status] = updatedColumnTasks[status].filter(task => task.id !== taskId);
        if (originalLength !== updatedColumnTasks[status].length) {
          taskDeleted = true;
        }
      });

      return {
        ...project,
        columnTasks: updatedColumnTasks,
        taskCount: taskDeleted ? Math.max(0, (project.taskCount || 0) - 1) : project.taskCount
      };
    });

    onUpdateProjectTasks?.(updatedProjects);
  };

  const selectedProjectTasks = useMemo(() => {
    return selectedProject 
      ? allTasks.filter(task => task.projectId === selectedProject.id)
      : [];
  }, [selectedProject, allTasks]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
        <p className="text-gray-600">Create your first project to see it on the task board</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Selection */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedProject?.id === project.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {project.name}
              <span className="ml-2 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">
                {project.taskCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Board */}
      {selectedProject ? (
        <div className="task-board">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
            <p className="text-gray-600">Manage tasks for {selectedProject.name}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['todo', 'in-progress', 'review', 'done'].map((status) => (
              <ProjectColumn
                key={status}
                status={status}
                tasks={selectedProjectTasks.filter(task => task.status === status)}
                onAddTask={(taskData) => handleAddTask({ ...taskData, status })}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onMoveTask={(taskId, newStatus) => 
                  handleMoveTask(taskId, newStatus, selectedProject.id)
                }
                teamMembers={teamMembers}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h3>
          <p className="text-gray-600">Click on a project above to view its task board</p>
        </div>
      )}
    </div>
  );
}

export default ProjectTaskBoard;