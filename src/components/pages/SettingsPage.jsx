'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors, componentColors } from '../../lib/theme';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Smartphone,
  Mail,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { user, isInitialized, isLoading: authLoading, updateProfile } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    issueUpdates: true,
    systemAlerts: true,
    weeklyDigest: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  useEffect(() => {
    if (!isInitialized || authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Initialize form data with user data
    setProfileData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user, router, isInitialized, authLoading]);

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate password change if attempted
      if (profileData.newPassword) {
        if (!profileData.currentPassword) {
          throw new Error('Current password is required to change password');
        }
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (profileData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
      }

      const updateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        ...(profileData.newPassword && {
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        })
      };

      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    setSuccess('Notification settings updated');
  };

  const handlePrivacyUpdate = () => {
    setSuccess('Privacy settings updated');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              style={{ color: colors.primary[400] }}
              className="hover:bg-opacity-20"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${colors.primary[200]}20`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ background: colors.gradients.primaryReverse }}
            >
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.primary[500] }}>
                Settings
              </h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {(success || error) && (
          <Alert className={`mb-6 ${error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {error ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={error ? 'text-red-800' : 'text-green-800'}>
              {error || success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card 
              className="shadow-lg border-0 backdrop-blur-sm"
              style={{ backgroundColor: componentColors.card.background }}
            >
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        style={isActive ? {
                          backgroundColor: `${colors.primary[200]}40`,
                          color: colors.primary[600],
                          borderRight: `3px solid ${colors.primary[400]}`
                        } : {
                          color: '#6B7280'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.target.style.backgroundColor = `${colors.primary[100]}20`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card 
              className="shadow-lg border-0 backdrop-blur-sm"
              style={{ backgroundColor: componentColors.card.background }}
            >
              <CardHeader>
                <CardTitle style={{ color: colors.primary[500] }}>
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            fullName: e.target.value
                          }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                        placeholder="Email cannot be changed"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                currentPassword: e.target.value
                              }))}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <Input
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                newPassword: e.target.value
                              }))}
                              placeholder="Enter new password"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <Input
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                confirmPassword: e.target.value
                              }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="text-white"
                        style={{ background: colors.gradients.button }}
                        onMouseEnter={(e) => {
                          e.target.style.background = colors.gradients.buttonHover;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = colors.gradients.button;
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Manage how you receive notifications</p>
                    
                    <div className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {key === 'emailNotifications' && 'Receive notifications via email'}
                              {key === 'pushNotifications' && 'Receive push notifications'}
                              {key === 'issueUpdates' && 'Get notified about issue status changes'}
                              {key === 'systemAlerts' && 'Receive important system alerts'}
                              {key === 'weeklyDigest' && 'Get a weekly summary of activity'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="rounded border-gray-300 focus:ring-2"
                            style={{ 
                              accentColor: colors.primary[400],
                              focusRingColor: colors.primary[200] 
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleNotificationUpdate}
                        className="text-white"
                        style={{ background: colors.gradients.button }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Control your privacy and data sharing</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings(prev => ({
                            ...prev,
                            profileVisibility: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: colors.primary[400] }}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {key === 'showEmail' && 'Display email address on your profile'}
                                {key === 'showPhone' && 'Display phone number on your profile'}
                                {key === 'allowMessages' && 'Allow other users to send you messages'}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                [key]: e.target.checked
                              }))}
                              className="rounded border-gray-300 focus:ring-2"
                              style={{ 
                                accentColor: colors.primary[400],
                                focusRingColor: colors.primary[200] 
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handlePrivacyUpdate}
                        className="text-white"
                        style={{ background: colors.gradients.button }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Customize the appearance of your interface</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Theme
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['Light', 'Dark', 'Auto'].map((theme) => (
                            <div
                              key={theme}
                              className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors"
                              style={{
                                borderColor: theme === 'Light' ? colors.primary[400] : '#e5e7eb'
                              }}
                            >
                              <div className="text-center">
                                <Globe className="h-8 w-8 mx-auto mb-2" style={{ color: colors.primary[400] }} />
                                <p className="font-medium">{theme}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Language
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: colors.primary[400] }}
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी (Hindi)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="text-white"
                        style={{ background: colors.gradients.button }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Appearance
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
