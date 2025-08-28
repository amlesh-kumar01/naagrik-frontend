// Import all stores
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useIssuesStore } from './stores/issuesStore';

// Re-export all stores for backward compatibility
export { useAuthStore };
export { useUIStore };
export { useIssuesStore };
