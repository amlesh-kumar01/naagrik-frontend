import { useState, useEffect } from 'react';
import { useIssuesStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingCard } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { colors } from '../../lib/theme';
import IssueCard from './IssueCard';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  TrendingUp,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { debounce } from '@/lib/utils';

const IssueList = ({ 
  showFilters = true, 
  showSearch = true,
  showHeader = true,
  compact = false,
  limit,
  category,
  status,
  priority,
  className = ''
}) => {
  const { 
    issues, 
    isLoading: loading, 
    error, 
    fetchIssues, 
    updateIssue,
    pagination 
  } = useIssuesStore();

  const [filters, setFilters] = useState({
    search: '',
    category: category || 'all',
    status: status || 'all',
    priority: priority || 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [localIssues, setLocalIssues] = useState([]);

  useEffect(() => {
    loadIssues();
  }, [filters]);

  useEffect(() => {
    let filtered = issues;

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.address?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setLocalIssues(filtered);
  }, [issues, filters, limit]);

  const loadIssues = async () => {
    try {
      await fetchIssues({
        page: 1,
        limit: limit || 20,
        category: filters.category !== 'all' ? filters.category : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
    } catch (error) {
      console.error('Error loading issues:', error);
    }
  };

  const handleSearch = debounce((searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  }, 300);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleShare = (issue) => {
    const url = `${window.location.origin}/issues/${issue.id}`;
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleStatusUpdate = (issueId, newStatus) => {
    // Update the local issue status immediately for better UX
    setLocalIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId
          ? { ...issue, status: newStatus, updated_at: new Date().toISOString() }
          : issue
      )
    );
  };

  const handleIssueRemoved = (issueId) => {
    // Remove the issue from local state
    setLocalIssues(prevIssues =>
      prevIssues.filter(issue => issue.id !== issueId)
    );
  };

  const handleIssueUpdate = (issueId, updates) => {
    // Update the issue data immediately in local state
    setLocalIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId
          ? { ...issue, ...updates }
          : issue
      )
    );
    
    // Also update the main store
    updateIssue(issueId, updates);
  };

  const categories = [...new Set(issues.map(issue => issue.category))];
  const statuses = ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  const sortOptions = [
    { value: 'created_at', label: 'Latest' },
    { value: 'votes_count', label: 'Most Voted' },
    { value: 'comments_count', label: 'Most Discussed' },
    { value: 'title', label: 'Alphabetical' },
  ];

  if (loading && localIssues.length === 0) {
    return <LoadingCard message="Loading issues..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading issues: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadIssues}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community Issues</h2>
              <p className="text-gray-600">
                {localIssues.length} issue{localIssues.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={loadIssues}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card className="mb-6">
          <CardContent className="p-4">
            {showSearch && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search issues by title, description, or location..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full text-sm border rounded px-3 py-2"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat, index) => (
                      <option key={`category-${index}-${cat}`} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full text-sm border rounded px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    {statuses.map((status, index) => (
                      <option key={`status-${index}-${status}`} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full text-sm border rounded px-3 py-2"
                  >
                    <option value="all">All Priority</option>
                    {priorities.map((priority, index) => (
                      <option key={`priority-${index}-${priority}`} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full text-sm border rounded px-3 py-2"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Category: {filters.category}</span>
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {filters.status}</span>
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.priority !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Priority: {filters.priority}</span>
                  <button
                    onClick={() => handleFilterChange('priority', 'all')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {filters.search}</span>
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Grid/List */}
      {localIssues.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p>No issues match your current filters. Try adjusting your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {localIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onShare={handleShare}
              onStatusUpdate={handleStatusUpdate}
              onIssueRemoved={handleIssueRemoved}
              onIssueUpdate={handleIssueUpdate}
              compact={viewMode === 'list' || compact}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination?.hasMore && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => fetchIssues({ 
              page: pagination.currentPage + 1,
              append: true 
            })}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Issues'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default IssueList;
