import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

const Dialog = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  // Use portal to render modal at document body level for true screen centering
  return createPortal(
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Only close if clicking the overlay itself, not the modal content
        if (e.target === e.currentTarget) {
          onOpenChange?.(false);
        }
      }}
    >
      <div className="modal-content w-full max-w-md sm:max-w-lg">
        {children}
      </div>
    </div>,
    document.body
  );
};

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative bg-white rounded-xl shadow-xl border border-gray-100',
      'w-full',
      'transform transition-all duration-300 ease-out',
      'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
      'p-6 overflow-hidden',
      'ring-1 ring-black/5',
      'pointer-events-auto', // Ensure content is clickable
      className
    )}
    style={{
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
    }}
    onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal content
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
