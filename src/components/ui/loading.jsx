import * as React from 'react';
import { cn } from '../../lib/utils';

const Spinner = ({ className, size = 'default' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizes[size],
        className
      )}
    />
  );
};

const LoadingSpinner = ({ size = 'default', className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Spinner size={size} />
    </div>
  );
};

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

const LoadingCard = ({ message = 'Loading...', className }) => {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="text-center">
        <LoadingSpinner className="mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export { Spinner, LoadingSpinner, LoadingPage, LoadingCard };
