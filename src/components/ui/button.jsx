import * as React from 'react';
import { cn } from '../../lib/utils';
import { colors } from '../../lib/theme';

const buttonVariants = {
  variant: {
    default: `text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    destructive: `text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    outline: `font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0`,
    secondary: `text-gray-900 font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    ghost: `font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    link: `text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200`,
    primary: `text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    success: `text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
    warning: `text-white font-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`,
  },
  size: {
    default: "h-11 px-6 py-2.5 text-sm rounded-xl",
    sm: "h-9 rounded-lg px-4 text-xs",
    lg: "h-13 rounded-xl px-8 py-3 text-base",
    icon: "h-10 w-10 rounded-lg",
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
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default;
  
  // Apply professional styling for different button variants
  let buttonStyle = { ...style };
  
  if (variant === "default" && !style.background && !style.backgroundColor) {
    buttonStyle.background = colors.gradients.button;
    buttonStyle.boxShadow = `0 8px 24px rgba(26, 42, 128, 0.15), 0 4px 8px rgba(26, 42, 128, 0.1)`;
    buttonStyle.border = 'none';
  }
  
  if (variant === "primary" && !style.background && !style.backgroundColor) {
    buttonStyle.background = colors.gradients.buttonPrimary;
    buttonStyle.boxShadow = `0 8px 24px rgba(59, 56, 160, 0.2), 0 4px 8px rgba(59, 56, 160, 0.15)`;
    buttonStyle.border = 'none';
  }
  
  if (variant === "outline" && !style.borderColor) {
    buttonStyle.background = 'rgba(255, 255, 255, 0.8)';
    buttonStyle.backdropFilter = 'blur(12px)';
    buttonStyle.border = '1px solid rgba(55, 65, 81, 0.2)';
    buttonStyle.color = colors.primary[600];
    buttonStyle.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)';
  }
  
  if (variant === "secondary" && !style.background) {
    buttonStyle.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    buttonStyle.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)';
    buttonStyle.border = '1px solid rgba(203, 213, 225, 0.6)';
  }
  
  if (variant === "ghost" && !style.background) {
    buttonStyle.background = 'transparent';
    buttonStyle.color = 'inherit';
    buttonStyle.border = 'none';
    buttonStyle.boxShadow = 'none';
  }
  
  if (variant === "success" && !style.background) {
    buttonStyle.background = colors.gradients.buttonSuccess;
    buttonStyle.boxShadow = `0 8px 24px rgba(16, 185, 129, 0.2), 0 4px 8px rgba(16, 185, 129, 0.15)`;
    buttonStyle.border = 'none';
  }
  
  if (variant === "warning" && !style.background) {
    buttonStyle.background = colors.gradients.buttonWarning;
    buttonStyle.boxShadow = `0 8px 24px rgba(245, 158, 11, 0.2), 0 4px 8px rgba(245, 158, 11, 0.15)`;
    buttonStyle.border = 'none';
  }
  
  if (variant === "destructive" && !style.background) {
    buttonStyle.background = colors.gradients.buttonDanger;
    buttonStyle.boxShadow = `0 8px 24px rgba(239, 68, 68, 0.2), 0 4px 8px rgba(239, 68, 68, 0.15)`;
    buttonStyle.border = 'none';
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
      className={`${classes} button-component`}
      style={buttonStyle}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
