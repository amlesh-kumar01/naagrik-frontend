'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDashboardStore, useAdminStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { colors } from '../../lib/theme';
import { 
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Clock,
  Star,
  Award,
  MapPin,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    adminOverview,
    userActivity,
    stewardPerformance,
    resolutionTimeStats,
    criticalIssues,
    isLoading: dashboardLoading,
    error: dashboardError,
    fetchAllDashboardData
  } = useDashboardStore();
  const { 
    userStatistics,
    isLoading: adminLoading,
    error: adminError,
    fetchUserStatistics
  } = useAdminStore();
  
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Wait for auth to be initialized before checking user
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    loadDashboardData();
  }, [user, router, isInitialized, authLoading]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        fetchAllDashboardData('SUPER_ADMIN'),
        fetchUserStatistics()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

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

  if (dashboardLoading || adminLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  const systemStats = adminOverview?.systemStats || {};
  const userStats = userStatistics || {};

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl" style={{
                background: colors.gradients.primaryReverse
              }}>
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: colors.primary[500] }}>Admin Dashboard</h1>
                <p className="text-gray-600">System overview and management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => router.push('/admin/zones')}
                style={{ background: colors.gradients.button }}
                className="text-white hover:opacity-90 transition-opacity"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Quick Setup
              </Button>
            </div>
          </div>
        </div>

        {(dashboardError || adminError) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {dashboardError || adminError}
            </AlertDescription>
          </Alert>
        )}

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: colors.gradients.card
              }}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                {systemStats.total_users?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xs text-green-600 mt-1">
                +{systemStats.users_today || 0} today
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: colors.gradients.cardBlue
              }}>
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                {systemStats.total_issues?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Total Issues</div>
              <div className="text-xs text-blue-600 mt-1">
                {systemStats.open_issues || 0} open
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: colors.gradients.cardPurple
              }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                {systemStats.total_stewards || '0'}
              </div>
              <div className="text-sm text-gray-600">Active Stewards</div>
              <div className="text-xs text-purple-600 mt-1">
                {systemStats.pending_applications || 0} pending
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3" style={{
                background: colors.gradients.cardOrange
              }}>
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.primary[500] }}>
                {systemStats.resolved_issues || '0'}
              </div>
              <div className="text-sm text-gray-600">Resolved Issues</div>
              <div className="text-xs text-orange-600 mt-1">
                {((systemStats.resolved_issues / systemStats.total_issues) * 100).toFixed(1) || 0}% resolution rate
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle style={{ color: colors.primary[500] }} className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/admin/users')}
                variant="outline"
                className="w-full justify-start transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <Users className="h-4 w-4 mr-3" />
                Manage Users
              </Button>
              
              <Button
                onClick={() => router.push('/admin/stewards')}
                variant="outline"
                className="w-full justify-start transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <Shield className="h-4 w-4 mr-3" />
                Steward Management
              </Button>
              
              <Button
                onClick={() => router.push('/admin/zones')}
                variant="outline"
                className="w-full justify-start transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <MapPin className="h-4 w-4 mr-3" />
                Zone Management
              </Button>
              
              <Button
                onClick={() => router.push('/admin/badges')}
                variant="outline"
                className="w-full justify-start transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <Award className="h-4 w-4 mr-3" />
                Badge System
              </Button>
              
              <Button
                onClick={() => router.push('/admin/issues')}
                variant="outline"
                className="w-full justify-start transition-colors"
                style={{
                  borderColor: colors.primary[300],
                  color: colors.primary[400]
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primary[300];
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.primary[400];
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-3" />
                Advanced Issues
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle style={{ color: colors.primary[500] }} className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Issues reported today</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {systemStats.issues_today || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Issues resolved today</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {systemStats.resolved_today || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">New users today</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {systemStats.users_today || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pending applications</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {systemStats.pending_applications || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Critical Issues */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle style={{ color: colors.primary[500] }} className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Critical Issues
              </CardTitle>
              <Button
                onClick={() => router.push('/admin/issues')}
                variant="ghost"
                size="sm"
                className="text-[#3B38A0] hover:bg-[#B2B0E8]/20"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {criticalIssues && criticalIssues.length > 0 ? (
                <div className="space-y-3">
                  {criticalIssues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {issue.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {issue.category} • {issue.votes} votes
                        </p>
                      </div>
                      <Badge variant="destructive" className="flex-shrink-0">
                        {issue.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-gray-500">No critical issues</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Stewards */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle style={{ color: colors.primary[500] }} className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performing Stewards
              </CardTitle>
              <Button
                onClick={() => router.push('/admin/stewards')}
                variant="ghost"
                size="sm"
                style={{ color: colors.primary[400] }}
                className="transition-colors hover:opacity-80"
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary[100] + '20'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {stewardPerformance && stewardPerformance.length > 0 ? (
                <div className="space-y-3">
                  {stewardPerformance.slice(0, 5).map((steward, index) => (
                    <div key={steward.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-700">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {steward.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {steward.resolved_issues} resolved • {steward.zones?.length || 0} zones
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A2A80]">
                          {steward.performance_score}%
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No steward data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
