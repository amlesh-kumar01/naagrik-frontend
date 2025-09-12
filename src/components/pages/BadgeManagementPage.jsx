'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useBadgeStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { 
  Award,
  Plus,
  Edit3,
  Trash2,
  Users,
  Star,
  Crown,
  Shield,
  Trophy,
  ArrowLeft,
  Save,
  X,
  Eye,
  UserPlus
} from 'lucide-react';

const BadgeManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    badges,
    isLoading,
    error,
    fetchAllBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    clearError
  } = useBadgeStore();
  
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'star',
    color: colors.primary[600],
    criteria: '',
    points_required: 0
  });

  const iconOptions = [
    { value: 'star', label: 'Star', icon: Star },
    { value: 'trophy', label: 'Trophy', icon: Trophy },
    { value: 'crown', label: 'Crown', icon: Crown },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'award', label: 'Award', icon: Award }
  ];

  const colorOptions = [
    { value: colors.primary[600], label: 'Green Primary' },
    { value: '#10B981', label: 'Green' },
    { value: '#F59E0B', label: 'Yellow' },
    { value: '#EF4444', label: 'Red' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' }
  ];

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    fetchAllBadges();
  }, [user, router, isInitialized, authLoading, fetchAllBadges]);

  // Show loading while auth is initializing
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await createBadge(formData);
    if (result.success) {
      setShowCreateForm(false);
      resetForm();
    }
  };

  const handleEditBadge = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingBadge) return;

    const result = await updateBadge(editingBadge.id, formData);
    if (result.success) {
      setEditingBadge(null);
      resetForm();
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (window.confirm('Are you sure you want to delete this badge? This action cannot be undone.')) {
      await deleteBadge(badgeId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'star',
      color: '#3B38A0',
      criteria: '',
      points_required: 0
    });
  };

  const startEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon || 'star',
      color: badge.color || '#3B38A0',
      criteria: badge.criteria || '',
      points_required: badge.points_required || 0
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingBadge(null);
    resetForm();
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingBadge(null);
    resetForm();
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : Star;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
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
              className="transition-all duration-200"
              style={{ color: colors.primary[600] }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${colors.primary[200]}33`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{
                background: colors.gradients.primary
              }}>
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: colors.primary[700] }}>Badge Management</h1>
                <p className="text-gray-600">Create and manage achievement badges</p>
              </div>
            </div>
            
            <Button
              onClick={startCreate}
              disabled={showCreateForm || editingBadge}
              className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Badge Form */}
        {showCreateForm && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Badge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter badge name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="points_required" className="block text-sm font-medium text-gray-700 mb-2">
                      Points Required
                    </label>
                    <Input
                      id="points_required"
                      name="points_required"
                      type="number"
                      value={formData.points_required}
                      onChange={handleInputChange}
                      placeholder="Enter points required"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter badge description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-2">
                    Criteria
                  </label>
                  <Textarea
                    id="criteria"
                    name="criteria"
                    value={formData.criteria}
                    onChange={handleInputChange}
                    placeholder="Enter badge criteria"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <select
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Badge
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Badges List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const IconComponent = getIconComponent(badge.icon);
            
            return (
              <Card key={badge.id} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                {editingBadge && editingBadge.id === badge.id ? (
                  // Edit Form
                  <CardContent className="p-6">
                    <form onSubmit={handleEditBadge} className="space-y-4">
                      <div>
                        <label htmlFor={`edit-name-${badge.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Badge Name *
                        </label>
                        <Input
                          id={`edit-name-${badge.id}`}
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter badge name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`edit-description-${badge.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <Textarea
                          id={`edit-description-${badge.id}`}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter badge description"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`edit-points-${badge.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Points Required
                        </label>
                        <Input
                          id={`edit-points-${badge.id}`}
                          name="points_required"
                          type="number"
                          value={formData.points_required}
                          onChange={handleInputChange}
                          placeholder="Enter points required"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                ) : (
                  // Badge Display
                  <>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: badge.color || '#3B38A0' }}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-[#1A2A80] text-lg">{badge.name}</CardTitle>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(badge)}
                            className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBadge(badge.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {badge.description && (
                        <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Points Required</span>
                          <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-100 text-blue-800">
                            <Star className="h-3 w-3" />
                            <span>{badge.points_required || 0}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Holders</span>
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{badge.holder_count || 0}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <Button
                          onClick={() => router.push(`/admin/badges/${badge.id}/holders`)}
                          variant="outline"
                          size="sm"
                          className="w-full border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Holders
                        </Button>
                        <Button
                          onClick={() => router.push(`/admin/badges/${badge.id}/award`)}
                          variant="outline"
                          size="sm"
                          className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Award Badge
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {badges.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Badges Found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first achievement badge.</p>
              <Button
                onClick={startCreate}
                className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Badge
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BadgeManagementPage;
