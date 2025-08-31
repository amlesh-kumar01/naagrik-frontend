'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore, useIssuesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Archive, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  MoreHorizontal,
  Eye,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  'OPEN': { color: 'blue', icon: Eye, label: 'Open' },
  'ACKNOWLEDGED': { color: 'yellow', icon: CheckCircle, label: 'Acknowledged' },
  'IN_PROGRESS': { color: 'orange', icon: PlayCircle, label: 'In Progress' },
  'RESOLVED': { color: 'green', icon: CheckCircle, label: 'Resolved' },
  'CLOSED': { color: 'gray', icon: XCircle, label: 'Closed' },
  'DUPLICATE': { color: 'purple', icon: Copy, label: 'Duplicate' }
};

const ARCHIVE_TYPES = [
  { value: 'RESOLVED_EXTERNALLY', label: 'Resolved Externally' },
  { value: 'INVALID', label: 'Invalid Report' },
  { value: 'SPAM', label: 'Spam Report' },
  { value: 'DUPLICATE', label: 'Duplicate Issue' }
];

const IssueManagementActions = ({ 
  issue, 
  onStatusUpdate, 
  onIssueRemoved,
  compact = false,
  className = '' 
}) => {
  const { user } = useAuthStore();
  const { archiveIssue, deleteIssue, markAsDuplicate, updateIssueStatus } = useIssuesStore();
  
  const dropdownButtonRef = useRef(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveType, setArchiveType] = useState('RESOLVED_EXTERNALLY');
  const [duplicateIssueId, setDuplicateIssueId] = useState('');
  const [duplicateReason, setDuplicateReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen) {
        // Check if click is outside the dropdown container
        const dropdownContainer = event.target.closest('.dropdown-container');
        if (!dropdownContainer) {
          setIsDropdownOpen(false);
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Role-based permissions (CITIZEN, STEWARD, SUPER_ADMIN only)
  const isCitizen = user?.role === 'CITIZEN';
  const isSteward = user?.role === 'STEWARD';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isIssueOwner = user?.id === issue.user_id;
  
  const canChangeStatus = isSteward || isSuperAdmin;
  const canArchive = canChangeStatus && issue.status === 'RESOLVED';
  const canDelete = isSuperAdmin || isIssueOwner;
  const canMarkDuplicate = canChangeStatus;

  // Available status transitions
  const getAvailableStatuses = () => {
    const current = issue.status;
    const statuses = [];

    if (canChangeStatus) {
      switch (current) {
        case 'OPEN':
          statuses.push('ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
          break;
        case 'ACKNOWLEDGED':
          statuses.push('IN_PROGRESS', 'RESOLVED', 'CLOSED');
          break;
        case 'IN_PROGRESS':
          statuses.push('RESOLVED', 'CLOSED');
          break;
        case 'RESOLVED':
          statuses.push('CLOSED');
          if (canMarkDuplicate) statuses.push('DUPLICATE');
          break;
        default:
          break;
      }
    }

    return statuses.map(status => ({
      value: status,
      label: STATUS_CONFIG[status]?.label || status,
      color: STATUS_CONFIG[status]?.color || 'gray',
      icon: STATUS_CONFIG[status]?.icon || Settings
    }));
  };

  const availableTransitions = getAvailableStatuses();

  // Don't show if user has no permissions
  if (!canChangeStatus && !canDelete) {
    return null;
  }

  // Modal handlers
  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await archiveIssue(issue.id, {
        reason: archiveReason.trim(),
        archiveType: archiveType,
        notes: `Issue archived by ${user.role.toLowerCase()}: ${user.name}`
      });
      
      toast.success('Issue archived successfully');
      setShowArchiveModal(false);
      setArchiveReason('');
      onIssueRemoved?.(issue.id);
    } catch (error) {
      toast.error(error.message || 'Failed to archive issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteIssue(issue.id, {
        deletedBy: user.id,
        notes: `Issue permanently deleted by ${isSuperAdmin ? 'Super Admin' : 'Issue Owner'}: ${user.name}`
      });
      
      const deletedData = result.deletedData || {};
      const mediaCount = deletedData.mediaFiles || 0;
      
      toast.success(
        `Issue permanently deleted! ${mediaCount > 0 ? `${mediaCount} media file${mediaCount !== 1 ? 's' : ''} removed from cloud storage.` : ''}`
      );
      
      setShowDeleteModal(false);
      onIssueRemoved?.(issue.id);
    } catch (error) {
      toast.error(error.message || 'Failed to delete issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDuplicate = async () => {
    setIsLoading(true);
    try {
      await markAsDuplicate(issue.id, {
        primaryIssueId: duplicateIssueId.trim(),
        reason: duplicateReason.trim()
      });
      
      toast.success('Issue marked as duplicate');
      setShowDuplicateModal(false);
      setDuplicateIssueId('');
      setDuplicateReason('');
      onStatusUpdate?.(issue.id, 'DUPLICATE');
    } catch (error) {
      toast.error(error.message || 'Failed to mark as duplicate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      await updateIssueStatus(issue.id, newStatus, statusReason.trim());
      
      toast.success(`Issue status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
      onStatusUpdate?.(issue.id, newStatus);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {/* Quick Actions Dropdown */}
        {availableTransitions.length > 0 && (
          <div className="relative dropdown-container">
            <Button 
              ref={dropdownButtonRef}
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!isDropdownOpen && dropdownButtonRef.current) {
                  const rect = dropdownButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.right - 160 + window.scrollX // Align right edge
                  });
                }
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`h-9 px-3 transition-colors duration-200 ${
                isDropdownOpen 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {isDropdownOpen && createPortal(
              <div 
                className="fixed bg-white shadow-2xl border rounded-lg p-1 min-w-[160px] max-w-[200px] z-[9999]"
                style={{ 
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {availableTransitions.slice(0, 3).map(status => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.value}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewStatus(status.value);
                        setShowStatusModal(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 rounded-md flex items-center space-x-2 transition-colors duration-150 border-none outline-none"
                    >
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{status.label}</span>
                    </button>
                  );
                })}
              </div>,
              document.body
            )}
          </div>
        )}

        {/* Archive */}
        {canArchive && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowArchiveModal(true);
            }}
            className="h-9 px-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors duration-200"
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}

        {/* Delete */}
        {canDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full management panel for detail page
  return (
    <div className={`bg-gray-50 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Issue Management</span>
        </h4>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {user?.role?.replace('_', ' ')}
          </Badge>
          <Badge variant={STATUS_CONFIG[issue.status]?.color === 'green' ? 'success' : 'secondary'}>
            {STATUS_CONFIG[issue.status]?.label || issue.status}
          </Badge>
        </div>
      </div>

      {/* Status Transitions */}
      {availableTransitions.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Available Status Changes</h5>
          <div className="grid grid-cols-2 gap-2">
            {availableTransitions.map(status => {
              const Icon = status.icon;
              return (
                <Button
                  key={status.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewStatus(status.value);
                    setShowStatusModal(true);
                  }}
                  className="justify-start h-10"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {status.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Administrative Actions */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700">Administrative Actions</h5>
        <div className="flex flex-wrap gap-2">
          {canArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveModal(true)}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive (Soft Delete)
            </Button>
          )}

          {canMarkDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDuplicateModal(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Mark Duplicate
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hard Delete
            </Button>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setNewStatus('');
          setStatusReason('');
        }}
        onConfirm={handleStatusUpdate}
        title="Update Issue Status"
        description="Status updates will be visible to all users and notify issue followers."
        icon={Settings}
        variant="info"
        confirmText="Update Status"
        isLoading={isLoading}
        showSelectInput={true}
        selectOptions={availableTransitions}
        selectValue={newStatus}
        onSelectChange={setNewStatus}
        selectLabel="New Status"
        selectRequired={true}
        showTextInput={true}
        textInputValue={statusReason}
        onTextInputChange={setStatusReason}
        textInputLabel="Reason"
        textInputPlaceholder="Explain the reason for status change..."
        textInputRequired={true}
      />

      {/* Archive Modal */}
      <ConfirmationModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setArchiveReason('');
        }}
        onConfirm={handleArchive}
        title="Archive Issue"
        description="Archiving will soft-delete this issue. It can be restored later if needed."
        icon={Archive}
        variant="warning"
        confirmText="Archive Issue"
        isLoading={isLoading}
        showSelectInput={true}
        selectOptions={ARCHIVE_TYPES}
        selectValue={archiveType}
        onSelectChange={setArchiveType}
        selectLabel="Archive Type"
        selectRequired={true}
        showTextInput={true}
        textInputValue={archiveReason}
        onTextInputChange={setArchiveReason}
        textInputLabel="Reason"
        textInputPlaceholder="Provide a detailed reason for archiving..."
        textInputRequired={true}
        textInputMinLength={10}
      />

      {/* Mark Duplicate Modal */}
      <ConfirmationModal
        isOpen={showDuplicateModal}
        onClose={() => {
          setShowDuplicateModal(false);
          setDuplicateIssueId('');
          setDuplicateReason('');
        }}
        onConfirm={handleMarkDuplicate}
        title="Mark as Duplicate"
        description="This will link this issue to an existing primary issue and mark it as resolved."
        icon={Copy}
        variant="info"
        confirmText="Mark Duplicate"
        isLoading={isLoading}
        customValidation={() => duplicateIssueId.trim() && duplicateReason.trim()}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Issue ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={duplicateIssueId}
              onChange={(e) => setDuplicateIssueId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter the ID of the primary issue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={duplicateReason}
              onChange={(e) => setDuplicateReason(e.target.value)}
              placeholder="Explain why this is a duplicate..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Hard Delete Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        onConfirm={handleDelete}
        title="Hard Delete Issue"
        description="This action permanently deletes ALL data and cannot be undone."
        icon={AlertTriangle}
        variant="danger"
        confirmText="Hard Delete"
        isLoading={isLoading}
        warningItems={[
          'Issue record and description',
          'All comments and replies',
          'All votes (upvotes and downvotes)',
          'All media files (images/videos from cloud storage)',
          'Issue history and status changes',
          'Comment flags and moderation data',
          'Related cache entries'
        ]}
        infoItems={[
          isSuperAdmin 
            ? 'You can delete any issue as a Super Administrator.' 
            : 'You can delete your own issues as the issue owner.',
          'All associated data will be permanently removed from our servers.'
        ]}
      />
    </div>
  );
};

export default IssueManagementActions;
