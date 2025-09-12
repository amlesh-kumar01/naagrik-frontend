'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDashboardStore } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingCard } from '../ui/loading';
import { 
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  PieChart,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { colors } from '../../lib/theme';

const AnalyticsPage = () => {
  const { user, isInitialized, isLoading: authLoading } = useAuthStore();
  const { 
    adminOverview,
    isLoading,
    error,
    fetchAdminOverview,
    clearError
  } = useDashboardStore();
  
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!isInitialized || authLoading) return;
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    
    loadData();
  }, [user, router, isInitialized, authLoading, selectedPeriod]);

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </div>
    );
  }

  const loadData = async () => {
    setRefreshing(true);
    await fetchAdminOverview();
    setRefreshing(false);
  };

  const systemStats = adminOverview || {};

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
                background: 'linear-gradient(135deg, #7A85C1 0%, #3B38A0 100%)'
              }}>
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A2A80]">Analytics & Reports</h1>
                <p className="text-gray-600">System performance and insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B38A0] focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <Button
                onClick={loadData}
                disabled={refreshing}
                variant="outline"
                className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                className="border-[#7A85C1] text-[#3B38A0] hover:bg-[#7A85C1] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-[#1A2A80]">
                    {systemStats.total_users?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600">
                    +{systemStats.users_growth || 0}% vs last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-[#1A2A80]">
                    {systemStats.resolution_rate || '0'}%
                  </p>
                  <p className="text-sm text-green-600">
                    +{systemStats.resolution_growth || 0}% improvement
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-3xl font-bold text-[#1A2A80]">
                    {systemStats.avg_response_time || '0'}h
                  </p>
                  <p className="text-sm text-green-600">
                    -{systemStats.response_improvement || 0}% faster
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
                  <p className="text-3xl font-bold text-[#1A2A80]">
                    {systemStats.satisfaction_score || '0'}/5
                  </p>
                  <p className="text-sm text-green-600">
                    +{systemStats.satisfaction_growth || 0}% higher
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Issues Trend Chart */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Issues Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chart visualization would be here</p>
                  <p className="text-sm text-gray-400">Integration with Chart.js or similar library</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Pie chart visualization would be here</p>
                  <p className="text-sm text-gray-400">Showing issue distribution by category</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Zones */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Top Performing Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#7A85C1] to-[#3B38A0] rounded-full flex items-center justify-center text-white font-semibold">
                        {rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Zone {rank}</p>
                        <p className="text-sm text-gray-500">95% resolution rate</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#1A2A80] flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'New user registered', time: '2 minutes ago', type: 'user' },
                  { action: 'Issue resolved in Zone 1', time: '5 minutes ago', type: 'success' },
                  { action: 'New steward approved', time: '10 minutes ago', type: 'steward' },
                  { action: 'Critical issue reported', time: '15 minutes ago', type: 'alert' },
                  { action: 'System backup completed', time: '1 hour ago', type: 'system' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'alert' ? 'bg-red-500' :
                      activity.type === 'steward' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
