import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useIssuesStore } from '@/store';
import { issueAPI } from '@/lib/api';

const VoteButton = ({ 
  issueId, 
  userVoteStatus, 
  voteStats, 
  onVoteChange,
  compact = false 
}) => {
  const { user } = useAuthStore();
  const { updateIssue } = useIssuesStore();
  
  // Helper function to normalize vote types
  const normalizeVoteType = (voteType) => {
    if (voteType === 1 || voteType === '1') return 'upvote';
    if (voteType === -1 || voteType === '-1') return 'downvote';
    if (voteType === 'upvote') return 'upvote';
    if (voteType === 'downvote') return 'downvote';
    return null;
  };
  
  // Local state for optimistic updates
  const [localVoteStats, setLocalVoteStats] = useState({
    upvotes: voteStats?.upvotes || voteStats?.upvote_count || 0,
    downvotes: voteStats?.downvotes || voteStats?.downvote_count || 0
  });
  const [localUserVote, setLocalUserVote] = useState(
    normalizeVoteType(userVoteStatus?.vote_type || userVoteStatus?.voteType)
  );
  const [isVoting, setIsVoting] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (voteStats) {
      setLocalVoteStats({
        upvotes: voteStats.upvotes || voteStats.upvote_count || 0,
        downvotes: voteStats.downvotes || voteStats.downvote_count || 0
      });
    }
    if (userVoteStatus) {
      setLocalUserVote(normalizeVoteType(userVoteStatus.vote_type || userVoteStatus.voteType));
    }
  }, [voteStats, userVoteStatus]);

  const handleVote = async (voteType) => {
    if (!user || isVoting) return;

    setIsVoting(true);
    
    // Store previous state for rollback
    const previousVoteStats = { ...localVoteStats };
    const previousUserVote = localUserVote;

    try {
      // Calculate optimistic updates
      let newUpvotes = localVoteStats.upvotes;
      let newDownvotes = localVoteStats.downvotes;
      let newUserVote = voteType;

      // Handle vote toggle logic
      if (previousUserVote === voteType) {
        // User is removing their existing vote (toggle off)
        if (voteType === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else if (voteType === 'downvote') {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        newUserVote = null; // No vote after removal
      } else {
        // User is adding a new vote or changing their vote
        if (previousUserVote === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else if (previousUserVote === 'downvote') {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        
        if (voteType === 'upvote') {
          newUpvotes += 1;
        } else if (voteType === 'downvote') {
          newDownvotes += 1;
        }
      }

      // Apply optimistic updates immediately
      const optimisticStats = { upvotes: newUpvotes, downvotes: newDownvotes };
      setLocalVoteStats(optimisticStats);
      setLocalUserVote(newUserVote);

      // Notify parent component immediately for instant UI update
      if (onVoteChange) {
        const voteTypeForApi = newUserVote === 'upvote' ? 1 : newUserVote === 'downvote' ? -1 : null;
        onVoteChange({
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          upvote_count: newUpvotes,
          downvote_count: newDownvotes,
          vote_score: newUpvotes - newDownvotes,
          userVoteStatus: { 
            vote_type: newUserVote,
            voteType: voteTypeForApi,
            hasVoted: newUserVote !== null
          }
        });
      }

      // Make API call based on vote state
      let response;
      
      if (previousUserVote === voteType) {
        // Remove vote (toggle off)
        response = await issueAPI.deleteVote(issueId);
      } else {
        // Add or change vote - convert to integer format
        const voteTypeInteger = voteType === 'upvote' ? 1 : -1;
        response = await issueAPI.voteIssue(issueId, voteTypeInteger);
      }

      // Sync with server response if available
      if (response?.data) {
        let serverStats;
        
        if (response.data.message && response.data.message.includes('deleted')) {
          // Delete vote response - use calculated stats
          serverStats = optimisticStats;
        } else {
          // Vote response - use server data from API format
          serverStats = {
            upvotes: parseInt(response.data.upvote_count) || newUpvotes,
            downvotes: parseInt(response.data.downvote_count) || newDownvotes
          };
          
          // Handle potential different response formats
          if (response.data.voteScore !== undefined) {
            // If API returns vote score, calculate individual counts if not provided
            const voteScore = parseInt(response.data.voteScore) || 0;
            if (!response.data.upvote_count && !response.data.downvote_count) {
              // Estimate counts from score (this is a fallback)
              serverStats = optimisticStats;
            }
          }
        }

        // Update if server data differs from optimistic update
        if (serverStats.upvotes !== newUpvotes || serverStats.downvotes !== newDownvotes) {
          setLocalVoteStats(serverStats);
          if (onVoteChange) {
            const voteTypeForApi = newUserVote === 'upvote' ? 1 : newUserVote === 'downvote' ? -1 : null;
            onVoteChange({
              upvotes: serverStats.upvotes,
              downvotes: serverStats.downvotes,
              upvote_count: serverStats.upvotes,
              downvote_count: serverStats.downvotes,
              vote_score: serverStats.upvotes - serverStats.downvotes,
              userVoteStatus: { 
                vote_type: newUserVote,
                voteType: voteTypeForApi,
                hasVoted: newUserVote !== null
              }
            });
          }
        }

        // Update store with final data
        const voteTypeForStore = newUserVote === 'upvote' ? 1 : newUserVote === 'downvote' ? -1 : null;
        updateIssue(issueId, {
          upvote_count: serverStats.upvotes,
          downvote_count: serverStats.downvotes,
          vote_score: serverStats.upvotes - serverStats.downvotes,
          user_vote_status: { 
            vote_type: newUserVote,
            voteType: voteTypeForStore,
            hasVoted: newUserVote !== null
          }
        });
      }

    } catch (error) {
      console.error('Error handling vote:', error);
      
      // Rollback optimistic updates on error
      setLocalVoteStats(previousVoteStats);
      setLocalUserVote(previousUserVote);
      
      if (onVoteChange) {
        const previousVoteTypeForApi = previousUserVote === 'upvote' ? 1 : previousUserVote === 'downvote' ? -1 : null;
        onVoteChange({
          upvotes: previousVoteStats.upvotes,
          downvotes: previousVoteStats.downvotes,
          upvote_count: previousVoteStats.upvotes,
          downvote_count: previousVoteStats.downvotes,
          vote_score: previousVoteStats.upvotes - previousVoteStats.downvotes,
          userVoteStatus: { 
            vote_type: previousUserVote,
            voteType: previousVoteTypeForApi,
            hasVoted: previousUserVote !== null
          }
        });
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (compact) {
    // Compact layout for issue cards
    return (
      <div className="flex items-center space-x-1">
        <Button
          onClick={() => handleVote('upvote')}
          variant="ghost"
          size="sm"
          disabled={!user || isVoting}
          className={`flex items-center space-x-1 h-9 px-3 transition-all duration-200 border ${
            localUserVote === 'upvote'
              ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-300'
              : 'text-gray-600 hover:bg-green-50 hover:text-green-600 border-transparent hover:border-green-200'
          } ${isVoting ? 'opacity-50' : ''}`}
        >
          <ThumbsUp className={`h-4 w-4 ${localUserVote === 'upvote' ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{localVoteStats.upvotes}</span>
        </Button>
        
        <Button
          onClick={() => handleVote('downvote')}
          variant="ghost"
          size="sm"
          disabled={!user || isVoting}
          className={`flex items-center space-x-1 h-9 px-3 transition-all duration-200 border ${
            localUserVote === 'downvote'
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-300'
              : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border-transparent hover:border-red-200'
          } ${isVoting ? 'opacity-50' : ''}`}
        >
          <ThumbsDown className={`h-4 w-4 ${localUserVote === 'downvote' ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{localVoteStats.downvotes}</span>
        </Button>
      </div>
    );
  }

  // Full layout for issue detail pages
  return (
    <div className="flex items-center space-x-4">
      {/* Upvote Button */}
      <div className="flex items-center space-x-1">
        <Button
          onClick={() => handleVote('upvote')}
          variant={localUserVote === 'upvote' ? 'default' : 'outline'}
          size="sm"
          disabled={!user || isVoting}
          className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
            localUserVote === 'upvote' 
              ? 'bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-md' 
              : 'hover:bg-green-50 hover:border-green-300 hover:text-green-600 border-gray-300'
          } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className={`h-4 w-4 ${localUserVote === 'upvote' ? 'fill-current' : ''}`} />
          <span className="font-medium">{localVoteStats.upvotes}</span>
        </Button>
      </div>

      {/* Downvote Button */}
      <div className="flex items-center space-x-1">
        <Button
          onClick={() => handleVote('downvote')}
          variant={localUserVote === 'downvote' ? 'default' : 'outline'}
          size="sm"
          disabled={!user || isVoting}
          className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
            localUserVote === 'downvote' 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-md' 
              : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600 border-gray-300'
          } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsDown className={`h-4 w-4 ${localUserVote === 'downvote' ? 'fill-current' : ''}`} />
          <span className="font-medium">{localVoteStats.downvotes}</span>
        </Button>
      </div>
    </div>
  );
};

export default VoteButton;
