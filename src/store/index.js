// Import all stores
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useIssuesStore } from './stores/issuesStore';
import { useUserStore } from './stores/userStore';
import { useStewardStore } from './stores/stewardStore';
import { useZoneStore } from './stores/zoneStore';
import { useBadgeStore } from './stores/badgeStore';
import { useDashboardStore } from './stores/dashboardStore';
import { useAdminStore } from './stores/adminStore';

// Re-export all stores for backward compatibility
export { useAuthStore };
export { useUIStore };
export { useIssuesStore };
export { useUserStore };
export { useStewardStore };
export { useZoneStore };
export { useBadgeStore };
export { useDashboardStore };
export { useAdminStore };
