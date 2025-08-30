'use client';

import { colors } from '../../lib/theme';

const PageBackground = ({ 
  children, 
  variant = 'secondary', 
  className = '',
  style = {} 
}) => {
  const getBackground = () => {
    switch (variant) {
      case 'primary':
        return colors.gradients.primary;
      case 'secondary':
        return colors.gradients.secondary;
      case 'auth':
        return colors.gradients.primary;
      case 'admin':
        return colors.gradients.secondary;
      default:
        return colors.gradients.secondary;
    }
  };

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{ 
        background: getBackground(),
        ...style 
      }}
    >
      {children}
    </div>
  );
};

export default PageBackground;
