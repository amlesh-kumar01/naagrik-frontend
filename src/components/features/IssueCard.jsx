import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import IssueManagementActions from './IssueManagementActions';
import VotingButtons from './VotingButtons';
import { canManageIssue } from '@/lib/utils/issuePermissions';
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Camera,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { 
  getStatusColor, 
  getStatusBadgeColor,
  formatRelativeTime, 
  truncateText 
} from '@/lib/utils';

const IssueCard = ({ 
  issue, 
  onVote, 
  onShare, 
  onStatusUpdate,
  onIssueRemoved,
  showVoteButton = true, 
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

  const handleShare = () => {
    onShare?.(issue);
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
        className={`hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.01] ${className}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Thumbnail */}
            {issue.media_url && issue.media_type?.startsWith('image/') ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={issue.media_url}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-3 h-3 rounded-full mt-2 ${getStatusBadgeColor(issue.status)}`} />
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
                <Badge className={`ml-2 ${getPriorityColor(issue.priority)}`}>
                  {issue.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <VotingButtons
                      issueId={issue.id}
                      initialStats={{
                        upvotes: issue.upvotes || 0,
                        downvotes: issue.downvotes || 0,
                        total_score: issue.vote_score || 0,
                        user_vote: issue.user_vote
                      }}
                      compact={true}
                      className="text-xs"
                    />
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {issue.comments_count || 0}
                  </span>
                  <span>{formatRelativeTime(issue.created_at)}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority} Priority
              </Badge>
              <Badge variant="outline" className={getStatusColor(issue.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(issue.status)}
                  <span>{issue.status}</span>
                </div>
              </Badge>
              <span className="text-sm text-gray-500">#{issue.id}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
              {issue.title}
            </h3>
            
            <p className="text-gray-600 line-clamp-3">
              {issue.description}
            </p>
          </div>
        </div>

        {/* Media */}
        {issue.media_url && (
          <div className="mb-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 group">
              {issue.media_type?.startsWith('image/') ? (
                <img
                  src={issue.media_url}
                  alt={issue.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-500 text-sm">Media attachment</span>
                  </div>
                </div>
              )}
              {/* Optional overlay with media count if multiple images */}
              {issue.media_count > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  +{issue.media_count - 1} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {showLocation && issue.address && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{issue.address}</span>
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-xs">
            {issue.category}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          {/* User Info */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={issue.reporter?.avatar} alt={issue.reporter?.name} />
              <AvatarFallback>
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
          <div className="flex items-center space-x-2">
            {showVoteButton && (
              <VotingButtons
                issueId={issue.id}
                initialStats={{
                  upvotes: issue.upvotes || 0,
                  downvotes: issue.downvotes || 0,
                  total_score: issue.vote_score || 0,
                  user_vote: issue.user_vote
                }}
                compact={true}
                className="flex-shrink-0"
              />
            )}
            
            <Link href={`/issues/${issue.id}`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200">
                <MessageCircle className="h-4 w-4" />
                <span>{issue.comments_count || 0}</span>
                <span className="hidden sm:inline">Comments</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1"
            >
              <Share2 className="h-4 w-4" />
            </Button>
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
