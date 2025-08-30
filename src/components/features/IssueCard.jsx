import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import IssueManagementActions from './IssueManagementActions';
import VoteButton from './VoteButton';
import { canManageIssue } from '@/lib/utils/issuePermissions';
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Camera,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  getStatusColor, 
  getStatusBadgeColor,
  formatRelativeTime, 
  truncateText 
} from '@/lib/utils';

const IssueCard = ({ 
  issue, 
  onShare, 
  onStatusUpdate,
  onIssueRemoved,
  onIssueUpdate, // New callback for updating issue data
  showLocation = true,
  showManagementActions = true,
  compact = false,
  className = '' 
}) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const canManage = canManageIssue(issue, user);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or links
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="dialog"]')) {
      return;
    }
    router.push(`/issues/${issue.id}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (compact) {
    return (
      <Card 
        className={`hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01] border border-gray-200 bg-white ${className}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {issue.media && issue.media.length > 0 && issue.media[0].url ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
                  <img
                    src={issue.media[0].url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 hover:text-[#1A2A80] line-clamp-1 text-base">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${getStatusColor(issue.status)}`}
                  >
                    {issue.status}
                  </Badge>
                </div>
              </div>
              
              {/* Location */}
              {showLocation && issue.address && (
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{issue.address}</span>
                </div>
              )}
              
              {/* Footer Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {/* Vote Buttons */}
                  <VoteButton 
                    issueId={issue.id}
                    userVoteStatus={issue.user_vote_status}
                    voteStats={{
                      upvotes: parseInt(issue.upvote_count) || 0,
                      downvotes: parseInt(issue.downvote_count) || 0
                    }}
                    onVoteChange={(voteData) => {
                      // Update the issue data in the parent component
                      if (onIssueUpdate) {
                        onIssueUpdate(issue.id, {
                          upvote_count: voteData.upvotes,
                          downvote_count: voteData.downvotes,
                          vote_score: voteData.vote_score,
                          user_vote_status: voteData.userVoteStatus
                        });
                      }
                    }}
                    compact={true}
                  />
                  
                  {/* Comments Count */}
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="font-medium">{issue.comments_count || 0}</span>
                  </div>
                  
                  <span className="text-gray-400 text-xs">{formatRelativeTime(issue.created_at)}</span>
                </div>
                
                {/* Management Actions - Only Admin/Steward */}
                {showManagementActions && canManage && (
                  <IssueManagementActions
                    issue={issue}
                    onStatusUpdate={onStatusUpdate}
                    onIssueRemoved={onIssueRemoved}
                    compact={true}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] border border-gray-200 bg-white ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getStatusColor(issue.status)}`}
              >
                <div className="flex items-center space-x-1">
                  {getStatusIcon(issue.status)}
                  <span>{issue.status}</span>
                </div>
              </Badge>
              <Badge className={`text-xs px-2 py-1 ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 hover:text-[#1A2A80] line-clamp-2 mb-2 leading-snug">
              {issue.title}
            </h3>
            
            <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
              {issue.description}
            </p>
          </div>
        </div>

        {/* Media Thumbnail */}
        {issue.media && issue.media.length > 0 && issue.media[0].url && (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 group h-32">
              <img
                src={issue.media[0].url}
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {/* Media count overlay */}
              {issue.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  <Camera className="h-3 w-3 inline mr-1" />
                  {issue.media.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {showLocation && issue.address && (
          <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="line-clamp-1">{issue.address}</span>
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {issue.category}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={issue.reporter?.avatar} alt={issue.reporter?.name} />
              <AvatarFallback className="bg-[#1A2A80] text-white text-xs">
                {issue.reporter?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {issue.reporter?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(issue.created_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Vote Buttons */}
            <VoteButton 
              issueId={issue.id}
              userVoteStatus={issue.user_vote_status}
              voteStats={{
                upvotes: parseInt(issue.upvote_count) || 0,
                downvotes: parseInt(issue.downvote_count) || 0
              }}
              onVoteChange={(voteData) => {
                // Update the issue data in the parent component
                if (onIssueUpdate) {
                  onIssueUpdate(issue.id, {
                    upvote_count: voteData.upvotes,
                    downvote_count: voteData.downvotes,
                    vote_score: voteData.vote_score,
                    user_vote_status: voteData.userVoteStatus
                  });
                }
              }}
              compact={true}
            />
            
            {/* Comments */}
            <Link href={`/issues/${issue.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-1 text-gray-600 hover:text-[#1A2A80] hover:bg-blue-50"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{issue.comments_count || 0}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Management Actions - Only for Stewards/Admins */}
        {showManagementActions && canManage && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <IssueManagementActions
              issue={issue}
              onStatusUpdate={onStatusUpdate}
              onIssueRemoved={onIssueRemoved}
              compact={true}
              className="justify-end"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueCard;
