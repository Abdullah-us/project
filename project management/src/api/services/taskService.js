// Task service - will connect to backend later
import { taskEndpoints } from '../endpoints/taskEndpoints';

export const taskService = {
  getAll: async () => {
    console.log('Mock: Get all tasks');
    return { data: [] };
  },

  getById: async (id) => {
    console.log(`Mock: Get task ${id}`);
    return { data: null };
  },

  create: async (taskData) => {
    console.log('Mock: Create task', taskData);
    return { data: { id: Date.now(), ...taskData } };
  },

  update: async (id, taskData) => {
    console.log(`Mock: Update task ${id}`, taskData);
    return { data: { id, ...taskData } };
  },

  delete: async (id) => {
    console.log(`Mock: Delete task ${id}`);
    return { data: { success: true } };
  },

  updateStatus: async (id, status) => {
    console.log(`Mock: Update task ${id} status to ${status}`);
    return { data: { id, status } };
  },
};