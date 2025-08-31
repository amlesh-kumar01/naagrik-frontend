'use client';

import { Suspense, use } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import IssueDetailPage from '../../../components/pages/IssueDetailPage';
import { LoadingCard } from '../../../components/ui/loading';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

function ErrorFallback({ error, resetErrorBoundary }) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <h3 className="font-semibold mb-2">Something went wrong loading this issue</h3>
            <p className="text-sm mb-4">{error.message}</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetErrorBoundary}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/issues')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Issues
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function IssuePageContent({ params }) {
  const { id } = use(params);
  
  return (
    <IssueDetailPage issueId={id} />
  );
}

export default function IssuePage({ params }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={<LoadingCard message="Loading issue details..." />}>
        <IssuePageContent params={params} />
      </Suspense>
    </ErrorBoundary>
  );
}
