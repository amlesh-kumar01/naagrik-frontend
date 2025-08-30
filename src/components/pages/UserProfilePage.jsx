'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUserStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Star,
  Award,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Upload
} from 'lucide-react';

const UserProfilePage = () => {
  const { user, updateUser, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    profile, 
    stats, 
    badges, 
    isLoading, 
    isUploading, 
    error,
    fetchAllProfileData,
    updateProfile,
    uploadProfileImage,
    clearError 
  } = useUserStore();
  
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAllProfileData();
  }, [user, router, fetchAllProfileData, isInitialized, authLoading]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setEditing(true);
    clearError();
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateProfile(editForm);
      updateUser(updatedProfile);
      setEditing(false);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      fullName: profile?.fullName || '',
      email: profile?.email || ''
    });
    clearError();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadProfileImage(file);
      updateUser({ ...user, profileImage: imageUrl });
    } catch (error) {
      // Error is already handled in the store
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A2A80]">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your activity</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                      <AvatarImage 
                        src={profile?.profileImage || profile?.avatar} 
                        alt={profile?.fullName} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#B2B0E8] to-[#7A85C1] text-white text-2xl font-bold">
                        {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="h-4 w-4 text-[#3B38A0]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-[#1A2A80]">{profile?.fullName}</h2>
                    <p className="text-gray-600">{profile?.email}</p>
                    
                    {/* Role Badge */}
                    <div className="flex justify-center">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          profile?.role === 'STEWARD' ? 'bg-green-100 text-green-800' :
                          profile?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {profile?.role?.toLowerCase() || 'citizen'}
                      </Badge>
                    </div>

                    {/* Reputation Score */}
                    <div className="flex items-center justify-center space-x-2 text-[#7A85C1]">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">{profile?.reputationScore || 0} reputation</span>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profile?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Section */}
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter your email"
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="w-full border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1A2A80] flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, index) => (
                      <div 
                        key={index}
                        className="text-center p-3 rounded-lg bg-gradient-to-br from-[#B2B0E8]/20 to-[#7A85C1]/20 hover:from-[#B2B0E8]/30 hover:to-[#7A85C1]/30 transition-all duration-200"
                      >
                        <Award className="h-6 w-6 mx-auto mb-2 text-[#7A85C1]" />
                        <h4 className="font-medium text-sm text-[#1A2A80]">{badge.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No badges earned yet</p>
                    <p className="text-sm mt-1">Start reporting issues to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                    background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
                  }}>
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#1A2A80]">{stats?.issuesCreated || 0}</div>
                  <div className="text-sm text-gray-600">Issues Created</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}>
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#1A2A80]">{stats?.issuesResolved || 0}</div>
                  <div className="text-sm text-gray-600">Issues Resolved</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}>
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#1A2A80]">{stats?.commentsMade || 0}</div>
                  <div className="text-sm text-gray-600">Comments Made</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#1A2A80]">{stats?.votesCast || 0}</div>
                  <div className="text-sm text-gray-600">Votes Cast</div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#1A2A80] flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Total Issues Created</span>
                    <span className="font-semibold text-[#1A2A80]">{stats?.issuesCreated || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Issues Resolved</span>
                    <span className="font-semibold text-green-600">{stats?.issuesResolved || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Comments Made</span>
                    <span className="font-semibold text-[#1A2A80]">{stats?.commentsMade || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Votes Cast</span>
                    <span className="font-semibold text-[#1A2A80]">{stats?.votesCast || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Badges Earned</span>
                    <span className="font-semibold text-[#7A85C1]">{badges.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
