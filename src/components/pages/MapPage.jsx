'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModernMapView from '@/components/features/ModernMapView';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useIssuesStore } from '@/store';
import { colors } from '../../lib/theme';
import { MapPin } from 'lucide-react';

const MapPage = () => {
  const { issues, loading, fetchIssues } = useIssuesStore();
  const router = useRouter();

  useEffect(() => {
    if (fetchIssues) {
      fetchIssues({ limit: 100 }); // Load more issues for map view
    }
  }, [fetchIssues]);

  const handleIssueClick = (issue) => {
    router.push(`/issues/${issue.id}`);
  };

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
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0">
            <ModernMapView 
              issues={issues.filter(issue => issue.latitude && issue.longitude)}
              onLocationSelect={(location) => {
                // Optional: Handle location selection if needed
                console.log('Location selected:', location);
              }}
              onIssueClick={handleIssueClick}
              height="70vh"
              showCurrentLocation={true}
              interactive={true}
              selectableLocation={false}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MapPage;
