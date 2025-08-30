'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIssuesStore } from '@/store';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingCard } from '@/components/ui/loading';
import IssueManagementActions from '../features/IssueManagementActions';
import VotingButtons from '../features/VotingButtons';
import CommentSection from '../features/CommentSection';
import { canManageIssue } from '@/lib/utils/issuePermissions';
import { colors } from '../../lib/theme';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Share2,
  MoreHorizontal,
  Camera,
  Play,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Maximize,
  Minimize
} from 'lucide-react';

const IssueDetailPage = ({ issueId }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    currentIssue, 
    comments,
    isLoading, 
    error, 
    fetchIssue
  } = useIssuesStore();
  
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (issueId) {
      loadIssue();
    }
  }, [issueId]);

  const loadIssue = async () => {
    try {
      await fetchIssue(issueId);
    } catch (error) {
      console.error('Error loading issue:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: currentIssue.title,
        text: currentIssue.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
    }
  };

  const handleStatusUpdate = (issueId, newStatus) => {
    // Issue detail page will automatically refresh with new data
    // since it's using fetchIssue to get the latest state
    if (currentIssue && currentIssue.id === issueId) {
      fetchIssue(issueId);
    }
  };

  const handleIssueRemoved = (issueId) => {
    // Navigate back to issues list when issue is removed
    router.push('/issues');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4" />;
      case 'ACKNOWLEDGED':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'ARCHIVED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACKNOWLEDGED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return <LoadingCard message="Loading issue details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Error loading issue: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadIssue}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Issue not found.
            <Link href="/issues">
              <Button variant="outline" size="sm" className="ml-2">
                Back to Issues
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            style={{ color: colors.primary[400] }}
            className="transition-colors hover:opacity-80"
            onMouseEnter={(e) => e.target.style.color = colors.primary[500]}
            onMouseLeave={(e) => e.target.style.color = colors.primary[400]}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={`px-3 py-1 text-xs font-medium border ${getStatusColor(currentIssue.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(currentIssue.status)}
                          <span>{currentIssue.status.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                      <Badge variant="outline" className="text-[#3B38A0] border-[#3B38A0]">
                        {currentIssue.category_name || 'General'}
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1A2A80] mb-3">
                      {currentIssue.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>by {currentIssue.user_name}</span>
                        {currentIssue.user_reputation && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {currentIssue.user_reputation}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(currentIssue.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-500 hover:text-[#3B38A0]"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {currentIssue.description}
                </p>
                {currentIssue.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{currentIssue.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {currentIssue.media && currentIssue.media.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#1A2A80] flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Media ({currentIssue.media.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Main Media Display */}
                  <div className="mb-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
                      {currentIssue.media[selectedMediaIndex]?.media_type === 'VIDEO' ? (
                        <video
                          src={currentIssue.media[selectedMediaIndex]?.media_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={currentIssue.media[selectedMediaIndex]?.media_url}
                          alt={`Issue media ${selectedMediaIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Media Thumbnails */}
                  {currentIssue.media.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {currentIssue.media.slice(0, showAllMedia ? currentIssue.media.length : 6).map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedMediaIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedMediaIndex 
                              ? 'border-[#3B38A0] shadow-lg' 
                              : 'border-gray-200 hover:border-[#7A85C1]'
                          }`}
                        >
                          <img
                            src={media.media_url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {media.media_type === 'VIDEO' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                      {!showAllMedia && currentIssue.media.length > 6 && (
                        <button
                          onClick={() => setShowAllMedia(true)}
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#7A85C1] flex items-center justify-center text-gray-500 hover:text-[#3B38A0] transition-all"
                        >
                          <span className="text-xs">+{currentIssue.media.length - 6}</span>
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <CommentSection issueId={currentIssue.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1A2A80] text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <VotingButtons
                  issueId={currentIssue.id}
                  initialStats={{
                    upvotes: currentIssue.upvotes || 0,
                    downvotes: currentIssue.downvotes || 0,
                    total_score: currentIssue.vote_score || 0,
                    user_vote: currentIssue.user_vote
                  }}
                  compact={false}
                />
                
                <div className="mt-4">
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Management Actions - Only for Stewards/Admins */}
            {user && canManageIssue(currentIssue, user) && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#1A2A80] text-lg">Manage Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <IssueManagementActions
                    issue={currentIssue}
                    onStatusUpdate={handleStatusUpdate}
                    onIssueRemoved={handleIssueRemoved}
                    compact={false}
                  />
                </CardContent>
              </Card>
            )}

            {/* Issue Info */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1A2A80] text-lg">Issue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={`text-xs ${getStatusColor(currentIssue.status)}`}>
                      {currentIssue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{currentIssue.category_name || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{getTimeAgo(currentIssue.created_at)}</span>
                  </div>
                  {currentIssue.updated_at && currentIssue.updated_at !== currentIssue.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">{getTimeAgo(currentIssue.updated_at)}</span>
                    </div>
                  )}
                  {currentIssue.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved:</span>
                      <span className="font-medium">{getTimeAgo(currentIssue.resolved_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comments:</span>
                    <span className="font-medium">{comments?.length || 0}</span>
                  </div>
                  {currentIssue.media && currentIssue.media.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Media:</span>
                      <span className="font-medium">{currentIssue.media.length} files</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            {(currentIssue.location_lat && currentIssue.location_lng) && (
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-[#1A2A80] text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    {/* TODO: Integrate with map component */}
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Map View</p>
                      <p className="text-xs text-gray-400">
                        {currentIssue.location_lat}, {currentIssue.location_lng}
                      </p>
                    </div>
                  </div>
                  {currentIssue.address && (
                    <p className="mt-3 text-sm text-gray-600">{currentIssue.address}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
