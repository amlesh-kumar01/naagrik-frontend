import * as React from 'react';
import { cn } from '../../lib/utils';
import { colors } from '../../lib/theme';

const Badge = React.forwardRef(({ className, variant = 'default', style = {}, ...props }, ref) => {
  const variants = {
    default: 'border-transparent text-white hover:opacity-80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
    warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
  };

  // Apply default background for primary badges unless custom style is provided
  let badgeStyle = { ...style };
  if (variant === 'default' && !style.background && !style.backgroundColor) {
    badgeStyle.background = colors.gradients.button;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      style={badgeStyle}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };
