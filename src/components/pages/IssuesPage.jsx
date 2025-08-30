'use client';

import IssueList from '@/components/features/IssueList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { colors } from '../../lib/theme';
import { AlertTriangle } from 'lucide-react';

const IssuesPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: colors.gradients.secondary }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{
              background: colors.gradients.primary
            }}>
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: colors.primary[500] }}>
              Community Issues
            </h1>
            <p className="text-lg text-gray-600">
              Browse and search reported issues in your community.
            </p>
          </div>

          <IssueList />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default IssuesPage;
