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
  MoreHorizontal
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Issue Status</DialogTitle>
                </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 border rounded-md"
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
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <Textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Explain the reason for status change..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={isLoading}>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Resolved Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will remove the issue from active listings. Only resolved issues can be archived.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Archive Type</label>
                  <select 
                    value={archiveType} 
                    onChange={(e) => setArchiveType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="RESOLVED_EXTERNALLY">Resolved Externally</option>
                    <option value="INVALID">Invalid Report</option>
                    <option value="SPAM">Spam</option>
                    <option value="DUPLICATE">Duplicate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <Textarea
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    placeholder="Provide a detailed reason for archiving this issue..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="warning" onClick={handleArchive} disabled={isLoading}>
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
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Issue</DialogTitle>
                </DialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will permanently delete the issue and all associated data. This action cannot be undone.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Deletion</label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Provide a detailed reason for permanently deleting this issue..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
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
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
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
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Explain the reason for status change..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Duplicate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Issue ID</label>
              <input
                type="text"
                value={duplicateIssueId}
                onChange={(e) => setDuplicateIssueId(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the ID of the primary issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Textarea
                value={duplicateReason}
                onChange={(e) => setDuplicateReason(e.target.value)}
                placeholder="Explain why this is a duplicate..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkDuplicate} disabled={isLoading}>
                {isLoading ? 'Marking...' : 'Mark as Duplicate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueManagementActions;
