'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCategoryStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { 
  Layers,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Save,
  X,
  FileText
} from 'lucide-react';

const CategoryManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    categories,
    isLoading,
    error,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategoriesWithStats,
    clearError
  } = useCategoryStore();
  
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Load categories with statistics
    loadCategories();
  }, [isInitialized, authLoading, user, router]);

  const loadCategories = async () => {
    try {
      await fetchCategoriesWithStats();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Category name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Category description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        resetForm();
        loadCategories(); // Refresh the list
      } else {
        setFormErrors({ submit: result.error || 'Failed to save category' });
      }
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to save category' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowCreateForm(true);
    setFormErrors({});
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        loadCategories(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowCreateForm(false);
    setFormErrors({});
  };

  if (authLoading || !isInitialized) {
    return <LoadingCard message="Loading..." />;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full" style={{ background: colors.gradients.primary }}>
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                    Category Management
                  </h1>
                  <p className="text-gray-600">
                    Manage issue categories and their settings
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
              style={{ 
                background: colors.gradients.primary,
                border: 'none'
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-6 border-2" style={{ borderColor: colors.primary[200] }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" style={{ color: colors.primary[500] }} />
                <span>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    className={formErrors.name ? 'border-red-400' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter category description"
                    rows={3}
                    className={formErrors.description ? 'border-red-400' : ''}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {formErrors.submit && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600">
                      {formErrors.submit}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ 
                      background: colors.gradients.primary,
                      border: 'none'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        {editingCategory ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingCategory ? 'Update Category' : 'Create Category'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        {isLoading ? (
          <LoadingCard message="Loading categories..." />
        ) : (
          <div className="grid gap-6">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Get started by creating your first issue category.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    style={{ 
                      background: colors.gradients.primary,
                      border: 'none'
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </CardContent>
              </Card>
            ) : (
              categories.map(category => (
                <Card key={category.id} className="border-l-4" style={{ borderLeftColor: colors.primary[400] }}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-lg" style={{ background: colors.primary[100] }}>
                            <Layers className="h-5 w-5" style={{ color: colors.primary[600] }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="text-gray-600">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        {/* Category Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: colors.primary[600] }}>
                              {category.issueCount || 0}
                            </div>
                            <div className="text-sm text-gray-600">Issues</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {category.stewardCount || 0}
                            </div>
                            <div className="text-sm text-gray-600">Stewards</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {category.zoneCount || 0}
                            </div>
                            <div className="text-sm text-gray-600">Zones</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {category.avgResponseTime || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Avg Response</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="flex items-center space-x-1"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>ID: {category.id}</span>
                        </div>
                        {category.created_at && (
                          <div className="flex items-center space-x-1">
                            <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {category.updated_at && (
                          <div className="flex items-center space-x-1">
                            <span>Updated: {new Date(category.updated_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagementPage;
