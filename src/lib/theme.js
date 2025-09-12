// Centralized color management for Naagrik application
export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Gradient definitions
  gradients: {
    primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    primaryReverse: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    secondary: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    button: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    buttonPrimary: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    buttonHover: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    buttonSuccess: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    buttonWarning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    buttonDanger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    card: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    cardBlue: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    cardPurple: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    cardOrange: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
  
  // Status colors
  status: {
    active: '#10B981',
    inactive: '#6B7280',
    suspended: '#F59E0B',
    banned: '#EF4444',
  },
  
  // Role colors
  roles: {
    citizen: {
      bg: '#DBEAFE',
      text: '#1D4ED8',
    },
    steward: {
      bg: '#D1FAE5',
      text: '#059669',
    },
    super_admin: {
      bg: '#F3E8FF',
      text: '#7C3AED',
    },
  },
  
  // Priority colors
  priority: {
    low: {
      bg: '#D1FAE5',
      text: '#059669',
    },
    medium: {
      bg: '#FEF3C7',
      text: '#D97706',
    },
    high: {
      bg: '#FED7AA',
      text: '#EA580C',
    },
    critical: {
      bg: '#FEE2E2',
      text: '#DC2626',
    },
  },
  
  // Issue status colors
  issueStatus: {
    open: {
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    in_progress: {
      bg: '#FEF3C7',
      text: '#D97706',
    },
    resolved: {
      bg: '#D1FAE5',
      text: '#059669',
    },
    closed: {
      bg: '#F3F4F6',
      text: '#6B7280',
    },
  },
};

// Helper functions for easy color access
export const getGradient = (type) => colors.gradients[type];
export const getPrimaryColor = (shade = 400) => colors.primary[shade];
export const getSemanticColor = (type) => colors.semantic[type];

// CSS custom properties for dynamic theming
export const cssVariables = {
  '--color-primary-50': colors.primary[50],
  '--color-primary-100': colors.primary[100],
  '--color-primary-200': colors.primary[200],
  '--color-primary-300': colors.primary[300],
  '--color-primary-400': colors.primary[400],
  '--color-primary-500': colors.primary[500],
  '--color-primary-600': colors.primary[600],
  '--color-primary-700': colors.primary[700],
  '--color-primary-800': colors.primary[800],
  '--color-primary-900': colors.primary[900],
  '--gradient-primary': colors.gradients.primary,
  '--gradient-button': colors.gradients.button,
  '--gradient-button-hover': colors.gradients.buttonHover,
};

// Component-specific color utilities
export const componentColors = {
  header: {
    background: colors.gradients.primary,
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    activeTab: {
      background: '#ffffff',
      text: colors.primary[600],
    },
    hover: 'rgba(255, 255, 255, 0.2)',
  },
  
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(255, 255, 255, 0)',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  
  button: {
    primary: {
      background: colors.gradients.button,
      backgroundHover: colors.gradients.buttonHover,
      text: '#ffffff',
    },
    secondary: {
      background: 'transparent',
      border: colors.primary[300],
      text: colors.primary[600],
      backgroundHover: colors.primary[300],
      textHover: '#ffffff',
    },
  },
  
  admin: {
    dropdown: {
      background: '#ffffff',
      border: '#e5e7eb',
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      itemHover: '#f9fafb',
      activeItem: {
        background: 'rgba(187, 247, 208, 0.1)',
        border: colors.primary[400],
        text: colors.primary[600],
      },
    },
  },
};

export default colors;
