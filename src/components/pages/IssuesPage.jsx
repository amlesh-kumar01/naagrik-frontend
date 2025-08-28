'use client';

import IssueList from '@/components/features/IssueList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AlertTriangle } from 'lucide-react';

const IssuesPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{
              background: 'linear-gradient(135deg, #B2B0E8 0%, #7A85C1 100%)'
            }}>
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A2A80] mb-4">
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
