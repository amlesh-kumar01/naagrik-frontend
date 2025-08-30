'use client';

import { useState } from 'react';
import { useAuthStore, useIssuesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  canManageIssue, 
  canArchiveIssue, 
  canDeleteIssues,
  canMarkAsDuplicate,
  validateArchiveReason,
  getAvailableStatusTransitions
} from '@/lib/utils/issuePermissions';
import { 
  Archive, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const IssueManagementActions = ({ 
  issue, 
  onStatusUpdate, 
  onIssueRemoved,
  compact = false,
  className = '' 
}) => {
  const { user } = useAuthStore();
  const { archiveIssue, deleteIssue, markAsDuplicate, updateIssueStatus } = useIssuesStore();
  
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveType, setArchiveType] = useState('RESOLVED_EXTERNALLY');
  const [deleteReason, setDeleteReason] = useState('');
  const [duplicateIssueId, setDuplicateIssueId] = useState('');
  const [duplicateReason, setDuplicateReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check permissions
  const canManage = canManageIssue(issue, user);
  const canArchive = canArchiveIssue(issue) && canManage;
  const canDelete = canDeleteIssues(user);
  const canDuplicate = canMarkAsDuplicate(issue) && canManage;
  
  const availableTransitions = getAvailableStatusTransitions(issue.status, user);

  if (!canManage && !canDelete) {
    return null; // User has no permissions
  }

  const handleArchive = async () => {
    const validation = validateArchiveReason(archiveReason, archiveType);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      await archiveIssue(issue.id, {
        reason: archiveReason.trim(),
        archiveType: archiveType,
        notes: `Issue archived by ${user.role.toLowerCase()}: ${user.name}`
      });
      
      toast.success('Issue archived successfully');
      setShowArchiveDialog(false);
      onIssueRemoved?.(issue.id);
    } catch (error) {
      toast.error(error.message || 'Failed to archive issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim() || deleteReason.trim().length < 10) {
      toast.error('Please provide a detailed reason for deletion (at least 10 characters)');
      return;
    }

    setIsLoading(true);
    try {
      await deleteIssue(issue.id);
      
      toast.success('Issue deleted successfully');
      setShowDeleteDialog(false);
      onIssueRemoved?.(issue.id);
    } catch (error) {
      toast.error(error.message || 'Failed to delete issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDuplicate = async () => {
    if (!duplicateIssueId.trim() || !duplicateReason.trim()) {
      toast.error('Please provide the primary issue ID and reason');
      return;
    }

    setIsLoading(true);
    try {
      await markAsDuplicate(issue.id, {
        primaryIssueId: duplicateIssueId.trim(),
        reason: duplicateReason.trim()
      });
      
      toast.success('Issue marked as duplicate');
      setShowDuplicateDialog(false);
      onStatusUpdate?.(issue.id, 'DUPLICATE');
    } catch (error) {
      toast.error(error.message || 'Failed to mark as duplicate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !statusReason.trim()) {
      toast.error('Please select a status and provide a reason');
      return;
    }

    setIsLoading(true);
    try {
      await updateIssueStatus(issue.id, newStatus, statusReason.trim());
      
      toast.success(`Issue status updated to ${newStatus}`);
      setShowStatusDialog(false);
      onStatusUpdate?.(issue.id, newStatus);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Status Update */}
        {availableTransitions.length > 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStatusDialog(true)}
            >
              <Clock className="h-3 w-3 mr-1" />
              Status
            </Button>
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Update Issue Status
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Status updates will be visible to all users following this issue.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A80] focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      {availableTransitions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <Textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Explain the reason for status change..."
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowStatusDialog(false)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={isLoading || !newStatus}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Archive Button - Only for resolved issues */}
        {canArchive && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
            >
              <Archive className="h-3 w-3 mr-1" />
              Archive
            </Button>
            <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Archive className="h-6 w-6 text-amber-600" />
                  </div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Archive Resolved Issue
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        This will remove the issue from active listings. Only resolved issues can be archived.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Archive Type</label>
                    <select 
                      value={archiveType} 
                      onChange={(e) => setArchiveType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A80] focus:border-transparent"
                    >
                      <option value="RESOLVED_EXTERNALLY">Resolved Externally</option>
                      <option value="INVALID">Invalid Report</option>
                      <option value="SPAM">Spam</option>
                      <option value="DUPLICATE">Duplicate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                      placeholder="Provide a detailed reason for archiving this issue..."
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowArchiveDialog(false)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleArchive} 
                      disabled={isLoading}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isLoading ? 'Archiving...' : 'Archive Issue'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Delete Button - Admin only */}
        {canDelete && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Delete Issue Permanently?
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      This action cannot be undone. All associated data including comments and votes will be permanently removed.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Deletion <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Provide a detailed reason for permanently deleting this issue..."
                      rows={3}
                      className="w-full resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 characters required
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(false)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDelete} 
                      disabled={isLoading || !deleteReason.trim() || deleteReason.trim().length < 10}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Issue Management</h4>
        <Badge variant="outline">
          {user.role === 'SUPER_ADMIN' ? 'Admin' : 'Steward'}
        </Badge>
      </div>

      {/* Status Management */}
      {availableTransitions.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Update Status</h5>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map(status => (
              <Button
                key={status.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewStatus(status.value);
                  setShowStatusDialog(true);
                }}
                className={`text-${status.color}-600 border-${status.color}-200 hover:bg-${status.color}-50`}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Archive/Delete Actions */}
      <div className="flex items-center space-x-2 pt-2 border-t">
        {canArchive && (
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowArchiveDialog(true)}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive Issue
          </Button>
        )}

        {canDuplicate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDuplicateDialog(true)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Mark Duplicate
          </Button>
        )}

        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Update Issue Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Status updates will be visible to all users following this issue.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A80] focus:border-transparent"
              >
                <option value="">Select Status</option>
                {availableTransitions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <Textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Explain the reason for status change..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusDialog(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate} 
                disabled={isLoading || !newStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Copy className="h-6 w-6 text-purple-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Mark as Duplicate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-800">
                  This will link this issue to an existing primary issue and close it.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Issue ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={duplicateIssueId}
                onChange={(e) => setDuplicateIssueId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A80] focus:border-transparent"
                placeholder="Enter the ID of the primary issue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <Textarea
                value={duplicateReason}
                onChange={(e) => setDuplicateReason(e.target.value)}
                placeholder="Explain why this is a duplicate..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDuplicateDialog(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMarkDuplicate} 
                disabled={isLoading || !duplicateIssueId.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? 'Marking...' : 'Mark as Duplicate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Archive className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Archive Resolved Issue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  This will remove the issue from active listings. Only resolved issues can be archived.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archive Type <span className="text-red-500">*</span>
              </label>
              <select 
                value={archiveType} 
                onChange={(e) => setArchiveType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A80] focus:border-transparent"
              >
                <option value="RESOLVED_EXTERNALLY">Resolved Externally</option>
                <option value="INVALID">Invalid Report</option>
                <option value="SPAM">Spam</option>
                <option value="DUPLICATE">Duplicate</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Provide a detailed reason for archiving this issue..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowArchiveDialog(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleArchive} 
                disabled={isLoading || !archiveReason.trim()}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isLoading ? 'Archiving...' : 'Archive Issue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete Issue Permanently?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. All associated data including comments and votes will be permanently removed.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Provide a detailed reason for permanently deleting this issue..."
                rows={3}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters required
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete} 
                disabled={isLoading || !deleteReason.trim() || deleteReason.trim().length < 10}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueManagementActions;
