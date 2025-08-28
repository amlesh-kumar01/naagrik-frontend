'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../ui/loading';
import { useIssuesStore } from '../../store';
import { issueAPI } from '../../lib/api';
import { 
  MapPin, 
  Camera, 
  X, 
  Upload,
  Navigation,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { getCurrentLocation, isValidImageType, isValidVideoType } from '@/lib/utils';

const ReportIssueModal = ({ isOpen, onClose, initialLocation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'MEDIUM',
    locationLat: initialLocation?.lat || '',
    locationLng: initialLocation?.lng || '',
    address: '',
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const { createIssue } = useIssuesStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await issueAPI.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'High Priority', color: 'text-red-600' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate all files
    const validFiles = [];
    const newPreviews = [];
    let hasErrors = false;

    for (const file of files) {
      // Check if we're exceeding the 5 file limit
      if (mediaFiles.length + validFiles.length >= 5) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Maximum 5 files allowed' 
        }));
        hasErrors = true;
        break;
      }

      // Validate file type
      if (!isValidImageType(file.type) && !isValidVideoType(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Please select valid image or video files only' 
        }));
        hasErrors = true;
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          media: 'Each file must be less than 10MB' 
        }));
        hasErrors = true;
        continue;
      }

      validFiles.push(file);

      // Create preview for images
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
        // For videos, just store file info
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

  const getCurrentLocationHandler = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        locationLat: location.lat,
        locationLng: location.lng,
      }));
      
      // Reverse geocode to get address (you can implement this)
      // For now, we'll just update the coordinates
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        location: 'Unable to get your location. Please enable location services.' 
      }));
    } finally {
      setIsGettingLocation(false);
    }
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

    if (!formData.locationLat || !formData.locationLng) {
      newErrors.location = 'Location is required. Please use "Get My Location" or enter coordinates.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const issueData = new FormData();
      Object.keys(formData).forEach(key => {
        issueData.append(key, formData[key]);
      });
      
      // Add all media files
      mediaFiles.forEach(file => {
        issueData.append('media', file);
      });

      await createIssue(issueData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        priority: 'MEDIUM',
        locationLat: '',
        locationLng: '',
        address: '',
      });
      setMediaFiles([]);
      setMediaPreviews([]);
      setErrors({});
      
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create issue. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B2B0E8]/10 to-[#7A85C1]/10 rounded-lg"></div>
        <div className="relative z-10">
          <DialogHeader className="border-b border-gray-200 pb-6 mb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-[#1A2A80]">
              <div className="p-2 rounded-full bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1]">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <span>Report New Issue</span>
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Help improve your community by reporting problems that need attention. Your voice matters and helps create positive change.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.submit && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
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
              <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
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

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
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
                {errors.categories && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.categories}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white transition-all duration-200 focus:ring-2 focus:ring-[#B2B0E8] focus:border-[#7A85C1]"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
                Location *
              </label>
              
              {/* Emergency Alert */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-semibold mb-1">Emergency Situations</h4>
                    <p className="text-red-700 text-sm mb-2">
                      For immediate emergencies requiring police, fire, or medical assistance, please call emergency services directly.
                    </p>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center text-red-600">
                        <span className="font-semibold mr-1">📞 Emergency: 911</span>
                      </div>
                      <div className="flex items-center text-red-600">
                        <span className="font-semibold mr-1">📞 Non-Emergency: 311</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocationHandler}
                  disabled={isGettingLocation}
                  className="w-full mb-4 border-2 border-[#B2B0E8] text-[#3B38A0] hover:bg-gradient-to-r hover:from-[#B2B0E8] hover:to-[#7A85C1] hover:text-white hover:border-transparent transition-all duration-200"
                >
                  {isGettingLocation ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Get My Location
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    name="locationLat"
                    value={formData.locationLat}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    className="border-2 border-gray-200 focus:border-[#7A85C1] focus:ring-2 focus:ring-[#B2B0E8]"
                  />
                  <Input
                    name="locationLng"
                    value={formData.locationLng}
                    onChange={handleInputChange}
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    className="border-2 border-gray-200 focus:border-[#7A85C1] focus:ring-2 focus:ring-[#B2B0E8]"
                  />
                </div>

                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address or landmark (optional)"
                  className="border-2 border-gray-200 focus:border-[#7A85C1] focus:ring-2 focus:ring-[#B2B0E8]"
                />
              </div>
              
              {errors.location && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#1A2A80] mb-2">
                Photos or Videos (optional) - Max 5 files
              </label>
              
              {mediaFiles.length === 0 ? (
                <div className="border-2 border-dashed border-[#B2B0E8] rounded-xl p-8 text-center hover:border-[#7A85C1] transition-all duration-200 bg-gradient-to-br from-[#B2B0E8]/5 to-[#7A85C1]/5">
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
                    <p className="text-lg font-medium text-[#1A2A80] mb-2">
                      Upload photos or videos
                    </p>
                    <p className="text-sm text-gray-600">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Max 5 files, 10MB each • JPG, PNG, MP4, MOV supported
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload more files button */}
                  {mediaFiles.length < 5 && (
                    <div className="border-2 border-dashed border-[#B2B0E8] rounded-lg p-4 text-center hover:border-[#7A85C1] transition-all duration-200 bg-gradient-to-br from-[#B2B0E8]/5 to-[#7A85C1]/5">
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
                    </div>
                  )}

                  {/* Display uploaded files */}
                  <div className="grid grid-cols-1 gap-3">
                    {mediaPreviews.map((preview, index) => (
                      <Card key={preview.id || index} className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {preview.type === 'image' && preview.src ? (
                                <img 
                                  src={preview.src} 
                                  alt="Preview" 
                                  className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gradient-to-br from-[#B2B0E8] to-[#7A85C1] rounded-lg flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-[#1A2A80]">{mediaFiles[index]?.name}</p>
                                <p className="text-xs text-gray-600">
                                  {mediaFiles[index] ? (mediaFiles[index].size / 1024 / 1024).toFixed(2) : '0'} MB
                                </p>
                                <p className="text-xs text-[#3B38A0] capitalize font-medium">{preview.type}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedia(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <X className="h-5 w-5" />
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

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px] px-6 py-3 bg-gradient-to-r from-[#B2B0E8] to-[#7A85C1] border-0 hover:from-[#7A85C1] hover:to-[#3B38A0] text-white font-semibold shadow-xl transition-all duration-200 transform hover:scale-105"
                style={{ boxShadow: '0 8px 25px rgba(178, 176, 232, 0.4)' }}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Report Issue
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueModal;
