'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '../../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Alert, AlertDescription } from '../../ui/alert';
import { LoadingCard } from '../../ui/loading';
import { colors } from '../../../lib/theme';
import { 
  Users,
  Search,
  Filter,
  Edit3,
  Ban,
  UserCheck,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  Download,
  RefreshCw
} from 'lucide-react';

const UserManagementPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    users,
    isLoading,
    error,
    fetchFilteredUsers,
    updateUserRole,
    updateUserStatus,
    updateUserReputation,
    clearError
  } = useAdminStore();
  
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'STEWARD', label: 'Steward' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'BANNED', label: 'Banned' }
  ];

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    loadUsers();
  }, [user, router, isInitialized, authLoading, currentPage, selectedRole, selectedStatus, searchTerm]);

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

  const loadUsers = () => {
    const filters = {
      page: currentPage,
      limit: 20,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedRole && { role: selectedRole }),
      ...(selectedStatus && { status: selectedStatus })
    };
    fetchFilteredUsers(filters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await updateUserRole(userId, newRole);
      loadUsers();
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const action = newStatus === 'SUSPENDED' ? 'suspend' : newStatus === 'BANNED' ? 'ban' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      await updateUserStatus(userId, newStatus);
      loadUsers();
    }
  };

  const handleReputationUpdate = async (userId, newReputation) => {
    const reputation = parseInt(newReputation);
    if (isNaN(reputation) || reputation < 0) return;
    
    await updateUserReputation(userId, reputation);
    loadUsers();
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.data?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.data?.map(user => user.id) || []);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'STEWARD': return 'bg-blue-100 text-blue-800';
      case 'CITIZEN': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              style={{ color: colors.primary[400] }}
              className="transition-colors hover:opacity-80"
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A2A80]">User Management</h1>
                <p className="text-gray-600">Manage users, roles, and permissions</p>
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
              <Button
                variant="outline"
                onClick={loadUsers}
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
                    placeholder="Search users by name, email, or phone..."
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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

        {/* Users List */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#1A2A80]">
                Users ({users.total || 0})
              </CardTitle>
              <div className="flex space-x-2">
                {selectedUsers.length > 0 && (
                  <Badge variant="secondary" className="bg-[#B2B0E8] text-[#1A2A80]">
                    {selectedUsers.length} selected
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
                        checked={selectedUsers.length === users.data?.length && users.data?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.data?.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(userData.id)}
                          onChange={() => handleSelectUser(userData.id)}
                          className="rounded border-gray-300 text-[#3B38A0] focus:ring-[#3B38A0]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7A85C1] to-[#3B38A0] flex items-center justify-center text-white font-semibold">
                            {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userData.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{userData.email}</span>
                            </div>
                            {userData.phone && (
                              <div className="text-sm text-gray-500 flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{userData.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getRoleColor(userData.role)}`}
                        >
                          <option value="CITIZEN">Citizen</option>
                          <option value="STEWARD">Steward</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={userData.status}
                          onChange={(e) => handleStatusChange(userData.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(userData.status)}`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="BANNED">Banned</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <input
                            type="number"
                            value={userData.reputation_score || 0}
                            onChange={(e) => handleReputationUpdate(userData.id, e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            min="0"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {userData.issues_count || 0} reported
                        </div>
                        <div className="text-sm text-gray-500">
                          {userData.resolved_issues_count || 0} resolved
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {userData.created_at 
                              ? new Date(userData.created_at).toLocaleDateString()
                              : 'Unknown'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${userData.id}`)}
                          className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {users.total > 20 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, users.total)} of {users.total} users
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
                    disabled={currentPage * 20 >= users.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {users.data?.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm mt-8">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
