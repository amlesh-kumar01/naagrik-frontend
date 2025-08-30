'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { colors } from '../lib/theme';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto px-6 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="text-left bg-gray-100 p-3 rounded text-xs text-gray-700 mb-4">
              <code className="break-all">{error.message}</code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            If this problem persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
