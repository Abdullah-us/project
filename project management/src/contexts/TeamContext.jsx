// src/contexts/TeamContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  // Load team members from localStorage on initial render
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('teamMembers');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading team members from localStorage:', error);
      return [];
    }
  });

  // Save team members to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    } catch (error) {
      console.error('Error saving team members to localStorage:', error);
    }
  }, [teamMembers]);

  const addMember = (member) => {
    const newMember = {
      ...member,
      id: Date.now(), // Generate unique ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: member.status || 'active',
      tasks: member.tasks || 0,
      projects: member.projects || 0,
      assignedProjects: member.assignedProjects || []
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const updateMember = (id, updates) => {
    setTeamMembers(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      } : m
    ));
  };

  const deleteMember = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const getMember = (id) => teamMembers.find(m => m.id === id);

  const getMembersByProject = (projectId) => {
    return teamMembers.filter(member => 
      member.assignedProjects?.includes(projectId)
    );
  };

  const assignToProject = (memberId, projectId) => {
    const member = getMember(memberId);
    if (member && !member.assignedProjects?.includes(projectId)) {
      updateMember(memberId, {
        assignedProjects: [...(member.assignedProjects || []), projectId],
        projects: (member.projects || 0) + 1
      });
    }
  };

  const removeFromProject = (memberId, projectId) => {
    const member = getMember(memberId);
    if (member && member.assignedProjects?.includes(projectId)) {
      updateMember(memberId, {
        assignedProjects: member.assignedProjects.filter(id => id !== projectId),
        projects: Math.max(0, (member.projects || 0) - 1)
      });
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    teamMembers,
    setTeamMembers,
    addMember,
    updateMember,
    deleteMember,
    getMember,
    getMembersByProject,
    assignToProject,
    removeFromProject
  }), [teamMembers]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};