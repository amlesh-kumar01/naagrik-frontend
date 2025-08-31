import { create } from 'zustand';
import { issueAPI } from '../../lib/api/issueApi';
import { categoryAPI } from '../../lib/api/categoryApi';

// Category Store - for managing issue categories
export const useCategoryStore = create((set, get) => ({
  // State
  categories: [],
  categoryStats: {},
  currentCategory: null,
  isLoading: false,
  error: null,

  // Actions
  setCategories: (categories) => set({ categories }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all categories
  fetchAllCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.getCategories();
      const categories = response.data?.categories || response.categories || [];
      set({ categories, isLoading: false });
      return { success: true, categories };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch categories';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch category details
  fetchCategoryDetails: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.getCategoryById(categoryId);
      const category = response.data?.category || response.category;
      set({ currentCategory: category, isLoading: false });
      return { success: true, category };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch category details';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Admin: Create new category
  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.createCategory(categoryData);
      const newCategory = response.data?.category || response.category;
      
      // Update categories list
      const { categories } = get();
      set({ 
        categories: [...categories, newCategory], 
        isLoading: false 
      });
      
      return { success: true, category: newCategory };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Admin: Update category
  updateCategory: async (categoryId, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.updateCategory(categoryId, categoryData);
      const updatedCategory = response.data?.category || response.category;
      
      // Update categories list
      const { categories } = get();
      const updatedCategories = categories.map(category => 
        category.id === categoryId ? updatedCategory : category
      );
      
      set({ 
        categories: updatedCategories,
        currentCategory: updatedCategory,
        isLoading: false 
      });
      
      return { success: true, category: updatedCategory };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Admin: Delete category
  deleteCategory: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      await categoryAPI.deleteCategory(categoryId);
      
      // Remove from categories list
      const { categories } = get();
      const filteredCategories = categories.filter(category => category.id !== categoryId);
      
      set({ 
        categories: filteredCategories,
        currentCategory: null,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch category statistics
  fetchCategoryStats: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.getCategoryStats(categoryId);
      const stats = response.data?.stats || response.stats;
      
      set(state => ({ 
        categoryStats: { ...state.categoryStats, [categoryId]: stats },
        isLoading: false 
      }));
      
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch category statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch issues by category
  fetchCategoryIssues: async (categoryId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.getCategoryIssues(categoryId, params);
      const issues = response.data?.issues || response.issues || [];
      
      set({ isLoading: false });
      return { success: true, issues };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch category issues';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch categories with analytics
  fetchCategoriesWithStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.getCategoriesWithStats();
      const categoriesWithStats = response.data?.categories || response.categories || [];
      
      set({ 
        categories: categoriesWithStats,
        isLoading: false 
      });
      
      return { success: true, categories: categoriesWithStats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch categories with stats';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Reset store
  reset: () => set({
    categories: [],
    categoryStats: {},
    currentCategory: null,
    isLoading: false,
    error: null
  }),
}));
