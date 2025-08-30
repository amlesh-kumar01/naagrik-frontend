'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { issueAPI, commentAPI } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Reply, 
  Flag, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CommentSection = ({ issueId, className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [flaggingComment, setFlaggingComment] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');

  useEffect(() => {
    fetchComments();
  }, [issueId, sortBy]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getComments(issueId, { 
        sortBy,
        nested: 'true' 
      });
      
      // Handle the new nested response structure
      const commentsData = response.data?.data?.comments || response.data?.comments || response.comments || [];
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (parentCommentId = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await issueAPI.createComment(issueId, {
        content: newComment.trim(),
        parentCommentId: parentCommentId
      });

      // Handle the new response structure
      const newCommentData = response.data?.data?.comment || response.data?.comment || response.comment;
      
      if (parentCommentId) {
        // Add reply to parent comment
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === parentCommentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentData],
                  reply_count: (comment.reply_count || 0) + 1
                }
              : comment
          )
        );
      } else {
        // Add new top-level comment
        setComments(prevComments => [newCommentData, ...prevComments]);
      }
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentCommentId, replyContent) => {
    if (!isAuthenticated) {
      toast.error('Please login to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const response = await issueAPI.createComment(issueId, {
        content: replyContent.trim(),
        parentCommentId: parentCommentId
      });

      // Handle the new response structure
      const newReplyData = response.data?.data?.comment || response.data?.comment || response.comment;
      
      // Recursively add reply to the correct parent comment
      const addReplyToComment = (comments) => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReplyData],
              reply_count: (comment.reply_count || 0) + 1
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(prevComments => addReplyToComment(prevComments));
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This will also delete all replies.')) return;

    try {
      const response = await commentAPI.deleteComment(commentId);
      
      // Recursively remove comment from the tree
      const removeCommentFromTree = (comments) => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false; // Remove this comment
          }
          
          // If comment has replies, recursively check them
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeCommentFromTree(comment.replies);
          }
          
          return true;
        });
      };
      
      setComments(prevComments => removeCommentFromTree(prevComments));
      
      // Show success message with reply count if available
      const deletedRepliesCount = response.data?.deletedRepliesCount || 0;
      if (deletedRepliesCount > 0) {
        toast.success(`Comment and ${deletedRepliesCount} replies deleted`);
      } else {
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleFlagComment = (commentId) => {
    setFlaggingComment(commentId);
    setFlagReason('');
    setFlagDetails('');
  };

  const submitFlag = async () => {
    if (!flagReason) {
      toast.error('Please select a reason for flagging');
      return;
    }

    try {
      await commentAPI.flagComment(flaggingComment, {
        reason: flagReason,
        details: flagDetails
      });
      
      toast.success('Comment flagged for review');
      setFlaggingComment(null);
      setFlagReason('');
      setFlagDetails('');
      
      // Refresh comments to show updated flag status
      fetchComments();
    } catch (error) {
      console.error('Error flagging comment:', error);
      toast.error('Failed to flag comment');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[#1A2A80]" />
            Comments ({comments.length})
          </h3>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_voted">Most Voted</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {isAuthenticated ? (
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or additional information about this issue..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => handleAddComment()}
                disabled={submitting || !newComment.trim()}
                className="flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Please <a href="/login" className="text-[#1A2A80] underline">login</a> to add comments.
            </AlertDescription>
          </Alert>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
                onFlag={handleFlagComment}
                onReply={handleAddReply}
                currentUser={user}
                formatTimeAgo={formatTimeAgo}
                isNested={false}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CommentItem = ({ comment, onDelete, onFlag, onReply, currentUser, formatTimeAgo, isNested = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const canDelete = currentUser && (
    currentUser.id === comment.user_id || 
    ['STEWARD', 'SUPER_ADMIN'].includes(currentUser.role)
  );

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user_avatar} />
          <AvatarFallback>
            {comment.user_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {comment.user_name || 'Anonymous User'}
                </span>
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(comment.created_at)}
                </span>
                {comment.is_flagged && (
                  <Badge variant="destructive" className="text-xs">
                    Flagged
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFlag(comment.id, 'INAPPROPRIATE')}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatTimeAgo(comment.created_at)}</span>
              {comment.replies && comment.replies.length > 0 && (
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-500 hover:text-[#1A2A80]"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              
              {/* Only stewards and admins can flag comments */}
              {currentUser && (currentUser?.role === 'STEWARD' || currentUser?.role === 'SUPER_ADMIN') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFlag(comment.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={submittingReply || !replyText.trim()}
                >
                  {submittingReply ? 'Replying...' : 'Reply'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Replies - Recursive rendering for unlimited nesting */}
          {comment.replies && comment.replies.length > 0 && (
            <div className={`mt-4 space-y-3 ${isNested ? 'pl-2' : 'pl-4'} border-l-2 border-gray-200`}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onDelete={onDelete}
                  onFlag={onFlag}
                  onReply={onReply}
                  currentUser={currentUser}
                  formatTimeAgo={formatTimeAgo}
                  isNested={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Flag Modal Component
  const FlagModal = () => {
    if (!flaggingComment) return null;

    const flagReasons = [
      { value: 'SPAM', label: 'Spam' },
      { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
      { value: 'MISLEADING', label: 'Misleading Information' },
      { value: 'HARASSMENT', label: 'Harassment' },
      { value: 'OTHER', label: 'Other' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Flag Comment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reason for flagging:</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a reason</option>
                {flagReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional details (optional):</label>
              <Textarea
                value={flagDetails}
                onChange={(e) => setFlagDetails(e.target.value)}
                placeholder="Provide additional context..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setFlaggingComment(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitFlag}
                disabled={!flagReason}
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Flag
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Comment Section */}
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[#1A2A80]" />
            Comments ({comments.length})
          </h3>
          
          {comments.length > 1 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          )}
        </div>

        {/* Add New Comment */}
        {isAuthenticated && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this issue..."
                  rows={3}
                  className="resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/1000 characters
                  </span>
                  <Button
                    onClick={() => handleAddComment()}
                    disabled={!newComment.trim() || submitting}
                    className="bg-[#1A2A80] hover:bg-[#1A2A80]/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2A80] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>

      {/* Flag Modal */}
      <FlagModal />
    </>
  );
};

export default CommentSection;
