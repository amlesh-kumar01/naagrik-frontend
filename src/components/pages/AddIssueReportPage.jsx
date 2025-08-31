'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InteractiveMap from '@/components/features/InteractiveMap';
import { useIssuesStore, useZoneStore, useCategoryStore } from '@/store';
import { issueAPI } from '@/lib/api';
import { 
  MapPin, 
  Camera, 
  X, 
  Upload,
  Navigation,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  FileImage,
  FileVideo,
  Map,
  Crosshair,
  MousePointer,
  Eye,
  EyeOff
} from 'lucide-react';
import { isValidImageType, isValidVideoType } from '@/lib/utils';
import { useLocationService } from '@/lib/hooks/useLocationService';

const AddIssueReportPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    zoneId: '',
    priority: 'MEDIUM',
    locationLat: '',
    locationLng: '',
    address: '',
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  
  // Map related states
  const [showMap, setShowMap] = useState(true);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapInteractive, setIsMapInteractive] = useState(true);
  const [mapZoom, setMapZoom] = useState(13);
  
  const { createIssue } = useIssuesStore();
  const { fetchAvailableZones } = useZoneStore();
  const { fetchAllCategories } = useCategoryStore();
  const { getCurrentLocation } = useLocationService();

  // Fetch categories and zones on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResult = await fetchAllCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.categories);
        } else {
          setErrors(prev => ({ ...prev, categories: categoriesResult.error || 'Failed to load categories' }));
        }
        
        // Fetch zones
        const zonesResult = await fetchAvailableZones();
        if (zonesResult.success) {
          setZones(zonesResult.zones);
        } else {
          setErrors(prev => ({ ...prev, zones: zonesResult.error || 'Failed to load zones' }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setErrors(prev => ({ 
          ...prev, 
          general: 'Failed to load form data. Please refresh the page.' 
        }));
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingZones(false);
      }
    };

    fetchData();
    getCurrentLocationHandler(); // Auto-get user location on load
  }, []);

  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: 'text-green-600', description: 'Minor issues that can wait' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'text-yellow-600', description: 'Issues that need attention soon' },
    { value: 'HIGH', label: 'High Priority', color: 'text-red-600', description: 'Urgent issues requiring immediate action' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update map center and selected location when coordinates change
    if (name === 'locationLat' || name === 'locationLng') {
      const lat = name === 'locationLat' ? parseFloat(value) : parseFloat(formData.locationLat);
      const lng = name === 'locationLng' ? parseFloat(value) : parseFloat(formData.locationLng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setSelectedLocation({ lat, lng });
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMapClick = useCallback((location) => {
    if (!isMapInteractive) return;
    
    const { latitude: lat, longitude: lng } = location;
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      locationLat: lat.toFixed(6),
      locationLng: lng.toFixed(6)
    }));
    
    // Clear location error if it exists
    setErrors(prev => ({ ...prev, location: '' }));
  }, [isMapInteractive]);

  const getCurrentLocationHandler = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation({ 
        showProgress: true,
        enableHighAccuracy: true 
      });
      setFormData(prev => ({
        ...prev,
        locationLat: location.latitude.toFixed(6),
        locationLng: location.longitude.toFixed(6),
      }));
      setMapCenter([location.latitude, location.longitude]);
      setSelectedLocation({ lat: location.latitude, lng: location.longitude });
      setMapZoom(15);
      
      setErrors(prev => ({ ...prev, location: '' }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        location: 'Unable to get your location. Please enable location services or double-click on the map to select a location.' 
      }));
    } finally {
      setIsGettingLocation(false);
    }
  };

  const clearSelectedLocation = () => {
    setSelectedLocation(null);
    setFormData(prev => ({
      ...prev,
      locationLat: '',
      locationLng: '',
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    const newPreviews = [];
    let hasErrors = false;

    for (const file of files) {
      if (mediaFiles.length + validFiles.length >= 5) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Maximum 5 files allowed' 
        }));
        hasErrors = true;
        break;
      }

      if (!isValidImageType(file.type) && !isValidVideoType(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Please select valid image or video files only' 
        }));
        hasErrors = true;
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Each file must be less than 10MB' 
        }));
        hasErrors = true;
        continue;
      }

      validFiles.push(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaPreviews(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: 'image',
            src: e.target.result,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          id: Date.now() + Math.random(),
          type: 'video',
          src: null,
          file: file
        });
      }
    }

    if (!hasErrors) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
      setErrors(prev => ({ ...prev, media: '' }));
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, media: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.categoryId) {
      newErrors.category = 'Category is required';
    }

    if (!formData.zoneId) {
      newErrors.zone = 'Zone is required';
    }

    if (!formData.locationLat || !formData.locationLng) {
      newErrors.location = 'Location is required. Please click on the map, use "Get My Location", or enter coordinates manually.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorElement = document.querySelector('.border-red-400');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const issueData = new FormData();
      Object.keys(formData).forEach(key => {
        issueData.append(key, formData[key]);
      });
      
      mediaFiles.forEach(file => {
        issueData.append('media', file);
      });

      await createIssue(issueData);
      router.push('/issues?success=true');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create issue. Please try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4 text-[#3B38A0] hover:bg-[#B2B0E8]/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center shadow-xl" style={{
                background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 100%)'
              }}>
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#1A2A80] mb-4">
                Create Issue Report
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Report community issues with precise location mapping. Click on the map to pinpoint the exact location of the problem.
              </p>
            </div>
          </div>

          {/* Emergency Alert */}
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-bold text-lg mb-2">Emergency Situations</h3>
                  <p className="text-red-700 mb-4">
                    For immediate emergencies requiring police, fire, or medical assistance, please call emergency services directly.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center bg-red-100 px-3 py-2 rounded-lg">
                      <span className="font-bold text-red-800">📞 Emergency: 911</span>
                    </div>
                    <div className="flex items-center bg-red-100 px-3 py-2 rounded-lg">
                      <span className="font-bold text-red-800">📞 Non-Emergency: 311</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Section - Show first on mobile */}
            <div className="lg:order-2 space-y-6">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-2xl font-bold text-[#1A2A80] flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Location Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Map Controls */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Map className="h-5 w-5 text-[#3B38A0]" />
                      <span className="font-semibold text-[#1A2A80]">Interactive Location Map</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMapInteractive(!isMapInteractive)}
                        className={`border-[#B2B0E8] ${isMapInteractive ? 'bg-[#B2B0E8] text-white' : 'text-[#3B38A0]'}`}
                      >
                        {isMapInteractive ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                        {isMapInteractive ? 'Interactive' : 'View Only'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="border-[#B2B0E8] text-[#3B38A0]"
                      >
                        {showMap ? 'Hide Map' : 'Show Map'}
                      </Button>
                    </div>
                  </div>

                  {showMap && (
                    <div className="mb-6">
                      <InteractiveMap
                        height="400px"
                        enableLocationSelection={isMapInteractive}
                        showCurrentLocation={true}
                        onLocationSelect={isMapInteractive ? handleMapClick : undefined}
                        onLocationConfirm={(location, address) => {
                          setFormData(prev => ({
                            ...prev,
                            locationLat: location.latitude.toFixed(6),
                            locationLng: location.longitude.toFixed(6),
                            address: address || prev.address
                          }));
                          setSelectedLocation({ 
                            lat: location.latitude, 
                            lng: location.longitude 
                          });
                          setErrors(prev => ({ ...prev, location: '' }));
                        }}
                        className="rounded-lg overflow-hidden border shadow-sm"
                      />
                      
                      {/* Map Instructions */}
                      {isMapInteractive && !selectedLocation && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <MousePointer className="h-5 w-5 text-blue-600" />
                            <p className="text-blue-800 font-medium">Double-click anywhere on the map to pin the issue location</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Get Current Location Button */}
                      <div className="mt-4 flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocationHandler}
                          disabled={isGettingLocation}
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          {isGettingLocation ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Getting Location...
                            </>
                          ) : (
                            <>
                              <Crosshair className="h-4 w-4 mr-2" />
                              Get My Current Location
                            </>
                          )}
                        </Button>
                        
                        {selectedLocation && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={clearSelectedLocation}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Selection
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Latitude *
                        </label>
                        <Input
                          name="locationLat"
                          value={formData.locationLat}
                          onChange={handleLocationInputChange}
                          placeholder="e.g., 40.7128"
                          type="number"
                          step="any"
                          className={`border-2 transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] ${
                            errors.location ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Longitude *
                        </label>
                        <Input
                          name="locationLng"
                          value={formData.locationLng}
                          onChange={handleLocationInputChange}
                          placeholder="e.g., -74.0060"
                          type="number"
                          step="any"
                          className={`border-2 transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] ${
                            errors.location ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Address or Landmark (Optional)
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Main St, City Park, Near the library..."
                        className="border-2 border-gray-200 focus:border-[#7A85C1] focus:ring-2 focus:ring-[#B2B0E8]"
                      />
                    </div>

                    {errors.location && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.location}
                      </p>
                    )}

                    {selectedLocation && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 font-medium">Location Selected</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Section */}
            <div className="lg:order-1">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-2xl font-bold text-[#1A2A80]">Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.submit && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
                      </Alert>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Issue Title *
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief, descriptive title for the issue"
                        className={`border-2 transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] ${
                          errors.title ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                        }`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Description *
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide detailed information about the issue..."
                        rows={4}
                        className={`border-2 transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] resize-none ${
                          errors.description ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                        }`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Category *
                      </label>
                      {isLoadingCategories ? (
                        <div className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          <span className="text-gray-600">Loading categories...</span>
                        </div>
                      ) : (
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          className={`w-full border-2 rounded-lg px-4 py-3 bg-white transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] ${
                            errors.category ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      )}
                      {errors.category && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Zone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Zone *
                      </label>
                      {isLoadingZones ? (
                        <div className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 flex items-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          <span className="text-gray-600">Loading zones...</span>
                        </div>
                      ) : (
                        <select
                          name="zoneId"
                          value={formData.zoneId}
                          onChange={handleInputChange}
                          className={`w-full border-2 rounded-lg px-4 py-3 bg-white transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] ${
                            errors.zone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#7A85C1]'
                          }`}
                        >
                          <option value="">Select a zone</option>
                          {zones.map(zone => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                          ))}
                        </select>
                      )}
                      {errors.zone && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.zone}
                        </p>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Priority Level
                      </label>
                      <div className="space-y-2">
                        {priorities.map(priority => (
                          <label key={priority.value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-[#B2B0E8] transition-all duration-200">
                            <input
                              type="radio"
                              name="priority"
                              value={priority.value}
                              checked={formData.priority === priority.value}
                              onChange={handleInputChange}
                              className="mt-1 h-4 w-4 text-[#7A85C1] focus:ring-[#B2B0E8]"
                            />
                            <div>
                              <div className={`font-semibold ${priority.color}`}>
                                {priority.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {priority.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-[#1A2A80]">
                        Photos or Videos (Optional)
                      </label>
                      
                      {mediaFiles.length === 0 ? (
                        <Card className="border-2 border-dashed border-[#B2B0E8] hover:border-[#7A85C1] transition-all duration-200 bg-gradient-to-br from-[#B2B0E8]/5 to-[#7A85C1]/5">
                          <CardContent className="p-8 text-center">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="media-upload"
                              multiple
                            />
                            <label htmlFor="media-upload" className="cursor-pointer">
                              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] flex items-center justify-center mb-4">
                                <Camera className="h-8 w-8 text-white" />
                              </div>
                              <p className="text-lg font-semibold text-[#1A2A80] mb-2">
                                Upload Photos or Videos
                              </p>
                              <p className="text-sm text-gray-600">
                                Max 5 files, 10MB each
                              </p>
                            </label>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {mediaFiles.length < 5 && (
                            <Card className="border-2 border-dashed border-[#B2B0E8] hover:border-[#7A85C1] transition-all duration-200">
                              <CardContent className="p-4 text-center">
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  id="media-upload-more"
                                  multiple
                                />
                                <label htmlFor="media-upload-more" className="cursor-pointer flex items-center justify-center space-x-2">
                                  <Upload className="h-5 w-5 text-[#3B38A0]" />
                                  <span className="text-sm font-medium text-[#3B38A0]">
                                    Add more files ({mediaFiles.length}/5)
                                  </span>
                                </label>
                              </CardContent>
                            </Card>
                          )}

                          <div className="space-y-2">
                            {mediaPreviews.map((preview, index) => (
                              <Card key={preview.id || index} className="bg-white/90 backdrop-blur-sm border border-gray-200">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {preview.type === 'image' && preview.src ? (
                                        <img 
                                          src={preview.src} 
                                          alt="Preview" 
                                          className="h-12 w-12 object-cover rounded border"
                                        />
                                      ) : (
                                        <div className="h-12 w-12 bg-gradient-to-br from-[#B2B0E8] to-[#7A85C1] rounded flex items-center justify-center">
                                          {preview.type === 'image' ? (
                                            <FileImage className="h-6 w-6 text-white" />
                                          ) : (
                                            <FileVideo className="h-6 w-6 text-white" />
                                          )}
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-[#1A2A80] truncate">
                                          {mediaFiles[index]?.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {mediaFiles[index] ? (mediaFiles[index].size / 1024 / 1024).toFixed(2) : '0'} MB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeMedia(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {errors.media && (
                        <p className="text-red-500 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {errors.media}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] border-0 hover:from-[#7A85C1] hover:to-[#3B38A0] text-white font-bold shadow-xl transition-all duration-200 transform hover:scale-105"
                      style={{ boxShadow: '0 8px 25px rgba(178, 176, 232, 0.4)' }}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Submit Issue Report
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AddIssueReportPage;
