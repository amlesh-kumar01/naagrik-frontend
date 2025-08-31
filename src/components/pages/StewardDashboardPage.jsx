'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIssuesStore, useStewardStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Award,
  MessageCircle,
  Calendar,
  FileText,
  Search,
  Filter,
  Eye,
  Edit3,
  ChevronRight
} from 'lucide-react';

const StewardDashboardPage = () => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { issues, isLoading, error, fetchIssues } = useIssuesStore();
  const { myCategories, fetchMyCategories } = useStewardStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedIssues, setAssignedIssues] = useState([]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role !== 'STEWARD' && user?.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchIssues();
    }
  }, [isInitialized, isAuthenticated, user, router, fetchIssues]);

  useEffect(() => {
    if (issues && user) {
      if (user.role === 'SUPER_ADMIN') {
        // Admins can see all issues
        setAssignedIssues(issues);
      } else {
        // Stewards only see issues assigned to them or in their zone
        const stewardIssues = issues.filter(issue => 
          issue.assignedSteward === user.id || issue.zone === user.assignedZone
        );
        setAssignedIssues(stewardIssues);
      }
    }
  }, [issues, user]);

  if (!isInitialized || isLoading) {
    return <LoadingCard />;
  }

  if (!isAuthenticated || (user?.role !== 'STEWARD' && user?.role !== 'SUPER_ADMIN')) {
    return null;
  }

  // Calculate stats
  const totalAssigned = assignedIssues.length;
  const resolved = assignedIssues.filter(issue => issue.status === 'resolved').length;
  const inProgress = assignedIssues.filter(issue => issue.status === 'in_progress').length;
  const pending = assignedIssues.filter(issue => issue.status === 'pending').length;
  const resolutionRate = totalAssigned > 0 ? Math.round((resolved / totalAssigned) * 100) : 0;

  const stats = [
    {
      title: user?.role === 'SUPER_ADMIN' ? 'Total Issues' : 'Assigned Issues',
      value: totalAssigned,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: user?.role === 'SUPER_ADMIN' ? 'Overall Resolution Rate' : 'Resolution Rate',
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentIssues = assignedIssues
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.role === 'SUPER_ADMIN' ? 'Steward Overview (Admin View)' : 'Steward Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'SUPER_ADMIN' 
                    ? `Admin oversight - ${user?.fullName}` 
                    : `Welcome back, ${user?.fullName}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user?.role === 'SUPER_ADMIN' ? (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Steward
                </Badge>
              )}
              {user?.assignedZone && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.assignedZone}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {user?.role === 'SUPER_ADMIN' ? 'All Issues' : 'Assigned Issues'}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/issues')}>
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentIssues.length > 0 ? (
                  <div className="space-y-4">
                    {recentIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/issues/${issue.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 pr-4">
                            {issue.title}
                          </h3>
                          <div className="flex space-x-2">
                            <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                              {issue.priority}
                            </Badge>
                            <Badge className={getStatusColor(issue.status)} variant="secondary">
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {issue.location?.address || 'Location not specified'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assigned issues found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Issues assigned to your zone will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Steward Info & Quick Actions */}
          <div className="space-y-6">
            {/* Steward Profile */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Steward Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                {user?.assignedZone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Assigned Zone</p>
                      <p className="text-sm text-gray-600">{user.assignedZone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Performance</p>
                    <p className="text-sm text-gray-600">{resolutionRate}% Resolution Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role === 'SUPER_ADMIN' && (
                  <Button 
                    variant="primary" 
                    className="w-full justify-start"
                    onClick={() => router.push('/admin')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/issues')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Issues
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View Issue Map
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/report/add')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Report New Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StewardDashboardPage;
