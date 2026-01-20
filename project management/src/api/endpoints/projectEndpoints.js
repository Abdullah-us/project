// Project API endpoints
export const projectEndpoints = {
  getAll: () => '/projects',
  getById: (id) => `/projects/${id}`,
  create: () => '/projects',
  update: (id) => `/projects/${id}`,
  delete: (id) => `/projects/${id}`,
  getTasks: (id) => `/projects/${id}/tasks`,
  addMember: (id) => `/projects/${id}/members`,
  removeMember: (projectId, memberId) => `/projects/${projectId}/members/${memberId}`,
  updateProgress: (id) => `/projects/${id}/progress`,
  getMembers: (id) => `/projects/${id}/members`,
};