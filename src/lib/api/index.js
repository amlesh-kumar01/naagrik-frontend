// Main API exports
export { issueAPI } from './issueApi';
export { commentAPI } from './commentApi';
export { authAPI } from './authApi';
export { userAPI } from './userApi';
export { stewardAPI } from './stewardApi';
export { uploadAPI } from './uploadApi';
export { zoneAPI } from './zoneApi';
export { categoryAPI } from './categoryApi';
export { adminAPI } from './adminApi';
export { dashboardAPI } from './dashboardApi';
export { default as apiClient } from './client';

// Export individual APIs for backward compatibility
export * from './issueApi';
export * from './commentApi';
export * from './authApi';
export * from './userApi';
export * from './stewardApi';
export * from './uploadApi';
export * from './zoneApi';
export * from './categoryApi';
export * from './adminApi';
export * from './dashboardApi';
