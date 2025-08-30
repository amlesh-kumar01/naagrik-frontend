import { create } from 'zustand';

// UI Store for general UI state (exactly from original index.js)
export const useUIStore = create((set) => ({
  // Map state
  mapCenter: [28.6139, 77.2090],
  mapZoom: 13,
  selectedIssue: null,
  mapViewport: null,

  // Loading states
  isLoadingIssues: false,

  // Modal states
  isReportModalOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,

  // Filters
  issueFilters: {
    status: '',
    categoryId: '',
    search: '',
  },

  // Actions
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setMapViewport: (viewport) => set({ mapViewport: viewport }),

  setLoadingIssues: (loading) => set({ isLoadingIssues: loading }),

  openReportModal: () => set({ isReportModalOpen: true }),
  closeReportModal: () => set({ isReportModalOpen: false }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  setIssueFilters: (filters) => set(state => ({ 
    issueFilters: { ...state.issueFilters, ...filters } 
  })),
  clearIssueFilters: () => set({ 
    issueFilters: { status: '', categoryId: '', search: '' } 
  }),
}));
