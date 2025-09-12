'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useZoneStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { 
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Save,
  X,
  BarChart3
} from 'lucide-react';
import { colors } from '../../lib/theme';

const ZoneManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    zones,
    isLoading,
    error,
    fetchAllZones,
    createZone,
    updateZone,
    deleteZone,
    clearError
  } = useZoneStore();
  
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    fetchAllZones();
  }, [user, router, isInitialized, authLoading, fetchAllZones]);

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await createZone(formData);
    if (result.success) {
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
    }
  };

  const handleEditZone = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingZone) return;

    const result = await updateZone(editingZone.id, formData);
    if (result.success) {
      setEditingZone(null);
      setFormData({ name: '', description: '' });
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (window.confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
      await deleteZone(zoneId);
    }
  };

  const startEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || ''
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingZone(null);
    setFormData({ name: '', description: '' });
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingZone(null);
    setFormData({ name: '', description: '' });
  };

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
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: colors.primary[700] }}>Zone Management</h1>
                <p className="text-gray-600">Create and manage administrative zones</p>
              </div>
            </div>
            
            <Button
              onClick={startCreate}
              disabled={showCreateForm || editingZone}
              className="text-white transition-all duration-200"
              style={{ background: colors.gradients.button }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = colors.gradients.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.background = colors.gradients.button;
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Zone
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Zone Form */}
        {showCreateForm && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateZone} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter zone name"
                    required
                  />
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
                    placeholder="Enter zone description"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Zone
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

        {/* Zones List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <Card key={zone.id} className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              {editingZone && editingZone.id === zone.id ? (
                // Edit Form
                <CardContent className="p-6">
                  <form onSubmit={handleEditZone} className="space-y-4">
                    <div>
                      <label htmlFor={`edit-name-${zone.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Zone Name *
                      </label>
                      <Input
                        id={`edit-name-${zone.id}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter zone name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`edit-description-${zone.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        id={`edit-description-${zone.id}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter zone description"
                        rows={3}
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
                // Zone Display
                <>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#1A2A80] text-lg">{zone.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(zone)}
                          className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteZone(zone.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {zone.description && (
                      <p className="text-gray-600 text-sm mb-4">{zone.description}</p>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Stewards</span>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{zone.steward_count || 0}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Issues</span>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{zone.total_issues || 0}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Active Issues</span>
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{zone.active_issues || 0}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => router.push(`/admin/zones/${zone.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        {zones.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Zones Found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first administrative zone.</p>
              <Button
                onClick={startCreate}
                className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Zone
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ZoneManagementPage;
