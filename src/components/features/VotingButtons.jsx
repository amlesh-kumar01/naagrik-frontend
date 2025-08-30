'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { issueAPI } from '@/lib/api/issueApi';

const VotingButtons = ({ 
  issueId, 
  initialStats = null,
  onVoteChange,
  compact = false,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { voteOnIssue, removeVoteFromIssue } = useIssuesStore();
  const [stats, setStats] = useState(initialStats || {
    upvotes: 0,
    downvotes: 0,
    total_score: 0,
    user_vote: null
  });
  const [userVoteStatus, setUserVoteStatus] = useState({
    hasVoted: false,
    voteType: null,
    voteTypeText: null
  });
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    }
    
    // Load user vote status when component mounts
    if (isAuthenticated && issueId) {
      loadUserVoteStatus();
    }
  }, [initialStats, issueId, isAuthenticated]);

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

  // Check if user has voted (using the API response)
  const getUserVoteType = () => {
    if (userVoteStatus.hasVoted) {
      return userVoteStatus.voteType === 1 ? 'UPVOTE' : 'DOWNVOTE';
    }
    return null;
  };

  const userVoteType = getUserVoteType();

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (voting) return;
    
    setVoting(true);
    try {
      // If user already voted with same type, remove the vote
      const isRemoveVote = userVoteType === voteType;
      
      let response;
      if (isRemoveVote) {
        response = await removeVoteFromIssue(issueId);
      } else {
        // Convert to numeric value for backend
        const numericVoteType = voteType === 'UPVOTE' ? 1 : -1;
        response = await voteOnIssue(issueId, numericVoteType);
      }

      // Update stats from response
      if (response?.data?.issueStats) {
        const newStats = {
          upvotes: response.data.issueStats.upvotes || 0,
          downvotes: response.data.issueStats.downvotes || 0,
          total_score: response.data.issueStats.total_score || 0,
          user_vote: response.data.issueStats.user_vote
        };
        
        setStats(newStats);
        onVoteChange?.(newStats);
      }
      
      // Refresh user vote status from API
      await loadUserVoteStatus();
      
      // Show appropriate message
      if (isRemoveVote) {
        toast.success('Vote removed');
      } else {
        toast.success(`${voteType === 'UPVOTE' ? 'Upvoted' : 'Downvoted'}!`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('UPVOTE')}
          disabled={voting || !isAuthenticated}
          className={`px-3 py-2 h-9 transition-all duration-200 ${
            userVoteType === 'UPVOTE'
              ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200' 
              : 'hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-200'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${
            userVoteType === 'UPVOTE' ? 'fill-current' : ''
          }`} />
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Vote Score</span>
        <span className={`text-lg font-bold ${
          stats.total_score > 0 ? 'text-green-600' : 
          stats.total_score < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {stats.total_score > 0 ? '+' : ''}{stats.total_score}
        </span>
      </div>
      
      <div className="flex space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('UPVOTE')}
          disabled={voting || !isAuthenticated}
          className={`flex-1 transition-all duration-200 ${
            userVoteType === 'UPVOTE'
              ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
              : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 border border-gray-200'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 mr-2 ${
            userVoteType === 'UPVOTE' ? 'fill-current' : ''
          }`} />
          <span className="font-semibold">
            {voting && userVoteType !== 'UPVOTE' ? 'Voting...' : 'Upvote'}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('DOWNVOTE')}
          disabled={voting || !isAuthenticated}
          className={`flex-1 transition-all duration-200 ${
            userVoteType === 'DOWNVOTE'
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
              : 'hover:bg-red-50 hover:border-red-300 hover:text-red-700 border border-gray-200'
          }`}
        >
          <ThumbsDown className={`h-4 w-4 mr-2 ${
            userVoteType === 'DOWNVOTE' ? 'fill-current' : ''
          }`} />
          <span className="font-semibold">
            {voting && userVoteType !== 'DOWNVOTE' ? 'Voting...' : 'Downvote'}
          </span>
        </Button>
      </div>
      
      {userVoteType && (
        <div className="text-center">
          <button
            onClick={() => handleVote(userVoteType)}
            disabled={voting}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {voting ? 'Removing...' : `Remove my ${userVoteType.toLowerCase()}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default VotingButtons;
