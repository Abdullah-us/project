// Project service - will connect to backend later
import { projectEndpoints } from '../endpoints/projectEndpoints';

export const projectService = {
  getAll: async () => {
    console.log('Mock: Get all projects');
    // This will be replaced with: return api.get(projectEndpoints.getAll());
    return { data: [] };
  },

  getById: async (id) => {
    console.log(`Mock: Get project ${id}`);
    return { data: null };
  },

  create: async (projectData) => {
    console.log('Mock: Create project', projectData);
    return { data: { id: Date.now(), ...projectData } };
  },

  update: async (id, projectData) => {
    console.log(`Mock: Update project ${id}`, projectData);
    return { data: { id, ...projectData } };
  },

  delete: async (id) => {
    console.log(`Mock: Delete project ${id}`);
    return { data: { success: true } };
  },

  getTasks: async (id) => {
    console.log(`Mock: Get tasks for project ${id}`);
    return { data: [] };
  },
};