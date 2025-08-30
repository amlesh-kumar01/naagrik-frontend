'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { issueAPI } from '@/lib/api/issueApi';

const UpvoteButton = ({ 
  issueId, 
  onVoteChange,
  className = '',
  size = 'sm'
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { voteOnIssue, removeVoteFromIssue } = useIssuesStore();
  const [userVoteStatus, setUserVoteStatus] = useState({
    hasVoted: false,
    voteType: null,
    voteTypeText: null
  });
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    // Load user vote status when component mounts
    if (isAuthenticated && issueId) {
      loadUserVoteStatus();
    }
  }, [issueId, isAuthenticated]);

  const loadUserVoteStatus = async () => {
    try {
      const response = await issueAPI.getUserVoteStatus(issueId);
      if (response.data?.success) {
        setUserVoteStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load vote status:', error);
    }
  };

  const hasUpvoted = userVoteStatus.hasVoted && userVoteStatus.voteType === 1;

  const handleUpvote = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (voting) return;
    
    setVoting(true);

    try {
      let response;
      if (hasUpvoted) {
        // Remove upvote if already upvoted
        response = await removeVoteFromIssue(issueId);
        toast.success('Vote removed');
      } else {
        // Add upvote
        response = await voteOnIssue(issueId, 1);
        toast.success('Upvoted!');
      }

      // Refresh user vote status from API
      await loadUserVoteStatus();
      
      // Notify parent of vote change
      if (response?.data?.issueStats) {
        onVoteChange?.(response.data.issueStats);
      }
      
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleUpvote}
      disabled={voting || !isAuthenticated}
      className={`transition-all duration-200 ${
        hasUpvoted
          ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200' 
          : 'hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-200'
      } ${className}`}
    >
      <ThumbsUp className={`h-4 w-4 ${
        hasUpvoted ? 'fill-current' : ''
      }`} />
    </Button>
  );
};

export default UpvoteButton;
