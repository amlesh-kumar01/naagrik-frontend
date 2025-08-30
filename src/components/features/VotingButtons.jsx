'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    }
  }, [initialStats, issueId]);

  // Helper function to check if user voted for a specific type
  const hasUserVoted = (voteType) => {
    return stats.user_vote === voteType || 
           (stats.user_vote === 1 && voteType === 'UPVOTE') ||
           (stats.user_vote === -1 && voteType === 'DOWNVOTE');
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (voting) return;
    
    setVoting(true);
    try {
      const isRemoveVote = (
        (stats.user_vote === voteType) || 
        (stats.user_vote === 1 && voteType === 'UPVOTE') ||
        (stats.user_vote === -1 && voteType === 'DOWNVOTE')
      );
      let newStats;
      
      // Convert vote type to numeric value for backend
      const numericVoteType = voteType === 'UPVOTE' ? 1 : -1;
      
      if (isRemoveVote) {
        newStats = await removeVoteFromIssue(issueId);
      } else {
        const response = await voteOnIssue(issueId, numericVoteType);
        newStats = response.data || response;
      }

      // Map backend response to component state format
      const mappedStats = {
        upvotes: newStats.upvotes || newStats.upvoteCount || stats.upvotes,
        downvotes: newStats.downvotes || newStats.downvoteCount || stats.downvotes,
        total_score: newStats.total_score || newStats.voteScore || newStats.vote_score || stats.total_score,
        user_vote: newStats.user_vote || newStats.userVote || (isRemoveVote ? null : voteType)
      };

      setStats(mappedStats);
      onVoteChange?.(mappedStats);
      
      if (isRemoveVote) {
        toast.success('Vote removed');
      } else {
        toast.success(`${voteType === 'UPVOTE' ? 'Upvoted' : 'Downvoted'}!`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <Button
          variant={hasUserVoted('UPVOTE') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('UPVOTE')}
          disabled={voting}
          className="px-2 py-1"
        >
          <ThumbsUp className="h-3 w-3 mr-1" />
          {stats.upvotes}
        </Button>
        
        <span className="text-sm font-medium text-gray-600 px-2">
          {stats.total_score}
        </span>
        
        <Button
          variant={hasUserVoted('DOWNVOTE') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('DOWNVOTE')}
          disabled={voting}
          className="px-2 py-1"
        >
          <ThumbsDown className="h-3 w-3 mr-1" />
          {stats.downvotes}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Vote Score</span>
        <span className="text-lg font-bold text-[#1A2A80]">
          {stats.total_score}
        </span>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant={hasUserVoted('UPVOTE') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('UPVOTE')}
          disabled={voting}
          className={`flex-1 transition-all duration-200 ${
            hasUserVoted('UPVOTE') 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
          }`}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {voting && !hasUserVoted('UPVOTE') ? 'Voting...' : `${stats.upvotes} Upvote${stats.upvotes !== 1 ? 's' : ''}`}
        </Button>
        
        <Button
          variant={hasUserVoted('DOWNVOTE') ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('DOWNVOTE')}
          disabled={voting}
          className={`flex-1 transition-all duration-200 ${
            hasUserVoted('DOWNVOTE') 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'hover:bg-red-50 hover:border-red-300 hover:text-red-700'
          }`}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          {voting && !hasUserVoted('DOWNVOTE') ? 'Voting...' : `${stats.downvotes} Downvote${stats.downvotes !== 1 ? 's' : ''}`}
        </Button>
      </div>
      
      {(stats.user_vote === 'UPVOTE' || stats.user_vote === 1 || stats.user_vote === 'DOWNVOTE' || stats.user_vote === -1) && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentVoteType = (stats.user_vote === 1 || stats.user_vote === 'UPVOTE') ? 'UPVOTE' : 'DOWNVOTE';
              handleVote(currentVoteType);
            }}
            disabled={voting}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Remove my vote
          </Button>
        </div>
      )}
    </div>
  );
};

export default VotingButtons;
