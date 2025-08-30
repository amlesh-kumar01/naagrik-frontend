/**
 * Utility functions for issue management permissions and operations
 */

/**
 * Check if user can manage a specific issue
 * @param {Object} issue - The issue object
 * @param {Object} user - The current user object
 * @returns {boolean} - Whether user can manage the issue
 */
export const canManageIssue = (issue, user) => {
  if (!user || !issue) return false;

  // Super admin can manage all issues
  if (user.role === 'SUPER_ADMIN') return true;

  // Stewards can manage issues in their assigned zones
  if (user.role === 'STEWARD') {
    // Check if issue is in steward's assigned zones
    if (user.assignedZones && Array.isArray(user.assignedZones)) {
      return user.assignedZones.some(zone => 
        zone.id === issue.zone_id || zone.id === issue.zoneId
      );
    }
    // Fallback for single zone assignment
    if (user.assignedZone) {
      return issue.zone_id === user.assignedZone || issue.zoneId === user.assignedZone;
    }
  }

  return false;
};

/**
 * Check if user can archive/delete issues
 * @param {Object} user - The current user object
 * @returns {boolean} - Whether user can archive issues
 */
export const canArchiveIssues = (user) => {
  return user && (user.role === 'STEWARD' || user.role === 'SUPER_ADMIN');
};

/**
 * Check if user can delete issues (hard delete)
 * @param {Object} user - The current user object
 * @returns {boolean} - Whether user can hard delete issues
 */
export const canDeleteIssues = (user) => {
  return user && user.role === 'SUPER_ADMIN';
};

/**
 * Check if an issue can be archived (only resolved issues)
 * @param {Object} issue - The issue object
 * @returns {boolean} - Whether the issue can be archived
 */
export const canArchiveIssue = (issue) => {
  return issue && issue.status === 'RESOLVED';
};

/**
 * Check if an issue can be marked as duplicate
 * @param {Object} issue - The issue object
 * @returns {boolean} - Whether the issue can be marked as duplicate
 */
export const canMarkAsDuplicate = (issue) => {
  return issue && issue.status !== 'DUPLICATE' && issue.status !== 'ARCHIVED';
};

/**
 * Get available status transitions for an issue
 * @param {string} currentStatus - Current issue status
 * @param {Object} user - The current user object
 * @returns {Array} - Array of available status options
 */
export const getAvailableStatusTransitions = (currentStatus, user) => {
  const baseStatuses = [
    { value: 'OPEN', label: 'Open', color: 'blue' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged', color: 'yellow' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'orange' },
    { value: 'RESOLVED', label: 'Resolved', color: 'green' }
  ];

  // Only stewards and admins can change status
  if (!canArchiveIssues(user)) return [];

  switch (currentStatus) {
    case 'OPEN':
      return [
        { value: 'ACKNOWLEDGED', label: 'Acknowledge', color: 'yellow' },
        { value: 'ARCHIVED', label: 'Archive', color: 'gray' },
        { value: 'DUPLICATE', label: 'Mark as Duplicate', color: 'purple' }
      ];
    
    case 'ACKNOWLEDGED':
      return [
        { value: 'IN_PROGRESS', label: 'Start Work', color: 'orange' },
        { value: 'RESOLVED', label: 'Mark Resolved', color: 'green' },
        { value: 'ARCHIVED', label: 'Archive', color: 'gray' },
        { value: 'DUPLICATE', label: 'Mark as Duplicate', color: 'purple' }
      ];
    
    case 'IN_PROGRESS':
      return [
        { value: 'RESOLVED', label: 'Mark Resolved', color: 'green' },
        { value: 'OPEN', label: 'Reopen', color: 'blue' },
        { value: 'ARCHIVED', label: 'Archive', color: 'gray' }
      ];
    
    case 'RESOLVED':
      return [
        { value: 'OPEN', label: 'Reopen', color: 'blue' },
        { value: 'ARCHIVED', label: 'Archive', color: 'gray' }
      ];
    
    case 'ARCHIVED':
      // Only admins can restore from archived
      return user.role === 'SUPER_ADMIN' 
        ? [{ value: 'OPEN', label: 'Restore', color: 'blue' }] 
        : [];
    
    case 'DUPLICATE':
      // Cannot change status from duplicate
      return [];
    
    default:
      return baseStatuses;
  }
};

/**
 * Get issue status color
 * @param {string} status - Issue status
 * @returns {string} - CSS color class
 */
export const getIssueStatusColor = (status) => {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ACKNOWLEDGED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'DUPLICATE':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get issue priority color
 * @param {string} priority - Issue priority
 * @returns {string} - CSS color class
 */
export const getIssuePriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'URGENT':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Validate archive reason
 * @param {string} reason - Archive reason
 * @param {string} archiveType - Type of archive
 * @returns {Object} - Validation result
 */
export const validateArchiveReason = (reason, archiveType) => {
  if (!reason || reason.trim().length < 10) {
    return {
      isValid: false,
      error: 'Please provide a detailed reason (at least 10 characters)'
    };
  }

  const validArchiveTypes = ['RESOLVED_EXTERNALLY', 'INVALID', 'SPAM', 'DUPLICATE'];
  if (archiveType && !validArchiveTypes.includes(archiveType)) {
    return {
      isValid: false,
      error: 'Invalid archive type selected'
    };
  }

  return { isValid: true };
};
