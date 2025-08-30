'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store';
import { useStewardStore } from '../../store/stores/stewardStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { Textarea } from '../ui/textarea';
import { 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Star,
  ArrowLeft,
  Send,
  Eye,
  MessageSquare,
  Users
} from 'lucide-react';

const AdminApplicationsPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    pendingApplications, 
    isLoading, 
    error, 
    fetchPendingApplications, 
    reviewApplication,
    isSubmitting 
  } = useStewardStore();
  const router = useRouter();
  const [reviewingApp, setReviewingApp] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    fetchPendingApplications();
  }, [user, router, fetchPendingApplications, isInitialized, authLoading]);

  const handleReview = async (applicationId, status) => {
    if (!feedback.trim() && status === 'REJECTED') {
      // setError('Please provide feedback for rejected applications');
      return;
    }

    try {
      await reviewApplication(applicationId, status, feedback);
      setReviewingApp(null);
      setFeedback('');
      // Refresh the applications list
      fetchPendingApplications();
    } catch (error) {
      console.error('Failed to review application:', error);
    }
  };

  const openReviewModal = (application) => {
    setReviewingApp(application);
    setFeedback('');
  };

  const closeReviewModal = () => {
    setReviewingApp(null);
    setFeedback('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while auth is initializing
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{
              background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
            }}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1A2A80]">Steward Applications</h1>
              <p className="text-gray-600">Review and manage pending steward applications</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              }}>
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[#1A2A80]">{pendingApplications.length}</div>
              <div className="text-sm text-gray-600">Pending Applications</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[#1A2A80]">--</div>
              <div className="text-sm text-gray-600">Active Stewards</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
              }}>
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[#1A2A80]">--</div>
              <div className="text-sm text-gray-600">Approved Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {pendingApplications.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Applications</h3>
              <p className="text-gray-500">All steward applications have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingApplications.map((application) => (
              <Card key={application.id} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    {/* Applicant Info */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-16 h-16 ring-2 ring-white shadow-lg">
                        <AvatarImage 
                          src={application.user?.avatar} 
                          alt={application.user?.fullName} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#B2B0E8] to-[#7A85C1] text-white text-xl font-bold">
                          {application.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Application Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#1A2A80] mb-1">
                            {application.user?.fullName}
                          </h3>
                          <p className="text-gray-600 mb-2">{application.user?.email}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-[#7A85C1]" />
                              <span>{application.user?.reputationScore || 0} reputation</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-[#7A85C1]" />
                              <span>Applied {formatDate(application.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      {/* Justification */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-[#7A85C1]" />
                          Application Justification
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">
                            {application.justification}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => openReviewModal(application)}
                          variant="outline"
                          className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Application
                        </Button>
                        <Button
                          onClick={() => handleReview(application.id, 'APPROVED')}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Quick Approve
                        </Button>
                        <Button
                          onClick={() => openReviewModal(application)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewingApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1A2A80] flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Review Application - {reviewingApp.user?.fullName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Applicant Summary */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={reviewingApp.user?.avatar} alt={reviewingApp.user?.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#B2B0E8] to-[#7A85C1] text-white font-bold">
                      {reviewingApp.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-[#1A2A80]">{reviewingApp.user?.fullName}</h3>
                    <p className="text-sm text-gray-600">{reviewingApp.user?.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{reviewingApp.user?.reputationScore || 0} reputation</span>
                      <span>Applied {formatDate(reviewingApp.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Justification */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Application Justification</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900 leading-relaxed">{reviewingApp.justification}</p>
                  </div>
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional for approval, required for rejection)
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the applicant about their application..."
                    className="w-full min-h-[100px]"
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {feedback.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => handleReview(reviewingApp.id, 'APPROVED')}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReview(reviewingApp.id, 'REJECTED')}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={closeReviewModal}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
