'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore, useZoneStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { 
  Shield,
  Search,
  Filter,
  Edit3,
  UserPlus,
  UserMinus,
  Star,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Download,
  RefreshCw,
  Users,
  BarChart3
} from 'lucide-react';

const StewardManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    stewards,
    isLoading: adminLoading,
    error,
    fetchStewards,
    assignStewardToZone,
    removeStewardFromZone,
    bulkAssignStewards,
    clearError
  } = useAdminStore();
  
  const {
    zones,
    fetchAllZones
  } = useZoneStore();
  
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStewards, setSelectedStewards] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentZone, setAssignmentZone] = useState('');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    loadStewards();
    fetchAllZones();
  }, [user, router, isInitialized, authLoading, currentPage, selectedZone, selectedStatus, searchTerm]);

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

  const loadStewards = () => {
    const filters = {
      page: currentPage,
      limit: 20,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedZone && { zone_id: selectedZone }),
      ...(selectedStatus && { status: selectedStatus })
    };
    fetchStewards(filters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStewards();
  };

  const handleAssignToZone = async (stewardId, zoneId) => {
    if (window.confirm('Are you sure you want to assign this steward to the selected zone?')) {
      await assignStewardToZone(stewardId, zoneId);
      loadStewards();
    }
  };

  const handleRemoveFromZone = async (stewardId, zoneId) => {
    if (window.confirm('Are you sure you want to remove this steward from their zone?')) {
      await removeStewardFromZone(stewardId, zoneId);
      loadStewards();
    }
  };

  const handleBulkAssign = async () => {
    if (!assignmentZone || selectedStewards.length === 0) return;
    
    if (window.confirm(`Are you sure you want to assign ${selectedStewards.length} stewards to the selected zone?`)) {
      await bulkAssignStewards(selectedStewards, assignmentZone);
      setShowAssignModal(false);
      setSelectedStewards([]);
      setAssignmentZone('');
      loadStewards();
    }
  };

  const handleSelectSteward = (stewardId) => {
    setSelectedStewards(prev => 
      prev.includes(stewardId) 
        ? prev.filter(id => id !== stewardId)
        : [...prev, stewardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStewards.length === stewards.data?.length) {
      setSelectedStewards([]);
    } else {
      setSelectedStewards(stewards.data?.map(steward => steward.id) || []);
    }
  };

  const getPerformanceColor = (resolved, total) => {
    if (total === 0) return 'text-gray-500';
    const ratio = resolved / total;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unassigned';
  };

  const isLoading = adminLoading;

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
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{
                background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
              }}>
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A2A80]">Steward Management</h1>
                <p className="text-gray-600">Manage stewards and zone assignments</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {selectedStewards.length > 0 && (
                <Button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Bulk Assign
                </Button>
              )}
              <Button
                variant="outline"
                onClick={loadStewards}
                className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search stewards by name, email, or zone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      <option value="">All Zones</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Stewards List */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#1A2A80]">
                Stewards ({stewards.total || 0})
              </CardTitle>
              <div className="flex space-x-2">
                {selectedStewards.length > 0 && (
                  <Badge variant="secondary" className="bg-[#B2B0E8] text-[#1A2A80]">
                    {selectedStewards.length} selected
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStewards.length === stewards.data?.length && stewards.data?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Steward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issues Handled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stewards.data?.map((steward) => (
                    <tr key={steward.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStewards.includes(steward.id)}
                          onChange={() => handleSelectSteward(steward.id)}
                          className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7A85C1] to-[#3B38A0] flex items-center justify-center text-white font-semibold">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {steward.name || 'Unknown Steward'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {steward.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {getZoneName(steward.zone_id)}
                          </span>
                        </div>
                        {steward.zone_id && (
                          <select
                            value={steward.zone_id || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignToZone(steward.id, e.target.value);
                              } else {
                                handleRemoveFromZone(steward.id, steward.zone_id);
                              }
                            }}
                            className="mt-1 text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="">Unassigned</option>
                            {zones.map((zone) => (
                              <option key={zone.id} value={zone.id}>
                                {zone.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-medium ${getPerformanceColor(
                            steward.resolved_issues || 0,
                            steward.total_issues || 0
                          )}`}>
                            {steward.total_issues > 0 
                              ? `${Math.round((steward.resolved_issues / steward.total_issues) * 100)}%`
                              : '0%'
                            }
                          </div>
                          {steward.total_issues > 0 && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#3B38A0] to-[#7A85C1] h-2 rounded-full"
                                style={{
                                  width: `${(steward.resolved_issues / steward.total_issues) * 100}%`
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {steward.total_issues || 0} total
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{steward.resolved_issues || 0} resolved</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {steward.avg_response_time 
                              ? `${steward.avg_response_time}h avg`
                              : 'No data'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-900">
                            {steward.rating ? steward.rating.toFixed(1) : 'No rating'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/stewards/${steward.id}`)}
                            className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${steward.id}`)}
                            className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {stewards.total > 20 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, stewards.total)} of {stewards.total} stewards
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage * 20 >= stewards.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {stewards.data?.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mt-8">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stewards Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}

        {/* Bulk Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1A2A80]">Bulk Assign to Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Zone
                  </label>
                  <select
                    value={assignmentZone}
                    onChange={(e) => setAssignmentZone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                  >
                    <option value="">Select a zone...</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleBulkAssign}
                    disabled={!assignmentZone}
                    className="flex-1 bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                  >
                    Assign {selectedStewards.length} Stewards
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
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

export default StewardManagementPage;
