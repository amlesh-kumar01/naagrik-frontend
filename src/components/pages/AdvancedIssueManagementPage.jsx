'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIssuesStore, useZoneStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  ArrowLeft,
  ChevronDown,
  Download,
  RefreshCw,
  MessageSquare,
  Star,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';

const AdvancedIssueManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    issues,
    isLoading,
    error,
    fetchIssues,
    updateIssueStatus,
    updateIssuePriority,
    bulkUpdateStatus,
    addStewardNote,
    clearError
  } = useIssuesStore();
  
  const { zones, fetchAllZones } = useZoneStore();
  
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [noteText, setNoteText] = useState('');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'ENVIRONMENT', label: 'Environment' },
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'SAFETY', label: 'Safety' },
    { value: 'OTHER', label: 'Other' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  useEffect(() => {
    if (!isInitialized || authLoading) return;
    
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'STEWARD')) {
      router.push('/');
      return;
    }
    
    loadIssues();
    fetchAllZones();
  }, [user, router, isInitialized, authLoading, currentPage, selectedStatus, selectedPriority, selectedZone, selectedCategory, dateRange, searchTerm]);

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  const loadIssues = () => {
    const filters = {
      page: currentPage,
      limit: 20,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedStatus && { status: selectedStatus }),
      ...(selectedPriority && { priority: selectedPriority }),
      ...(selectedZone && { zone_id: selectedZone }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(dateRange && { date_range: dateRange })
    };
    fetchIssues(filters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadIssues();
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    await updateIssueStatus(issueId, newStatus);
    loadIssues();
  };

  const handlePriorityUpdate = async (issueId, newPriority) => {
    await updateIssuePriority(issueId, newPriority);
    loadIssues();
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIssues.length === 0) return;
    
    if (window.confirm(`Are you sure you want to update ${selectedIssues.length} issues to ${bulkStatus}?`)) {
      await bulkUpdateStatus(selectedIssues, bulkStatus);
      setSelectedIssues([]);
      setShowBulkActions(false);
      setBulkStatus('');
      loadIssues();
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedIssue) return;
    
    await addStewardNote(selectedIssue.id, noteText);
    setShowNoteModal(false);
    setSelectedIssue(null);
    setNoteText('');
    loadIssues();
  };

  const handleSelectIssue = (issueId) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIssues.length === issues.data?.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(issues.data?.map(issue => issue.id) || []);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
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
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A2A80]">Advanced Issue Management</h1>
                <p className="text-gray-600">Filter, analyze, and manage issues</p>
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
              {selectedIssues.length > 0 && (
                <Button
                  onClick={() => setShowBulkActions(true)}
                  className="bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              )}
              <Button
                variant="outline"
                onClick={loadIssues}
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

        {/* Advanced Filters */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search issues by title, description, or reporter..."
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {dateRangeOptions.map((option) => (
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

        {/* Issues List */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#1A2A80]">
                Issues ({issues.total || 0})
              </CardTitle>
              <div className="flex space-x-2">
                {selectedIssues.length > 0 && (
                  <Badge variant="secondary" className="bg-[#B2B0E8] text-[#1A2A80]">
                    {selectedIssues.length} selected
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
                        checked={selectedIssues.length === issues.data?.length && issues.data?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.data?.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIssues.includes(issue.id)}
                          onChange={() => handleSelectIssue(issue.id)}
                          className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {issue.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            #{issue.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={issue.status}
                          onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(issue.status)}`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={issue.priority}
                          onChange={(e) => handlePriorityUpdate(issue.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getPriorityColor(issue.priority)}`}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {getZoneName(issue.zone_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {issue.reporter_name || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {issue.created_at 
                              ? new Date(issue.created_at).toLocaleDateString()
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/issues/${issue.id}`)}
                            className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.role === 'STEWARD' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedIssue(issue);
                                setShowNoteModal(true);
                              }}
                              className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {issues.total > 20 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, issues.total)} of {issues.total} issues
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
                    disabled={currentPage * 20 >= issues.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {issues.data?.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mt-8">
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Issues Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions Modal */}
        {showBulkActions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1A2A80]">Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status for {selectedIssues.length} issues
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                  >
                    <option value="">Select new status...</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatus}
                    className="flex-1 bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                  >
                    Update Issues
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkActions(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Note Modal */}
        {showNoteModal && selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#1A2A80]">Add Steward Note</CardTitle>
                <p className="text-sm text-gray-600">Issue: {selectedIssue.title}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your note here..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="flex-1 bg-gradient-to-r from-[#3B38A0] to-[#1A2A80] hover:from-[#1A2A80] hover:to-[#3B38A0] text-white"
                  >
                    Add Note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNoteModal(false);
                      setSelectedIssue(null);
                      setNoteText('');
                    }}
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

export default AdvancedIssueManagementPage;
