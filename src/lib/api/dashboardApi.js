import api from './client';

export const dashboardAPI = {
  // Public dashboard stats
  getPublicStats: () => api.get('/dashboard/public/stats'),

  // Issue trends
  getIssueTrends: (days = 30) => api.get(`/dashboard/trends?days=${days}`),

  // Top issues
  getTopIssues: (limit = 10) => api.get(`/dashboard/top-issues?limit=${limit}`),

  // Category statistics
  getCategoryStats: () => api.get('/dashboard/categories'),

  // Issue distribution (geographic)
  getIssueDistribution: (limit = 50) => api.get(`/dashboard/distribution?limit=${limit}`),

  // Admin dashboard overview
  getAdminOverview: () => api.get('/dashboard/admin/overview'),

  // Steward dashboard
  getStewardDashboard: () => api.get('/dashboard/steward/dashboard'),

  // Steward workload
  getStewardWorkload: () => api.get('/dashboard/steward/workload'),

  // Critical issues for steward
  getStewardCriticalIssues: () => api.get('/dashboard/steward/critical-issues'),

  // Admin - User activity
  getAdminUserActivity: () => api.get('/dashboard/admin/user-activity'),

  // Admin - Steward performance
  getAdminStewardPerformance: (limit = 20) => api.get(`/dashboard/admin/steward-performance?limit=${limit}`),

  // Admin - Resolution time stats
  getAdminResolutionTimeStats: () => api.get('/dashboard/admin/resolution-time'),

  // Admin - Critical issues
  getAdminCriticalIssues: () => api.get('/dashboard/admin/critical-issues'),

  // Admin - Specific steward workload
  getAdminStewardWorkload: (stewardId) => api.get(`/dashboard/admin/steward/${stewardId}/workload`),
};
