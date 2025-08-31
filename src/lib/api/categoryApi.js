import api from './client';

// Category API for issue categories management
export const categoryAPI = {
  // Public category access
  getAllCategories: () => api.get('/zones/categories'),
  getCategoryById: (categoryId) => api.get(`/categories/${categoryId}`),
  getCategoryStats: (categoryId) => api.get(`/categories/${categoryId}/stats`),

  // Admin: Category management
  createCategory: (data) => api.post('/categories', {
    name: data.name,
    description: data.description
  }),

  updateCategory: (categoryId, data) => api.put(`/categories/${categoryId}`, {
    name: data.name,
    description: data.description
  }),

  deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}`),

  // Category-specific issue queries
  getCategoryIssues: (categoryId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/categories/${categoryId}/issues${queryString ? `?${queryString}` : ''}`);
  },

  // Category filtering for issues
  getIssuesByCategory: (categoryId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/issues?category=${categoryId}${queryString ? `&${queryString}` : ''}`);
  },

  // Category analytics
  getCategoryAnalytics: () => api.get('/issues/analytics/categories'),
  getCategoriesWithStats: () => api.get('/issues/analytics/categories')
};
