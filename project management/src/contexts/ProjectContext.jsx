// src/contexts/ProjectContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('projects');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  });
  
  const [selectedProject, setSelectedProject] = useState(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  }, [projects]);

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: project.id || Date.now(),
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const value = useMemo(() => ({
    projects,
    selectedProject,
    setSelectedProject,
    addProject,
    updateProject,
    deleteProject,
    setProjects
  }), [projects, selectedProject]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);