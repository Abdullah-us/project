// Task API endpoints
export const taskEndpoints = {
  getAll: () => '/tasks',
  getById: (id) => `/tasks/${id}`,
  create: () => '/tasks',
  update: (id) => `/tasks/${id}`,
  delete: (id) => `/tasks/${id}`,
  updateStatus: (id) => `/tasks/${id}/status`,
  assignUser: (id) => `/tasks/${id}/assign`,
  addComment: (id) => `/tasks/${id}/comments`,
  getByProject: (projectId) => `/tasks?projectId=${projectId}`,
  getByStatus: (status) => `/tasks?status=${status}`,
};