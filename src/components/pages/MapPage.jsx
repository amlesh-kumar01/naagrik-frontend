'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveMap from '@/components/features/InteractiveMap';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { LoadingCard } from '@/components/ui/loading';
import { useIssuesStore } from '@/store';
import { colors } from '../../lib/theme';
import { MapPin } from 'lucide-react';

const MapPage = () => {
  const { issues, isLoading, fetchIssues } = useIssuesStore();
  const router = useRouter();

  useEffect(() => {
    fetchIssues({ limit: 100 }); // Load more issues for map view
  }, [fetchIssues]);

  const handleIssueClick = (issue) => {
    router.push(`/issues/${issue.id}`);
  };

  // Process issues for map display
  const mapIssues = issues.filter(issue => issue.location_lat && issue.location_lng).map(issue => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    location_lat: parseFloat(issue.location_lat),
    location_lng: parseFloat(issue.location_lng),
    status: issue.status,
    priority: issue.priority || 'MEDIUM',
    category: issue.category_name || 'General',
    address: issue.address,
    created_at: issue.created_at
  }));

  console.log('Map markers to display:', mapIssues.length, mapIssues);

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{
              background: colors.gradients.primary
            }}>
              <MapPin className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: colors.primary[500] }}>
              Community Issues Map
            </h1>
            <p className="text-lg text-gray-600">
              Explore reported issues in your community on an interactive map. 
              {mapIssues.length > 0 && (
                <span className="font-semibold text-blue-600"> ({mapIssues.length} issues shown)</span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden flex items-center justify-center" style={{ height: '70vh' }}>
              <LoadingCard message="Loading issues map..." />
            </div>
          ) : mapIssues.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden flex items-center justify-center" style={{ height: '70vh' }}>
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Issues to Display</h3>
                <p className="text-gray-500">No issues with location data found in your area.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
              <InteractiveMap 
                issues={mapIssues}
                onIssueClick={handleIssueClick}
                height="70vh"
                showCurrentLocation={true}
                enableLocationSelection={false}
                className="rounded-2xl"
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MapPage;
