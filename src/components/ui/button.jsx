import * as React from 'react';
import { cn } from '../../lib/utils';
import { colors } from '../../lib/theme';

const buttonVariants = {
  variant: {
    default: `text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:scale-95`,
    destructive: `bg-red-500 text-white hover:bg-red-600 shadow-lg font-medium`,
    outline: `border-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-transparent to-transparent hover:from-gray-800 hover:to-gray-900 hover:text-white hover:border-transparent ring-offset-2 hover:ring-2 hover:ring-gray-400`,
    secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium shadow-sm`,
    ghost: `hover:bg-gray-100 text-gray-900 font-medium transition-colors`,
    link: `text-blue-600 underline-offset-4 hover:underline font-medium`,
    primary: `text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105`,
    success: `bg-green-500 text-white hover:bg-green-600 shadow-lg font-medium`,
    warning: `bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg font-medium`,
  },
  size: {
    default: "h-11 px-6 py-2.5 text-sm",
    sm: "h-9 rounded-md px-4 text-xs",
    lg: "h-13 rounded-lg px-8 py-3 text-base",
    icon: "h-10 w-10",
  },
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false,
  style = {},
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default;
  
  // Apply enhanced styling for different button variants
  let buttonStyle = { ...style };
  
  if (variant === "default" && !style.background && !style.backgroundColor) {
    buttonStyle.background = `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 50%, ${colors.primary[600]} 100%)`;
    buttonStyle.boxShadow = `0 4px 15px rgba(26, 42, 128, 0.3)`;
  }
  
  if (variant === "primary" && !style.background && !style.backgroundColor) {
    buttonStyle.background = `linear-gradient(135deg, ${colors.primary[300]} 0%, ${colors.primary[400]} 50%, ${colors.primary[500]} 100%)`;
    buttonStyle.boxShadow = `0 4px 15px rgba(59, 56, 160, 0.4)`;
  }
  
  if (variant === "outline" && !style.borderColor) {
    buttonStyle.borderImage = 'linear-gradient(135deg, #374151, #111827) 1';
    buttonStyle.color = '#374151';
    buttonStyle.background = 'rgba(255, 255, 255, 0.95)';
    buttonStyle.backdropFilter = 'blur(12px)';
    buttonStyle.boxShadow = '0 4px 20px rgba(55, 65, 81, 0.15)';
  }
  
  if (variant === "success" && !style.background) {
    buttonStyle.background = `linear-gradient(135deg, #10B981 0%, #059669 100%)`;
    buttonStyle.boxShadow = `0 4px 15px rgba(16, 185, 129, 0.3)`;
  }
  
  if (variant === "warning" && !style.background) {
    buttonStyle.background = `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`;
    buttonStyle.boxShadow = `0 4px 15px rgba(245, 158, 11, 0.3)`;
  }
  
  const classes = cn(baseClasses, variantClasses, sizeClasses, className);

  if (asChild) {
    return React.cloneElement(props.children, {
      className: classes,
      ref,
      ...props
    });
  }

  return (
    <button
      className={classes}
      style={buttonStyle}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
