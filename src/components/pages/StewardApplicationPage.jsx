'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUserStore, useStewardStore, useZoneStore, useCategoryStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { Textarea } from '../ui/textarea';
import { 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  Users,
  Calendar,
  Send,
  ArrowLeft,
  Star,
  TrendingUp
} from 'lucide-react';

const StewardApplicationPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const { 
    myApplication, 
    isLoading, 
    isSubmitting, 
    error,
    submitApplication,
    fetchMyApplication,
    clearError 
  } = useStewardStore();

  const { fetchAvailableZones } = useZoneStore();
  const { fetchAllCategories } = useCategoryStore();
  
  const router = useRouter();
  const [justification, setJustification] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    loadApplicationData();
  }, [user, router, isInitialized, authLoading]);

  const loadApplicationData = async () => {
    try {
      await Promise.all([
        fetchMyApplication(),
        fetchProfile()
      ]);

      // Load categories and zones for selection
      const [categoriesResult, zonesResult] = await Promise.all([
        fetchAllCategories(),
        fetchAvailableZones()
      ]);

      if (categoriesResult.success) {
        setAvailableCategories(categoriesResult.categories);
      }

      if (zonesResult.success) {
        setAvailableZones(zonesResult.zones);
      }
    } catch (error) {
      // Errors are handled in stores
    }
  };

  useEffect(() => {
    if (profile) {
      checkEligibility(profile);
    }
  }, [profile]);

  const checkEligibility = (profileData) => {
    const reputation = profileData.reputationScore || 0;
    const accountAge = profileData.createdAt ? 
      Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Requirements: 100+ reputation, 30+ days old account
    const eligible = reputation >= 100 && accountAge >= 30;
    setIsEligible(eligible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (justification.length < 50) {
      return; // Form validation will show error
    }

    if (justification.length > 1000) {
      return; // Form validation will show error
    }

    if (selectedCategories.length === 0) {
      return; // Form validation will show error
    }

    if (selectedZones.length === 0) {
      return; // Form validation will show error
    }

    try {
      clearError();
      await submitApplication({
        justification,
        categories: selectedCategories,
        zones: selectedZones
      });
      setSuccess(true);
      setJustification('');
      setSelectedCategories([]);
      setSelectedZones([]);
    } catch (error) {
      // Error is handled in store
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5" />;
      case 'PENDING':
      default:
        return <Clock className="h-5 w-5" />;
    }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
              background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
            }}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A2A80] mb-2">Become a Steward</h1>
            <p className="text-gray-600">Help moderate and improve your community</p>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your steward application has been submitted successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Application Status */}
        {myApplication && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Your Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={`flex items-center space-x-1 ${getStatusColor(myApplication.status)}`}>
                    {getStatusIcon(myApplication.status)}
                    <span>{myApplication.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-medium">{formatDate(myApplication.createdAt)}</span>
                </div>
                {myApplication.reviewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reviewed</span>
                    <span className="font-medium">{formatDate(myApplication.reviewedAt)}</span>
                  </div>
                )}
                {myApplication.feedback && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                    <p className="text-gray-700">{myApplication.feedback}</p>
                  </div>
                )}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Your Justification</h4>
                  <p className="text-blue-800">{myApplication.justification}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eligibility Check */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-[#1A2A80] flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Eligibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-[#7A85C1]" />
                  <span className="text-gray-700">Minimum 100 reputation points</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(profile?.reputationScore || 0) >= 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium text-[#1A2A80]">
                    {profile?.reputationScore || 0} points
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-[#7A85C1]" />
                  <span className="text-gray-700">Account older than 30 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  {profile?.createdAt && 
                    Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) >= 30 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium text-[#1A2A80]">
                    {profile?.createdAt ? 
                      `${Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
              
              {!isEligible && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    You don't meet all the requirements yet. Keep participating in the community to increase your reputation!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        {isEligible && !application && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Submit Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Categories You Want to Manage *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableCategories.map(category => (
                      <Card 
                        key={category.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedCategories.includes(category.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedCategories.includes(category.id)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedCategories.includes(category.id) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
                  )}
                </div>

                {/* Zone Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Zones You Want to Cover *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableZones.map(zone => (
                      <Card 
                        key={zone.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedZones.includes(zone.id) 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleZoneToggle(zone.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{zone.name}</h4>
                              {zone.description && (
                                <p className="text-sm text-gray-600">{zone.description}</p>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedZones.includes(zone.id)
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedZones.includes(zone.id) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {selectedZones.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">Please select at least one zone</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become a steward? *
                  </label>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Tell us why you want to become a steward and how you plan to help the community. Please provide specific examples of your community involvement and explain your motivation. (50-1000 characters)"
                    className="w-full min-h-[120px] resize-none"
                    maxLength={1000}
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${
                      justification.length < 50 ? 'text-red-500' : 
                      justification.length > 900 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {justification.length < 50 ? 
                        `${50 - justification.length} more characters needed` :
                        'Minimum length met'
                      }
                    </span>
                    <span className="text-sm text-gray-500">
                      {justification.length}/1000 characters
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    What Stewards Do
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Review and moderate community-reported issues</li>
                    <li>• Add notes and updates to help resolve problems</li>
                    <li>• Coordinate with local authorities and agencies</li>
                    <li>• Help maintain community guidelines and standards</li>
                    <li>• Support other community members with their reports</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || justification.length < 50 || justification.length > 1000 || selectedCategories.length === 0 || selectedZones.length === 0}
                  className="w-full bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-[#1A2A80] flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              How to Increase Your Reputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Earn Points By:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Reporting valid community issues (+10 points)</li>
                  <li>• Having your issues resolved (+20 points)</li>
                  <li>• Adding helpful comments (+5 points)</li>
                  <li>• Receiving upvotes on reports (+2 points each)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Best Practices:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Include clear photos with your reports</li>
                  <li>• Provide detailed descriptions</li>
                  <li>• Use accurate location information</li>
                  <li>• Engage constructively with the community</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StewardApplicationPage;
