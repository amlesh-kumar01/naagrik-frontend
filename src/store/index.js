// Import all stores
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useIssuesStore } from './stores/issuesStore';
import { useUserStore } from './stores/userStore';
import { useStewardStore } from './stores/stewardStore';

// Re-export all stores for backward compatibility
export { useAuthStore };
export { useUIStore };
export { useIssuesStore };
export { useUserStore };
export { useStewardStore };
