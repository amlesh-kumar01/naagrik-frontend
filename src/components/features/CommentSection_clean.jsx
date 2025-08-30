'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { issueAPI, commentAPI } from '@/lib/api';
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
      console.error('Failed to add comment:', error);
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

      // Handle the response and update local state
      const newReplyData = response.data?.data?.comment || response.data?.comment || response.comment;

      // Recursively add reply to the correct parent comment
      const addReplyToComment = (comments, parentId, newReply) => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
              reply_count: (comment.reply_count || 0) + 1
            };
          }
          
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies, parentId, newReply)
            };
          }
          
          return comment;
        });
      };

      setComments(prevComments => addReplyToComment(prevComments, parentCommentId, newReplyData));
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This will also delete all replies.')) return;

    try {
      await commentAPI.deleteComment(commentId);
      
      // Remove comment and its replies from local state
      setComments(prevComments => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false; // Remove this comment
          }
          
          // Also check nested replies recursively
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          
          return true;
        });
      });
      
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleFlagComment = (commentId) => {
    console.log('Flagging comment:', commentId);
    setFlaggingComment(commentId);
    setFlagReason('');
    setFlagDetails('');
  };

  const submitFlag = async () => {
    if (!flagReason) {
      toast.error('Please select a reason for flagging');
      return;
    }

    console.log('Submitting flag:', { commentId: flaggingComment, reason: flagReason, details: flagDetails });

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
      toast.error(error.response?.data?.error?.message || 'Failed to flag comment');
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

  if (loading) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2A80] mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading comments...</p>
      </div>
    );
  }

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
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment}
                onDelete={handleDeleteComment}
                onFlag={handleFlagComment}
                onReply={handleAddReply}
                currentUser={user}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
        </div>
      </div>

      {/* Flag Modal */}
      <FlagModal />
    </>
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
      toast.error('Failed to add reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className={`border border-gray-100 rounded-lg p-4 ${isNested ? 'bg-gray-25' : 'bg-gray-50/50'}`}>
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
                  {formatTimeAgo(comment.created_at)}
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
              
              {/* Only authenticated users can flag, but not their own comments */}
              {currentUser && currentUser.id !== comment.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFlag(comment.id)}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
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
              {!isNested && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 hover:text-[#1A2A80]"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && !isNested && (
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

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 space-y-4 border-l-2 border-gray-100 pl-4">
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
};

export default CommentSection;
